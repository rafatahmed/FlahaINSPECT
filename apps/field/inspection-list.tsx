import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { color } from './field-brand';

export type InspectionItem = {
  id: string; category: string; capturedAt: string; note: string; ready: boolean;
  photo?: ImageSourcePropType;
  syncStatus?: string;
};

type Props = {
  projectName: string; items: InspectionItem[]; sample?: boolean; busy?: boolean; message?: string;
  onReview?: (id: string) => void;
  onBack: () => void; onSync?: (id: string) => void; onSignOut?: () => void;
};

export function InspectionList({ projectName, items, sample, busy, message, onBack, onSync, onSignOut, onReview }: Props) {
  return <FlatList style={s.screen} contentContainerStyle={s.page} data={items} keyExtractor={item => item.id}
    alwaysBounceVertical={false} contentInsetAdjustmentBehavior="automatic"
    ListHeaderComponent={<View style={s.header}>
      <Pressable accessibilityRole="button" disabled={busy} onPress={onBack} style={s.button}><Text style={s.action}>‹  Project map</Text></Pressable>
      <Text style={s.action}>{sample ? 'SAMPLE DATA  /  ' : ''}{projectName}</Text>
      <Text accessibilityRole="header" style={s.title}>Inspection list &amp; sync</Text>
      <Text style={s.text}>{items.filter(i => !i.ready).length} pending {sample ? 'in preview' : 'on this device'}</Text>
      {!!message && <Text accessibilityLiveRegion="polite" style={s.text}>{message}</Text>}
      {!onSync && <Text style={s.text}>Sync is unavailable in this offline capture pilot.</Text>}
    </View>}
    ListEmptyComponent={<Text style={s.text}>No observations saved for this project.</Text>}
    renderItem={({ item }) => <View style={s.card}>
      <View style={s.row}>{item.photo && <Image source={item.photo} style={s.thumb} accessibilityLabel="Inspection photo"/>}
        <View style={s.details}><Text style={s.category}>{item.category}</Text>
          <Text style={s.text}>{new Date(item.capturedAt).toLocaleString()}</Text></View></View>
      {!!item.note && <Text selectable style={s.text}>{item.note}</Text>}
      <Text selectable style={s.meta}>{item.id}</Text>
      <Text accessibilityLiveRegion="polite" style={s.text}>{item.ready ? (sample ? 'Synced in preview' : 'Photo ready on server') : item.syncStatus || 'Saved locally - pending sync'}</Text>
      {item.ready && onReview && <Pressable accessibilityRole="button" style={s.button} onPress={() => onReview(item.id)}>
        <Text style={s.action}>Review as manager</Text></Pressable>}
      {!item.ready && onSync && <Pressable disabled={busy} accessibilityRole="button" style={s.button}
        onPress={() => onSync(item.id)}><Text style={s.action}>{sample ? (item.syncStatus ? 'Check sample photo' : 'Simulate sync') : 'Sync now / check photo'}</Text></Pressable>}
    </View>}
    ListFooterComponent={onSignOut ? <Pressable disabled={busy} accessibilityRole="button" style={s.button}
      onPress={onSignOut}><Text style={s.action}>Sign out</Text></Pressable> : undefined}/>;
}

const s = StyleSheet.create({
  screen: { backgroundColor: color.canvas }, page: { paddingHorizontal: 24, paddingVertical: 42, gap: 12 },
  header: { gap: 8 }, title: { color: color.ink, fontSize: 30, fontWeight: '700' },
  action: { color: color.accent, fontSize: 16, fontWeight: '600' }, text: { color: color.ink, fontSize: 16 },
  category: { color: color.ink, fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
  card: { padding: 16, borderRadius: 12, backgroundColor: color.surface, gap: 8 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' }, details: { flex: 1, gap: 4 },
  thumb: { width: 56, height: 56, borderRadius: 8 }, meta: { color: color.muted, fontSize: 13 },
  button: { minHeight: 48, justifyContent: 'center' },
});
