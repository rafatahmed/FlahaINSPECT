import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, StatusBar, View } from 'react-native';
import * as Picker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import * as SplashScreen from 'expo-splash-screen';
import { ApiError, api, login, logout, origin, restore, type Project, type Session } from './api';
import { db, list, photoFile, save, sync, type Category } from './observations';
import { LoginScreen } from './login-screen';
import { InspectionList } from './inspection-list';
import { AssignedProjects } from './assigned-projects';
import { FindingsScreen } from './findings-screen';
import { ProjectsPreview } from './projects-preview';
import { ReportsPreview } from './reports-preview';

import { ProjectMap } from './project-map';
import { color } from './field-brand';

import { CaptureScreen, type Draft } from './capture-screen';

// Hand off the OS launch screen to the same branded view inside Metro previews.
void SplashScreen.preventAutoHideAsync().catch(() => {});
const splashDurationMs = 1500;

const freeMB = () => Paths.availableDiskSpace / (1024 * 1024);
function requireSpace() {
  if (freeMB() < 200) throw new Error('Free at least 200 MB on this device.');
}
const syncPilot = __DEV__ && process.env.EXPO_PUBLIC_API_ORIGIN === 'metro-pilot' &&
  process.env.EXPO_PUBLIC_PILOT_SYNC === '1';
// Keep the same pilot account's offline queue when Metro issues a new tunnel address.
const ownerKey = (s: Session) =>
  ((syncPilot && process.env.EXPO_PUBLIC_PILOT_STORAGE_ORIGIN) || s.origin) + '/' + s.user.id;
const captureOnlyPilot = process.env.EXPO_PUBLIC_API_ORIGIN === 'metro-pilot' && !syncPilot;

