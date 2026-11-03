import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { LocationObjectCoords } from 'expo-location';
import { color } from './field-brand';
import type { Category } from './observations';

export type Pin = { latitude: number; longitude: number };
export type Draft = { uri: string; time: string; fix: LocationObjectCoords; pin?: Pin };
const categories = { defect: '#E53935', normal: '#43A047', note: '#FDD835' };
const label = (value: string) => value[0].toUpperCase() + value.slice(1);

function Action({ title, onPress, disabled = false, primary = false }: {
  title: string; onPress: () => void; disabled?: boolean; primary?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.action, primary && s.primary, (pressed || disabled) && s.dim]}>
    <Text style={[s.actionText, primary && s.primaryText]}>{title}</Text>
  </Pressable>;
}

// Local north-up grid, 100 metres across. Keep the original fix and its accuracy.
function PinEditor({ draft, onConfirm, onCancel }: { draft: Draft; onConfirm: (p?: Pin) => void; onCancel: () => void }) {
  const metersPerDegree = 111320;
  const longitudeFactor = metersPerDegree * Math.max(0.000001, Math.cos(draft.fix.latitude * Math.PI / 180));
  const [east, setEast] = useState(draft.pin ? ((draft.pin.longitude - draft.fix.longitude + 540) % 360 - 180) * longitudeFactor : 0);
  const [north, setNorth] = useState(draft.pin ? (draft.pin.latitude - draft.fix.latitude) * metersPerDegree : 0);
  const [size, setSize] = useState(0);
  const clamp = (n: number) => Math.max(-50, Math.min(50, Math.round(n)));
  const latitude = Math.max(-90, Math.min(90, draft.fix.latitude + north / metersPerDegree));
  const longitude = ((draft.fix.longitude + east / longitudeFactor + 540) % 360) - 180;
  return <View style={s.group}>
    <Text accessibilityRole="header" style={s.heading}>Adjust pin</Text>
    <Text style={s.copy}>Tap the local grid or move one metre at a time. North is up. The centre is the phone’s GPS fix.</Text>
    <Pressable accessible={false} onLayout={e => setSize(e.nativeEvent.layout.width)}
      onPress={e => { if (size) { setEast(clamp(e.nativeEvent.locationX / size * 100 - 50)); setNorth(clamp(50 - e.nativeEvent.locationY / size * 100)); } }} style={s.grid}>
      <View pointerEvents="none" style={s.horizontal}/><View pointerEvents="none" style={s.vertical}/>
      <View pointerEvents="none" style={[s.pin, { left: `${50 + east}%`, top: `${50 - north}%` }]}/>
    </Pressable>
    <Text style={s.copy}>{latitude.toFixed(6)}, {longitude.toFixed(6)} · {east} m east / {north} m north</Text>
    <View style={s.wrap}>{[['North',0,1],['South',0,-1],['West',-1,0],['East',1,0]].map(([name,x,y]) =>
      <Action key={name} title={String(name)} onPress={() => {setEast(clamp(east + Number(x))); setNorth(clamp(north + Number(y)));}}/>)}</View>
    <Action title="Confirm pin" primary onPress={() => onConfirm(east || north ? { latitude, longitude } : undefined)}/>
    <Action title="Cancel adjustment" onPress={onCancel}/>
  </View>;
}

