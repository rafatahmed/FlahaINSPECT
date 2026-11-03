import React, { useState } from 'react';
import { Alert, Image, Modal } from 'react-native';
import type { Project } from './api';
import { AssignedProjects } from './assigned-projects';
import { ProjectMap } from './project-map';
import { CaptureScreen, type Draft } from './capture-screen';
import { InspectionList } from './inspection-list';
import { ReviewPreview, type SampleObservation } from './review-preview';
import type { Category } from './observations';

const sites: Project[] = [
  { id: 'sample-west', code: 'WB-01', name: 'West Bay landscape', description: 'Irrigation and planting beds' },
  { id: 'sample-farm', code: 'AK-02', name: 'Al Khor farm', description: 'Orchard and perimeter checks', is_archived: true },
];
const photo = require('./assets/sample-sprinkler.jpg');
const fix = { latitude: 25.3230, longitude: 51.5180, accuracy: 4.2, altitude: null, altitudeAccuracy: null, heading: null, speed: null };
const samples: SampleObservation[] = [
  { ...fix, id: 'sample-1', category: 'defect', capturedAt: '2026-10-31T06:15:00Z', note: 'Water pooling at the sprinkler riser.', ready: false, photo },
  { latitude: 25.3232, longitude: 51.5184, id: 'sample-2', category: 'normal', capturedAt: '2026-10-31T06:12:00Z', note: 'Northern hedge checked.', ready: true },
];

export function ProjectsPreview({ onExit, startInReview = false }: { onExit: () => void; startInReview?: boolean }) {
  const [site, select] = useState<Project | null>(startInReview ? sites[0] : null);
  const [page, setPage] = useState<'map' | 'capture' | 'list'>(startInReview ? 'list' : 'map');
  const [items, setItems] = useState(() => startInReview ? samples.map(i => ({ ...i, ready: true })) : samples);
  const [reviewId, setReviewId] = useState<string | null>(startInReview ? samples[0].id : null);
  const [releases, setReleases] = useState<Record<string, string>>({});
  const reviewed = items.find(i => i.id === reviewId && i.ready);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const pending = new Map([[sites[0].id, items.filter(i => !i.ready).length]]);
  const visible = site?.id === sites[0].id ? items : [];
  function clearDraft() { setDraft(null); setCategory(null); setNote(''); }
  function back() {
    if (page === 'capture' && (draft || note || category)) {
      Alert.alert('Discard sample observation?', 'Your preview draft has not been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {clearDraft(); setPage('map');} },
      ]);
    } else if (page === 'map') select(null);
    else setPage('map');
  }
  if (reviewed) return <ReviewPreview key={reviewed.id} observation={reviewed} items={items} releases={releases}
    onRelease={summary => setReleases(current => ({ ...current, [reviewed.id]: summary }))}
    onInspector={() => setReviewId(null)} onExit={onExit}/>;
  return <>
    <AssignedProjects role="inspector" projects={sites} pending={pending} busy={false}
      cached={false} message="" onSelect={select} onSignOut={onExit} />
    <Modal visible={!!site} animationType="slide" presentationStyle="pageSheet" allowSwipeDismissal={page === 'map'} onRequestClose={back}>
      {site && page === 'map' && <ProjectMap sample project={site} rows={visible.map(i => ({ id: i.id, image: i.photo, point: JSON.stringify({
        category: i.category, latitude: i.latitude, longitude: i.longitude, note: i.note, captured_at: i.capturedAt,
      }) }))} onBack={back} onCapture={() => setPage('capture')} onWork={() => setPage('list')}/>}
      {site && !site.is_archived && page === 'capture' && <CaptureScreen sample projectName={site.name} draft={draft} note={note}
        category={category} freeMB={Infinity} busy={false} message="Preview only. Samples are cleared when you exit."
        onBack={back} onNote={setNote} onCategory={setCategory} onPin={pin => setDraft(d => d && { ...d, pin })}
        onPhoto={() => {
          const asset = Image.resolveAssetSource(photo);
          if (asset) setDraft({ uri: asset.uri, time: new Date().toISOString(), fix });
          else Alert.alert('Sample photo unavailable', 'Reload the Expo preview and try again.');
        }}
        onSave={() => {
          if (!draft || !category) return;
          setItems(current => [{ ...(draft.pin ?? draft.fix), id: 'sample-' + (current.length + 1), category,
            capturedAt: draft.time, note, ready: false, photo }, ...current]);
          clearDraft(); setPage('list');
        }}/>}
      {site && page === 'list' && <InspectionList sample projectName={site.name} items={visible} onBack={back} onReview={setReviewId}
        onSync={id => setItems(current => current.map(i => i.id === id
          ? { ...i, ready: !!i.syncStatus, syncStatus: 'Sample observation accepted - photo processing' } : i))}/>}
    </Modal>
  </>;
}
