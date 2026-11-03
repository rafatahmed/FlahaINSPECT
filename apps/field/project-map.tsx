import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import type { Project } from './api';
import { color } from './field-brand';
import type { Category, Row } from './observations';

const markerColor = { defect: '#E53935', normal: '#43A047', note: '#FDD835' };

export function ObservationPlot({ points, emptyLabel = "No local observations to plot.", onSelect }: {
  points: { category: Category; latitude: number; longitude: number }[]; emptyLabel?: string;
  onSelect?: (index: number) => void;
}) {
  const north = points.reduce((n, p) => Math.max(n, p.latitude), -90);
  const south = points.reduce((n, p) => Math.min(n, p.latitude), 90);
  const east = points.reduce((n, p) => Math.max(n, p.longitude), -180);
  const west = points.reduce((n, p) => Math.min(n, p.longitude), 180);
  const longitudeScale = Math.cos((north + south) * Math.PI / 360);
  const span = Math.max(north - south, (east - west) * longitudeScale, 0.0001);
  return <View style={s.plot} accessible={!onSelect || !points.length} accessibilityLabel={points.length ? `Observation plot, ${points.length} points, north up` : emptyLabel}>
      {points.length === 0 ? <Text style={s.body}>{emptyLabel}</Text> :
        points.map((p, i) => {
          const position = {
          left: `${50 + 80 * (p.longitude - (east + west) / 2) * longitudeScale / span}%`,
          top: `${50 - 80 * (p.latitude - (north + south) / 2) / span}%`,
          } as const;
          const dot = <View style={[s.marker, { backgroundColor: markerColor[p.category] }]}/>;
          return onSelect ? <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Open ${p.category} pin ${i + 1}`}
            style={[s.pinTarget, position]} onPress={() => onSelect(i)}>{dot}</Pressable> :
            <View key={i} style={[s.pinTarget, position]}>{dot}</View>;
        })}
    </View>;
}

export function ProjectMap({ project, rows, onBack, onCapture, onWork, onReview, sample }: {
  sample?: boolean; onReview?: () => void;
  project: Project; rows: (Pick<Row, 'point' | 'id'> & { image?: ImageSourcePropType })[]; onBack: () => void; onCapture?: () => void; onWork?: () => void;
}) {
  const [selectedId, select] = useState<string | null>(null);
  const points = rows.map(row => {
    const point = JSON.parse(row.point) as { category: Category; latitude: number; longitude: number; note?: string; captured_at?: string };
    return { ...point, id: row.id, image: row.image };
  }).filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
  const selected = points.find(p => p.id === selectedId);
  return <ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic">
    <Pressable accessibilityRole="button" onPress={onBack} style={s.back}><Text style={s.accent}>‹  Projects</Text></Pressable>
    <Text style={s.accent}>{sample ? 'PROJECT MAP · SAMPLE DATA' : 'PROJECT MAP'}</Text>
    <Text accessibilityRole="header" style={s.title}>{project.name}</Text>
    <Text style={s.body}>{project.is_archived ? 'Archived · Read only' : 'Observations on this phone'}</Text>
    <ObservationPlot points={points} onSelect={i => select(points[i].id)}/>
    <Text style={s.body}>North up · Basemap tiles unavailable in this pilot.</Text>
    <Text style={s.body}>{(['defect', 'normal', 'note'] as const).map(c =>
      c[0].toUpperCase() + c.slice(1) + ' ' + points.filter(p => p.category === c).length).join('  ·  ')}</Text>
    {onCapture && !project.is_archived && <Pressable accessibilityRole="button" onPress={onCapture} style={s.button}>
      <Text style={s.buttonText}>Capture observation</Text>
    </Pressable>}
    {onReview && <Pressable accessibilityRole="button" onPress={onReview} style={s.back}><Text style={s.accent}>Review synced findings</Text></Pressable>}
    {onWork && <Pressable accessibilityRole="button" onPress={onWork} style={s.back}><Text style={s.accent}>Inspection list &amp; sync</Text></Pressable>}
    <Modal visible={!!selected} presentationStyle="pageSheet" animationType="slide" onRequestClose={() => select(null)} allowSwipeDismissal>
      {selected && <ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic">
        <Pressable accessibilityRole="button" onPress={() => select(null)} style={s.back}><Text style={s.accent}>Back to map</Text></Pressable>
        <Text style={s.accent}>{project.name}</Text>
        <Text accessibilityRole="header" style={s.title}>{selected.category[0].toUpperCase() + selected.category.slice(1)} observation</Text>
        {selected.captured_at && <Text style={s.body}>{new Date(selected.captured_at).toLocaleString()}</Text>}
        {selected.image && <Image source={selected.image} resizeMode="contain" accessibilityLabel="Observation photo" style={s.photo}/>}
        <Text selectable style={s.body}>{selected.note || 'No field note recorded.'}</Text>
        <Text selectable style={s.body}>{selected.latitude.toFixed(5)}°, {selected.longitude.toFixed(5)}°</Text>
      </ScrollView>}
    </Modal>
  </ScrollView>;
}

const s = StyleSheet.create({
  screen: { backgroundColor: color.canvas },
  content: { padding: 24, paddingVertical: 42, gap: 12 },
  back: { minHeight: 44, justifyContent: 'center' },
  accent: { color: color.accent, fontWeight: '700', fontSize: 15 },
  title: { color: color.ink, fontWeight: '700', fontSize: 30 },
  body: { color: color.muted, fontSize: 16, textAlign: 'left' },
  plot: { width: '100%', maxWidth: 360, aspectRatio: 1, alignSelf: 'center', justifyContent: 'center',
    alignItems: 'center', backgroundColor: color.surface, borderRadius: 12 },
  pinTarget: { position: 'absolute', width: 48, height: 48, marginLeft: -24, marginTop: -24, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 230 },
  marker: { width: 12, height: 12, borderRadius: 6,
    borderWidth: 1, borderColor: color.ink },
  button: { backgroundColor: color.accent, borderRadius: 10, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12 },
  buttonText: { color: color.canvas, fontWeight: '700', fontSize: 17 },
});
