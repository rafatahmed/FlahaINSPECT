import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api, ApiError, origin, restore, type Project } from './api';
import { color } from './field-brand';
import { ObservationPlot } from './project-map';
import type { Category } from './observations';

type Point = { id: string; category: Category; latitude: number; longitude: number; version: number; note: string | null;
  release?: { summary: string; released_at?: string } | null; photos: { id: string; status: string }[] };
type Released = { id: string; category: Category; latitude: number; longitude: number; summary: string };
type Item = Point | Released;

function Action({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled: !!disabled }}
    style={s.action} onPress={onPress}><Text style={{ color: disabled ? color.muted : color.accent }}>{title}</Text></Pressable>;
}

export function FindingsScreen({ project, manager, onBack }: { project: Project; manager: boolean; onBack: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, select] = useState<string | null>(null);
  const [mediaToken, setMediaToken] = useState<string>();
  const [summary, edit] = useState('');
  const [refresh, reload] = useState(0);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const current = items.find(item => item.id === selected);
  useEffect(() => {
    let active = true;
    setItems([]); select(null); setBusy(true); setMessage('');
    const path = manager ? '/inspection-points?limit=200&project_id=' + project.id : '/client/projects/' + project.id + '/findings';
    api(path).then(async response => {
      const token = (await restore())?.access_token;
      if (active) { setMediaToken(token); setItems(response.items); }
    })
      .catch(error => { if (active) setMessage(String(error)); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [project.id, manager, refresh]);
  function open(id: string) { select(id); edit(''); setMessage(''); }
  async function release(point: Point) {
    setBusy(true);
    try {
      await api('/inspection-points/' + point.id + '/release', { version: point.version, summary: summary.trim() });
      setItems(previous => previous.map(item => item.id === point.id ? { ...point, release: { summary: summary.trim() } } : item));
      select(null); setMessage('Finding released to assigned clients.');
    } catch (error) {
      setMessage(error instanceof ApiError && error.status === 409
        ? 'Release unavailable. Refresh to check the point version and photo. An existing release cannot be overwritten.' : String(error));
    } finally { setBusy(false); }
  }
  const readyPhoto = current && 'photos' in current && current.photos.find(p => p.status === 'ready');
  const mediaPath = current && ('summary' in current ? '/client/findings/' + current.id + '/photo' :
    readyPhoto ? '/photos/' + readyPhoto.id + '/file' : null);
  const photo = mediaPath && mediaToken ? { uri: origin + '/v1' + mediaPath,
    headers: { Authorization: 'Bearer ' + mediaToken }, cache: 'reload' as const } : undefined;
  return <ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic"
    automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
    <Action title={current ? 'Back to findings' : manager ? 'Project map' : 'My projects'} disabled={busy}
      onPress={current ? () => {select(null); setMessage('');} : onBack}/>
    <Text style={s.body}>{project.name}</Text>
    <Text accessibilityRole="header" style={s.heading}>{manager ? 'Review findings' : 'Released findings'}</Text>
    {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
    {busy && <Text style={s.body}>Please wait…</Text>}
    {current ? <View style={s.card}>
      <Text style={s.heading}>{current.category}</Text>
      <Text selectable style={s.body}>{current.latitude.toFixed(5)}°, {current.longitude.toFixed(5)}°</Text>
      {photo && <Image accessibilityLabel="Finding photo" source={photo} resizeMode="contain" style={s.photo}/>}
      {'summary' in current ? <Text selectable style={s.body}>{current.summary}</Text> : <>
        <Text selectable style={s.body}>{current.note || 'No inspector note.'}</Text>
        {current.release ? <>
          <Text style={s.heading}>Released to client</Text>
          {!!current.release.released_at && <Text style={s.body}>{new Date(current.release.released_at).toLocaleString()}</Text>}
          <Text selectable style={s.body}>{current.release.summary}</Text>
        </> : current.photos.some(p => p.status === 'ready') ? <>
          <Text style={s.body}>Client summary</Text>
          <TextInput multiline maxLength={4000} editable={!busy} accessibilityLabel="Client summary" value={summary} onChangeText={edit} style={s.input}/>
          <Action title="Review release" disabled={busy || !summary.trim()} onPress={() =>
            Alert.alert('Release finding to assigned clients?', summary.trim() + '\n\nThe photo, category and coordinates will be included.', [
              { text: 'Cancel', style: 'cancel' }, { text: 'Release', onPress: () => void release(current) },
            ])}/>
        </> : <Text style={s.body}>Waiting for the synced photo.</Text>}
      </>}
    </View> : <>
      <Action title="Refresh findings" disabled={busy} onPress={() => reload(v => v + 1)}/>
      {!busy && !message && !items.length && <Text style={s.body}>{manager ? 'No observations synced yet.' : 'No released findings yet.'}</Text>}
      {!!items.length && <ObservationPlot points={items} onSelect={index => open(items[index].id)}/>}
      {items.map((item, index) => <Action key={item.id} title={item.category + ' ' + (index + 1) + ' · ' + ('summary' in item ? item.summary :
        (item.release ? 'Released to client · ' : item.release === null ? 'Unreleased · ' : '') + (item.note || 'Review observation'))}
        onPress={() => open(item.id)}/>)}
    </>}
  </ScrollView>;
}
const s = StyleSheet.create({
  screen: { backgroundColor: color.canvas }, content: { padding: 24, paddingVertical: 42, gap: 12 },
  heading: { color: color.ink, fontSize: 24, fontWeight: '700' }, body: { color: color.muted, fontSize: 17 },
  card: { gap: 12, backgroundColor: color.surface, padding: 16, borderRadius: 12 }, photo: { width: '100%', height: 220 },
  action: { minHeight: 48, justifyContent: 'center', padding: 12, backgroundColor: color.surface, borderRadius: 8 },
  input: { minHeight: 84, padding: 12, borderWidth: 1, borderColor: color.border, color: color.ink, fontSize: 17 },
});
