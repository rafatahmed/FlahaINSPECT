import React, { useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { color, FieldBrand } from './field-brand';

// Fixed pages rendered from the issued sample. Inspector preview edits cannot change them.
const pages = [
  { image: require('./assets/sample-report-1.png'), title: 'Project summary',
    text: 'West Bay landscape · WB-01. Irrigation inspection, October 2026. Issued 31 October 2026, revision R01. The site plan marks one released defect. Normal: 0. Note: 0.' },
  { image: require('./assets/sample-report-2.png'), title: 'Sprinkler riser leak',
    text: 'Finding 01 · Defect · Open. Water pools at the base of the sprinkler during operation. The sample photo shows the leak at the connection. Recommended action: replace the damaged riser connection and check for leakage.' },
];

function Action({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [s.action, (pressed || disabled) && s.dim]}>
    <Text style={s.actionText}>{title}</Text></Pressable>;
}

export function ReportsPreview({ onExit, exitLabel = 'Exit preview' }: { onExit: () => void; exitLabel?: string }) {
  const [page, setPage] = useState<number | null>(null);
  const [reading, setReading] = useState(false);
  const current = page === null ? null : pages[page];
  return <>
    <ScrollView style={s.screen} contentContainerStyle={s.page} contentInsetAdjustmentBehavior="automatic" alwaysBounceVertical={false}>
      <FieldBrand />
      <Text style={s.label}>CLIENT PREVIEW · SAMPLE DATA</Text>
      <Text accessibilityRole="header" style={s.title}>Shared reports</Text>
      <Text style={s.body}>Issued reports for your projects.</Text>
      <View style={s.card}>
        <Text style={s.label}>WB-01  /  ISSUED  /  R01</Text>
        <Text style={s.heading}>West Bay landscape</Text>
        <Text style={s.body}>Irrigation inspection · October 2026</Text>
        <Text style={s.body}>31 October 2026 · 2 pages</Text>
        <Action title="Open report" onPress={() => {setReading(false); setPage(0);}}/>
      </View>
      <Action title={exitLabel} onPress={onExit}/>
    </ScrollView>
    <Modal visible={page !== null} animationType="slide" presentationStyle="pageSheet" allowSwipeDismissal onRequestClose={() => setPage(null)}>
      {current && page !== null && <SafeAreaView style={s.sheet}>
        <View style={s.viewer}>
          <View style={s.controls}>
            <Action title="Shared reports" onPress={() => setPage(null)}/>
            <Action title={reading ? 'Page view' : 'Text view'} onPress={() => setReading(!reading)}/>
          </View>
          <Text accessibilityLiveRegion="polite" style={s.body}>Page {page + 1} of {pages.length} - {current.title}</Text>
          {reading ? <ScrollView style={s.document} contentContainerStyle={s.card}>
            <Text accessibilityRole="header" style={s.heading}>{current.title}</Text>
            <Text selectable style={s.body}>{current.text}</Text>
          </ScrollView> : <View style={s.document}>
            <Image source={current.image} accessible accessibilityLabel={current.text} resizeMode="contain" style={s.paper}/>
          </View>}
          <View style={s.controls}>
            <Action title="Previous" disabled={page === 0} onPress={() => setPage(page - 1)}/>
            <Action title="Next" disabled={page === pages.length - 1} onPress={() => setPage(page + 1)}/>
          </View>
        </View>
      </SafeAreaView>}
    </Modal>
  </>;
}
const s = StyleSheet.create({
  screen: { backgroundColor: color.canvas }, page: { paddingHorizontal: 24, paddingVertical: 42, gap: 12 },
  label: { color: color.accent, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  title: { color: color.ink, fontSize: 30, fontWeight: '700' }, heading: { color: color.ink, fontSize: 21, fontWeight: '600' },
  body: { color: color.muted, fontSize: 17 }, card: { padding: 16, gap: 10, backgroundColor: color.surface, borderRadius: 12 },
  sheet: { flex: 1, backgroundColor: color.canvas }, viewer: { flex: 1, padding: 12, gap: 8 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  document: { flex: 1, minHeight: 0 }, paper: { width: '100%', height: '100%' },
  action: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: color.surface, borderRadius: 8 },
  actionText: { color: color.accent, fontWeight: '600', fontSize: 16 }, dim: { opacity: 0.45 },
});
