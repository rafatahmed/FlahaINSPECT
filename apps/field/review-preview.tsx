import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { color, FieldBrand } from './field-brand';
import { ObservationPlot } from './project-map';
import { ReportsPreview } from './reports-preview';

import type { InspectionItem } from './inspection-list';
import type { Category } from './observations';

export type SampleObservation = InspectionItem & { category: Category; latitude: number; longitude: number };
function title(item: SampleObservation) {
  if (item.id === 'sample-1') return 'Sprinkler connection leak';
  return item.category[0].toUpperCase() + item.category.slice(1) + ' observation ' + item.id.replace('sample-', '#');
}
function coordinates(item: SampleObservation) {
  return item.latitude.toFixed(5) + '°, ' + item.longitude.toFixed(5) + '°';
}
type Screen = 'review' | 'confirm' | 'projects' | 'list' | 'map' | 'detail' | 'reports';

function Button({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress}
    style={({ pressed }) => [s.button, primary && s.primary, pressed && { opacity: 0.75 }]}>
    <Text style={[s.buttonText, primary && { color: color.canvas }]}>{label}</Text>
  </Pressable>;
}

function Finding({ item, summary }: { item: SampleObservation; summary: string }) {
  return <View style={s.card}>
    <Text style={s.label}>{item.category.toUpperCase()}</Text>
    <Text accessibilityRole="header" style={s.heading}>{title(item)}</Text>
    {item.photo && <Image source={item.photo} accessibilityLabel="Released observation photo" style={s.photo}/>}
    <Text style={s.body}>{summary}</Text>
    <Text selectable style={s.body}>{coordinates(item)}</Text>
  </View>;
}

export function ReviewPreview({ observation, items, releases, onRelease, onInspector, onExit }: {
  observation: SampleObservation; items: SampleObservation[]; releases: Record<string, string>;
  onRelease: (summary: string) => void; onInspector: () => void; onExit: () => void;
}) {
  const [screen, go] = useState<Screen>('review');
  const published = releases[observation.id] ?? null;
  const [summary, edit] = useState(published ?? '');
  const visible = items.filter(item => releases[item.id] !== undefined);
  const [detailId, select] = useState<string | null>(null);
  const detail = visible.find(item => item.id === detailId);
  const [detailBack, setDetailBack] = useState<'map' | 'list'>('list');
  const manager = screen === 'review' || screen === 'confirm';
  if (screen === 'reports') return <ReportsPreview onExit={() => go('list')} exitLabel="Back to project"/>;
  return <ScrollView key={screen} style={s.screen} contentContainerStyle={s.page}
    contentInsetAdjustmentBehavior="automatic" automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
    <FieldBrand/>
    <Text style={s.label}>{manager ? 'MANAGER' : 'CLIENT'} PREVIEW  /  SAMPLE DATA</Text>
    {screen === 'review' && <>
      <Text accessibilityRole="header" style={s.title}>Review observation</Text>
      <Text style={s.body}>West Bay landscape · WB-01</Text>
      <View style={s.card}>
        <Text style={s.label}>SYNCED FIELD EVIDENCE  /  {new Date(observation.capturedAt).toLocaleString()}</Text>
        <Text style={s.heading}>{title(observation)}</Text>
        {observation.photo && <Image source={observation.photo} accessibilityLabel="Inspector photo" style={s.photo}/>}
        <Text style={s.body}>{observation.category.toUpperCase()} / Inspector note</Text>
        <Text selectable style={s.body}>{observation.note || 'No field note recorded.'}</Text>
        <ObservationPlot points={[observation]}/>
        <Text selectable style={s.body}>{coordinates(observation)} · North up</Text>
      </View>
      <Text style={s.heading}>Client summary</Text>
      <TextInput accessibilityLabel="Client summary" placeholder="Write the summary the client will see" placeholderTextColor={color.muted} multiline value={summary} onChangeText={edit} style={s.input}/>
      <Text style={s.body}>{published === null ? 'Awaiting release. Only staff can see this observation.' :
        published === summary.trim() ? 'Released to the project client.' : 'Draft changes are visible only to staff.'}</Text>
      {!!summary.trim() && published !== summary.trim() && <Button primary label="Preview release" onPress={() => go('confirm')}/>}
      <Button label="Switch to client preview" onPress={() => go('projects')}/>
      <Button label="Return to inspector list" onPress={onInspector}/>
      <Button label="Exit preview" onPress={onExit}/>
    </>}
    {screen === 'confirm' && <>
      <Text accessibilityRole="header" style={s.title}>Release to client?</Text>
      <Text style={s.body}>Clients assigned to West Bay landscape will see the following finding.</Text>
      <Finding item={observation} summary={summary.trim()}/>
      <Button primary label="Confirm release" onPress={() => { onRelease(summary.trim()); go('review'); }}/>
      <Button label="Back to review" onPress={() => go('review')}/>
    </>}
    {screen === 'projects' && <>
      <Text accessibilityRole="header" style={s.title}>My projects</Text>
      <View style={s.card}>
        <Text style={s.label}>WB-01  /  ASSIGNED PROJECT</Text>
        <Text style={s.heading}>West Bay landscape</Text>
        <Text style={s.body}>{visible.length} released {visible.length === 1 ? 'finding' : 'findings'} · 1 issued report</Text>
        <Button primary label="Open project" onPress={() => go('list')}/>
      </View>
      <Button label="Switch to manager preview" onPress={() => go('review')}/>
    </>}
    {(screen === 'list' || screen === 'map') && <>
      <Text accessibilityRole="header" style={s.title}>West Bay landscape</Text>
      <Text style={s.heading}>{screen === 'map' ? 'Published map' : 'Released findings'}</Text>
      {screen === 'map' && <ObservationPlot points={visible} emptyLabel="No published pins"
        onSelect={index => { select(visible[index].id); setDetailBack('map'); go('detail'); }}/>}
      {visible.length === 0 ? <Text style={s.body}>No findings have been released for this project.</Text> :
        visible.map(item => <Button key={item.id} label={title(item)} onPress={() => {
          select(item.id); setDetailBack(screen); go('detail');
        }}/>)}
      <Button label={screen === 'map' ? 'View list' : 'View map'} onPress={() => go(screen === 'map' ? 'list' : 'map')}/>
      <Button label="Issued reports" onPress={() => go('reports')}/>
      <Button label="My projects" onPress={() => go('projects')}/>
    </>}
    {screen === 'detail' && detail && <>
      <Text style={s.label}>WEST BAY LANDSCAPE  /  RELEASED FINDING</Text>
      <Finding item={detail} summary={releases[detail.id]}/>
      <Button label="Back to project" onPress={() => go(detailBack)}/>
    </>}
  </ScrollView>;
}

const s = StyleSheet.create({
  screen: { backgroundColor: color.canvas },
  page: { paddingHorizontal: 24, paddingVertical: 42, gap: 12 },
  card: { backgroundColor: color.surface, borderRadius: 12, padding: 16, gap: 12 },
  label: { color: color.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  title: { color: color.ink, fontSize: 30, fontWeight: '700' },
  heading: { color: color.ink, fontSize: 21, fontWeight: '600' },
  body: { color: color.muted, fontSize: 17 },
  photo: { width: '100%', height: undefined, aspectRatio: 1.6, borderRadius: 8 },
  input: { minHeight: 92, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: color.border,
    backgroundColor: color.surface, color: color.ink, fontSize: 17, textAlignVertical: 'top' },
  button: { minHeight: 48, justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: color.surface },
  primary: { backgroundColor: color.accent },
  buttonText: { fontSize: 17, fontWeight: '600', color: color.accent },
});