type Props = {
  sample?: boolean;
  projectName: string; draft: Draft | null; category: Category | null; note: string; freeMB: number;
  busy: boolean; message: string; onBack: () => void; onPhoto: () => void; onPin: (p?: Pin) => void;
  onCategory: (c: Category) => void; onNote: (text: string) => void; onSave: () => void;
};
export function CaptureScreen(p: Props) {
  const [adjusting, setAdjusting] = useState(false);
  const lowSpace = p.freeMB < 200;
  return <ScrollView style={s.screen} contentContainerStyle={s.content} automaticallyAdjustKeyboardInsets
    contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled">
    <Action title="‹  Project map" disabled={p.busy} onPress={p.onBack}/>
    <Text style={s.eyebrow}>{p.sample ? 'SAMPLE DATA  /  ' : ''}{p.projectName}</Text>
    <Text accessibilityRole="header" style={s.title}>Capture observation</Text>
    {adjusting && p.draft ? <PinEditor draft={p.draft} onCancel={() => setAdjusting(false)}
      onConfirm={pin => {p.onPin(pin); setAdjusting(false);}}/> : <>
      {p.draft ? <Image source={{ uri: p.draft.uri }} accessibilityLabel="Inspection photo preview" resizeMode="contain" style={s.photo}/>
        : <Text style={s.copy}>Take one photo of the condition at this inspection point.</Text>}
      {p.freeMB < 500 && <Text style={s.warning}>{lowSpace ? 'Free at least 200 MB before capturing or saving.' : 'Less than 500 MB of storage remains.'}</Text>}
      <Action title={p.sample ? 'Use sample photo' : p.draft ? 'Retake photo' : 'Take photo'} primary={!p.draft} disabled={p.busy || lowSpace} onPress={p.onPhoto}/>
      <Text style={s.copy}>{!p.draft ? 'GPS will be recorded with the photo.' :
        'GPS accuracy · ' + (p.draft.fix.accuracy == null ? 'Unknown' : Math.round(p.draft.fix.accuracy) + ' m') + (p.draft.pin ? ' · Pin adjusted' : '')}</Text>
      {(p.draft?.fix.accuracy ?? 0) > 10 && <Text style={s.warning}>GPS is less precise than 10 m. You can still save, or adjust the pin.</Text>}
      {p.draft && <Action title="Adjust pin" disabled={p.busy} onPress={() => setAdjusting(true)}/>}
      <Text style={s.heading}>Category</Text>
      <View style={s.wrap}>{(Object.keys(categories) as Category[]).map(c =>
        <Pressable key={c} accessibilityRole="radio" accessibilityState={{ checked: p.category === c, disabled: p.busy }}
          onPress={() => p.onCategory(c)} disabled={p.busy} style={[s.choice, p.category === c && { borderColor: categories[c] }]}>
          <Text style={s.actionText}>{p.category === c ? '✓ ' : ''}{label(c)}</Text></Pressable>)}</View>
      <Text style={s.heading}>Field note · optional</Text>
      <TextInput multiline maxLength={4000} accessibilityLabel="Field note, optional" editable={!p.busy}
        style={s.input} value={p.note} onChangeText={p.onNote}/>
      <Action title={p.sample ? 'Save sample observation' : 'Save on this device'} primary disabled={p.busy || !p.draft || !p.category || lowSpace} onPress={p.onSave}/>
    </>}
    <Text accessibilityLiveRegion="polite" style={s.warning}>{p.busy ? 'Working…' : p.message}</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  screen: { backgroundColor: color.canvas }, content: { paddingHorizontal: 24, paddingVertical: 42, gap: 12 },
  eyebrow: { color: color.accent, fontSize: 15, fontWeight: '700' }, title: { fontSize: 30, color: color.ink, fontWeight: '700' },
  copy: { fontSize: 16, color: color.muted }, heading: { fontSize: 18, color: color.ink, fontWeight: '600' },
  group: { gap: 12 }, warning: { fontSize: 15, color: color.warning }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { backgroundColor: color.surface, minHeight: 48, justifyContent: 'center', padding: 12, borderRadius: 10 },
  actionText: { color: color.ink, fontWeight: '600', fontSize: 16 }, primary: { backgroundColor: color.accent, alignItems: 'center' },
  primaryText: { color: color.canvas }, dim: { opacity: 0.55 }, photo: { width: '100%', aspectRatio: 1.5, backgroundColor: color.surface },
  choice: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, borderWidth: 2, borderColor: color.border },
  input: { backgroundColor: color.surface, color: color.ink, fontSize: 16, minHeight: 72, padding: 12, borderRadius: 10 },
  grid: { aspectRatio: 1, width: '100%', maxWidth: 320, alignSelf: 'center', backgroundColor: color.surface, borderRadius: 8 },
  horizontal: { position: 'absolute', top: '50%', width: '100%', height: 1, backgroundColor: color.border },
  vertical: { position: 'absolute', left: '50%', height: '100%', width: 1, backgroundColor: color.border },
  pin: { position: 'absolute', width: 14, height: 14, marginLeft: -7, marginTop: -7, borderRadius: 7, backgroundColor: color.accent },
});
