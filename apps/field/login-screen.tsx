import React, { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';

import { color, FieldBrand } from './field-brand';

type Props = {
  origin?: string;
  busy: boolean;
  message: string;
  onPreview?: (screen: 'projects' | 'reports' | 'review') => void;
  onLogin: (email: string, password: string) => void;
};

export function LoginScreen({ origin, busy, message, onLogin, onPreview }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focus, setFocus] = useState<'email' | 'password' | null>(null);
  const passwordField = useRef<React.ComponentRef<typeof TextInput>>(null);
  const disabled = busy || !origin || !email.trim() || !password;
  function submit() {
    if (!disabled) onLogin(email.trim(), password);
  }

  return <ScrollView style={styles.screen} contentContainerStyle={styles.page}
    alwaysBounceVertical={false} overScrollMode="never" keyboardDismissMode="on-drag"
    contentInsetAdjustmentBehavior="automatic" automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
    <StatusBar barStyle="light-content" />
    <View style={styles.column}>
      <FieldBrand />
      <Text accessibilityRole="header" style={styles.title}>Log in</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Email</Text>
        <TextInput accessibilityLabel="Email" autoComplete="email" keyboardType="email-address"
          autoCapitalize="none" autoCorrect={false} returnKeyType="next" value={email}
          onSubmitEditing={() => passwordField.current?.focus()} onChangeText={setEmail}
          onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
          style={[styles.input, focus === 'email' && styles.focused]} />
        <Text style={styles.label}>Password</Text>
        <TextInput ref={passwordField} accessibilityLabel="Password" autoComplete="current-password"
          secureTextEntry returnKeyType="go" value={password} onChangeText={setPassword}
          onSubmitEditing={submit} onFocus={() => setFocus('password')} onBlur={() => setFocus(null)}
          style={[styles.input, focus === 'password' && styles.focused]} />
        <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy }} disabled={disabled}
          onPress={submit} style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>{busy ? 'Please wait…' : 'Log in'}</Text>
        </Pressable>
        {!!message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.warning}>{message}</Text>}
      </View>
      {onPreview ? <View>
        <Text style={styles.environment}>Sample data · No sign-in required</Text>
        <Pressable accessibilityRole="button" onPress={() => onPreview('projects')} style={styles.preview}>
          <Text style={styles.previewLabel}>Preview assigned projects</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => onPreview('review')} style={styles.preview}>
          <Text style={styles.previewLabel}>Preview manager review</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => onPreview('reports')} style={styles.preview}>
          <Text style={styles.previewLabel}>Preview client reports</Text></Pressable>
      </View> : (!origin || __DEV__) && <Text selectable style={styles.environment}>{origin ? 'Pilot API · ' + origin : 'Pilot API is not configured. Login is unavailable.'}</Text>}
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  preview: { minHeight: 48, justifyContent: 'center' },
  previewLabel: { color: color.accent, fontSize: 16, fontWeight: '600' },
  screen: { backgroundColor: color.canvas },
  page: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24,
    paddingTop: 24 + (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) },
  column: { width: '100%', maxWidth: 440, gap: 16, marginVertical: 'auto' },
  title: { color: color.ink, fontSize: 38, fontWeight: '700' },
  form: { gap: 8 },
  label: { color: color.ink, fontSize: 16, fontWeight: '600' },
  input: { color: color.ink, backgroundColor: color.surface, borderColor: color.border, borderWidth: 2,
    borderRadius: 10, minHeight: 52, fontSize: 17, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  focused: { borderColor: color.accent },
  button: { minHeight: 52, justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: color.accent },
  disabled: { backgroundColor: color.border },
  pressed: { opacity: 0.8 },
  buttonText: { color: color.canvas, fontWeight: '700', fontSize: 17 },
  warning: { color: color.warning, fontSize: 16 },
  environment: { color: color.muted, fontSize: 13 },
});