export default function App() {
  const [preview, setPreview] = useState<'projects' | 'reports' | 'review' | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [splashLaidOut, setSplashLaidOut] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [splashShown, setSplashShown] = useState(false);
  useEffect(() => {
    if (!splashLaidOut || !logoLoaded) return;
    SplashScreen.hide();
    const timer = setTimeout(() => setSplashShown(true), splashDurationMs);
    return () => clearTimeout(timer);
  }, [splashLaidOut, logoLoaded]);
  const [page, setPage] = useState<'projects' | 'map' | 'capture' | 'work' | 'findings'>('projects');
  const [project, setProject] = useState<Project | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');
  const [syncStatuses, setSyncStatuses] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(true);
  const lock = useRef(true);

  async function open(s: Session) {
    if (!s.user.role || !['inspector', 'manager', 'client'].includes(s.user.role)) {
      await logout();
      throw new Error('Log in again to verify your workspace.');
    }
    setSession(s);
    setRestoring(false);
    await loadProjects(s);
  }
  useEffect(() => {
    restore().then(async s => { if (s) await open(s); })
      .catch(e => setMessage(String(e))).finally(() => {
        lock.current = false; setBusy(false); setRestoring(false);
      });
  }, []);
  async function run(job: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage('');
    try { await job(); } catch (error) { setMessage(String(error)); }
    finally { lock.current = false; setBusy(false); }
  }
  async function loadProjects(s: Session) {
    if (s.user.role === 'client') {
      setProjects([]); setProject(null);
      const response = await api('/client/projects');
      setProjects(response.items);
      return;
    }
    const owner = ownerKey(s);
    try {
      const pilot = process.env.EXPO_PUBLIC_API_ORIGIN === 'metro-pilot';
      const { items }: { items: Project[] } = await api(pilot ? '/projects?archived=false' : '/projects');
      // Only a previously selected, still-active project can be reopened offline.
      const cached = db.getFirstSync<Project>('SELECT id,name FROM project WHERE owner=?', owner);
      if (cached && !items.some(p => p.id === cached.id && !p.is_archived)) {
        db.runSync('DELETE FROM project WHERE owner=?', owner);
      }
      setProjects(items);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await signOut();
        throw new Error('Your session or project access changed. Log in again.');
      }
      if (!(error instanceof TypeError)) throw error;
      setProject(db.getFirstSync<Project>('SELECT id,name FROM project WHERE owner=?', owner));
      setProjects(null);
      throw new Error('Cannot reach the project service. Check your connection or use your saved project if available.');
    }
  }
  async function signOut() {
    await logout();
    setSyncStatuses({});
    setSession(null); setProject(null); setProjects(null); setPage('projects');
    setCategory(null); setDraft(null); setNote('');
  }
  async function takePhoto() {
    requireSpace();
    if (!(await Location.requestForegroundPermissionsAsync()).granted ||
        !(await Picker.requestCameraPermissionsAsync()).granted) throw new Error('Allow camera and location access.');
    const result = await Picker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled) return;
    const time = new Date().toISOString();
    const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const image = result.assets[0];
    const context = ImageManipulator.manipulate(image.uri);
    if (Math.max(image.width, image.height) > 1920) {
      context.resize(image.width >= image.height ? { width: 1920 } : { height: 1920 });
    }
    const jpeg = await (await context.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    setDraft({ uri: jpeg.uri, time, fix: fix.coords });
  }
  const owner = session ? ownerKey(session) : '';
  const rows = session && session.user.role !== 'client' ? list(owner) : [];
  if (restoring || !splashShown) return <View onLayout={() => setSplashLaidOut(true)} style={{ flex: 1, backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
    <StatusBar barStyle="light-content" />
    <Image source={require('./assets/logo-white.png')} accessibilityLabel="FlahaINSPECT" onLoadEnd={() => setLogoLoaded(true)} style={{ width: 140, height: 140 }} />
    <ActivityIndicator accessibilityLabel="Restoring session" color={color.accent} />
  </View>;
  const previewAvailable = __DEV__ && !origin && !session;
  if (previewAvailable && preview === 'projects') return <ProjectsPreview onExit={() => setPreview(null)} />;
  if (previewAvailable && preview === 'review') return <ProjectsPreview startInReview onExit={() => setPreview(null)} />;
  if (previewAvailable && preview === 'reports') return <ReportsPreview onExit={() => setPreview(null)} />;
  if (!session) return <LoginScreen origin={origin} busy={busy} message={message}
    onPreview={previewAvailable ? setPreview : undefined}
    onLogin={(email, password) => run(async () => {
      await open(await login(email, password));
    })} />;
  const pending = new Map<string, number>();
  const projectRows = rows.filter(row => {
    const { project_id } = JSON.parse(row.point);
    if (!row.ready) pending.set(project_id, (pending.get(project_id) ?? 0) + 1);
    return project_id === project?.id;
  });
  function back() {
    if (busy) return;
    if (page === 'capture' && (draft || category || note)) {
      Alert.alert('Discard this observation?', 'The draft has not been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {
          setDraft(null); setNote(''); setCategory(null); setMessage(''); setPage('map');
        } },
      ]);
      return;
    }
    setMessage('');
    setPage(page === 'map' || session?.user.role === 'client' ? 'projects' : 'map');
  }
  return <>
    <AssignedProjects profile={session.user} role={session.user.role} projects={projects ?? (project ? [project] : [])} pending={pending}
      cached={projects === null && !!project} busy={busy} message={message}
      onRefresh={() => run(() => loadProjects(session))} onSignOut={() => run(signOut)}
      onSelect={p => run(async () => {
        if (session.user.role === 'client') { setProject(p); setPage('findings'); return; }
        if (!p.is_archived) db.runSync('INSERT OR REPLACE INTO project(owner,id,name) VALUES(?,?,?)', owner, p.id, p.name);
        setProject(p); setPage('map');
      })} />
    <Modal visible={page !== 'projects' && !!project} animationType="slide" presentationStyle="pageSheet"
      onRequestClose={back} allowSwipeDismissal={page === 'map' && !busy}>
      {page === 'findings' && project && session.user.role !== 'inspector' ? <FindingsScreen key={project.id} project={project} manager={session.user.role === 'manager'} onBack={back}/> :
      page === 'map' && project ? <ProjectMap onReview={session.user.role === 'manager' ? () => setPage('findings') : undefined} project={project} rows={projectRows.map(row => ({
        id: row.id, point: row.point, image: { uri: photoFile(row.photo).uri },
      }))} onBack={back} onCapture={() => {setMessage(''); setPage('capture');}}
        onWork={() => {setMessage(''); setPage('work');}} /> :
      page === 'capture' && project && !project.is_archived ? <CaptureScreen projectName={project.name} draft={draft}
        category={category} note={note} freeMB={freeMB()} busy={busy} message={message}
        onBack={back} onPhoto={() => run(takePhoto)} onCategory={setCategory} onNote={setNote}
        onPin={pin => setDraft(previous => previous && { ...previous, pin })}
        onSave={() => run(async () => {
          if (!draft || !category) return;
          requireSpace();
          const location = draft.pin ?? draft.fix;
          await save(owner, { client_uuid: randomUUID(), project_id: project.id, category, note, captured_at: draft.time,
            latitude: location.latitude, longitude: location.longitude, accuracy_m: draft.fix.accuracy,
            location_adjusted: !!draft.pin }, draft.uri);
          setDraft(null); setNote(''); setCategory(null); setPage('work'); setMessage('Saved locally — pending sync.');
        })}/> :
      project && <InspectionList projectName={project.name} busy={busy} message={message}
        onBack={back} onSignOut={() => run(signOut)}
        items={projectRows.map(row => {
          const point = JSON.parse(row.point);
          return { id: row.id, category: point.category, capturedAt: point.captured_at, note: point.note,
            ready: !!row.ready, syncStatus: syncStatuses[row.id] ?? (row.upload ? 'Photo upload started - check to resume' : undefined),
            photo: { uri: photoFile(row.photo).uri } };
        })}
        onSync={captureOnlyPilot ? undefined : id => run(async () => {
          const row = projectRows.find(r => r.id === id);
          if (!row) return;
          const update = (status: string) => setSyncStatuses(current => ({ ...current, [id]: status }));
          try {
            const status = await sync(row, update);
            update(status === 'processing' ? 'Observation accepted - photo processing' : 'Server photo: ' + status);
          } catch (error) {
            update('Sync incomplete - ' + (error instanceof Error ? error.message : String(error)));
          }
        })}/>}
    </Modal>
  </>;
}
