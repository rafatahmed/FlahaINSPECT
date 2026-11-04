import React from 'react';
import { requireOptionalNativeModule } from 'expo';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Profile } from './api';
import { color } from './field-brand';

const workspace = {
  inspector: 'Capture observations and sync evidence for your assigned projects.',
  manager: 'Review field evidence and release findings to project clients.',
  client: 'View released findings and photos for your assigned projects.',
};

export function ProfileScreen({ user, busy, message, onBack, onSignOut }: {
  user: Profile; busy: boolean; message: string; onBack: () => void; onSignOut: () => void;
}) {
  const name = user.full_name?.trim();
  const initials = (name || user.email || '').split(/\s+/).filter(Boolean).slice(0, 2)
    .map(part => Array.from(part)[0]).join('').toUpperCase();
  const header = <>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to projects" onPress={onBack} style={s.link}><Text style={s.action}>‹  Projects</Text></Pressable>
    <Text accessible accessibilityRole="header" style={s.title}>My profile</Text>
  </>;
  if (requireOptionalNativeModule('ExpoUI')) {
    // Older installed development clients can still open the account screen.
    const { NativeProfileRows } = require('./native-profile-rows') as typeof import('./native-profile-rows');
    return <View style={s.screen} accessibilityViewIsModal onAccessibilityEscape={onBack}>
      <NativeProfileRows name={name || user.email || 'Signed-in account'} email={user.email}
        role={user.role} description={user.role && workspace[user.role]} busy={busy} message={message} onBack={onBack} onSignOut={onSignOut}/>
    </View>;
  }
  return <ScrollView style={s.screen} contentContainerStyle={s.page}
    contentInsetAdjustmentBehavior="automatic" alwaysBounceVertical={false} accessibilityViewIsModal onAccessibilityEscape={onBack}>
    {header}
    <View style={s.card}>
      {!!initials && <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.avatar}>
        <Text style={s.initials}>{initials}</Text>
      </View>}
      <Text style={s.name}>{name || user.email || 'Signed-in account'}</Text>
      <Text style={s.label}>Email</Text>
      <Text selectable style={s.value}>{user.email || 'Unavailable in this session'}</Text>
      {user.role && <>
        <Text style={s.label}>Account role</Text>
        <Text style={s.value}>{user.role[0].toUpperCase() + user.role.slice(1)}</Text>
        <Text style={s.description}>{workspace[user.role]}</Text>
      </>}
    </View>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy}
      onPress={onSignOut} style={s.link}><Text style={s.action}>Sign out</Text></Pressable>
    {!!message && <Text accessibilityLiveRegion="polite" style={s.description}>{message}</Text>}
  </ScrollView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.canvas },
  page: { width: '100%', maxWidth: 488, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 36, gap: 16 },
  link: { alignSelf: 'flex-start', minHeight: 48, justifyContent: 'center', paddingHorizontal: 4 },
  action: { color: color.accent, fontSize: 17, fontWeight: '600' },
  title: { color: color.ink, fontSize: 34, fontWeight: '700' },
  card: { padding: 20, backgroundColor: color.surface, borderRadius: 12, gap: 6 },
  avatar: { alignSelf: 'flex-start', minWidth: 54, minHeight: 54, padding: 8, borderRadius: 27,
    backgroundColor: color.canvas, alignItems: 'center', justifyContent: 'center' },
  initials: { color: color.accent, fontSize: 22, fontWeight: '700' },
  name: { color: color.ink, fontSize: 24, fontWeight: '700', marginTop: 6 },
  label: { color: color.muted, fontSize: 14, marginTop: 14 },
  value: { color: color.ink, fontSize: 18 },
  description: { color: color.muted, fontSize: 16, marginTop: 6 },
});
