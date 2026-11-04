import React, { useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import type { Profile, Project, Role } from './api';
import { ProfileScreen } from './profile-screen';
import { color, FieldBrand } from './field-brand';

type Props = {
  role?: Role;
  profile?: Profile;
  projects: Project[];
  pending: Map<string, number>;
  busy: boolean;
  message: string;
  cached: boolean;
  onRefresh?: () => void;
  onSelect: (project: Project) => void;
  onSignOut: () => void;
};

export function AssignedProjects({ role, profile, projects, pending, busy, message, cached, onSelect, onRefresh, onSignOut }: Props) {
  const trigger = useRef<React.ComponentRef<typeof View>>(null);
  const [showProfile, setShowProfile] = useState(false);
  const title = role === 'manager' ? 'All projects' : role === 'client' ? 'My projects' : 'Assigned projects';
  const client = role === 'client';
  return <View style={styles.screen}>
    <StatusBar barStyle="light-content" />
    <FlatList accessibilityElementsHidden={showProfile} importantForAccessibility={showProfile ? "no-hide-descendants" : "auto"} data={projects} keyExtractor={p => p.id} contentContainerStyle={styles.page}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={<View style={styles.header}>
        <FieldBrand />
        <View style={styles.actions}>
          <Text style={styles.eyebrow}>{onRefresh ? 'FIELD OPERATIONS' : 'DESIGN PREVIEW · SAMPLE DATA'}</Text>
          {profile && <Pressable ref={trigger} accessibilityRole="button" onPress={() => setShowProfile(true)} style={styles.link}>
            <Text style={styles.action}>My profile</Text>
          </Pressable>}
        </View>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.body}>{client ? 'Choose a project to see its released findings.' : 'Choose a project to open its map.'}</Text>
        {cached && <Text style={styles.body}>Last project saved on this phone</Text>}
      </View>}
      renderItem={({ item }) => <Pressable accessibilityRole="button" disabled={busy}
        accessibilityState={{ disabled: busy }} accessibilityLabel={client ? `Open released findings for ${item.name}` : `Open ${item.name}, ${item.is_archived ? 'archived, read only' : 'project map'}, ${pending.get(item.id) ?? 0} pending on this phone`}
        onPress={() => onSelect(item)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.details}>
          {!!item.code && <Text style={styles.code}>{item.code}</Text>}
          <Text style={styles.name}>{item.name}</Text>
          {item.is_archived && <Text style={styles.code}>Archived · Read only</Text>}
          {!!item.description && <Text numberOfLines={2} style={styles.body}>{item.description}</Text>}
          {!client && <Text style={styles.meta}>{pending.get(item.id) ?? 0} pending on this phone</Text>}
        </View>
        <Text style={styles.start}>{client ? 'Open released findings' : 'Open project map'}  →</Text>
      </Pressable>}
      ListEmptyComponent={!busy && !message ? <Text style={styles.body}>{role === 'manager' ? 'No projects available.' : 'You have no assigned projects. Ask a manager.'}</Text> : undefined}
      ListFooterComponent={<View style={styles.footer}>
        {busy && <Text accessibilityLiveRegion="polite" style={styles.body}>Loading…</Text>}
        {!!message && <Text accessibilityRole="alert" style={styles.warning}>{message}</Text>}
        <View style={styles.actions}>
          {onRefresh && <Pressable accessibilityRole="button" disabled={busy} onPress={onRefresh}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}><Text style={styles.action}>Refresh projects</Text></Pressable>}
          <Pressable accessibilityRole="button" disabled={busy} onPress={onSignOut}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}><Text style={styles.body}>{onRefresh ? 'Sign out' : 'Exit preview'}</Text></Pressable>
        </View>
      </View>} />
    {profile && <Modal visible={showProfile} presentationStyle="fullScreen" animationType="slide"
      onDismiss={() => { if (trigger.current) AccessibilityInfo.sendAccessibilityEvent(trigger.current, 'focus'); }}
      onRequestClose={() => setShowProfile(false)}>
      <ProfileScreen user={profile} busy={busy} message={message} onBack={() => setShowProfile(false)} onSignOut={onSignOut}/>
    </Modal>}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.canvas },
  page: { width: '100%', maxWidth: 488, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 52 },
  header: { gap: 8, paddingBottom: 24 },
  eyebrow: { marginTop: 20, color: color.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
  title: { fontSize: 38, fontWeight: '700', color: color.ink },
  body: { fontSize: 16, color: color.muted },
  row: { backgroundColor: color.surface, padding: 18, borderRadius: 10, marginBottom: 12, gap: 14 },
  details: { gap: 5 },
  code: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: color.accent },
  meta: { fontSize: 14, color: color.muted, marginTop: 5 },
  start: { color: color.canvas, fontSize: 16, fontWeight: '700', backgroundColor: color.accent,
    alignSelf: 'flex-start', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 7, overflow: 'hidden' },
  name: { fontSize: 19, fontWeight: '600', color: color.ink },
  action: { fontSize: 16, fontWeight: '600', color: color.accent },
  footer: { gap: 12, marginTop: 16 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 16 },
  link: { minHeight: 48, justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  warning: { fontSize: 16, color: color.warning },
});
