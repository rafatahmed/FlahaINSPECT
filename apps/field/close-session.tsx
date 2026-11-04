import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Button, FieldGroup, Host, Text, TextInput } from '@expo/ui';
import { randomUUID } from 'expo-crypto';
import { api } from './api';
import { color } from './field-brand';
export function CloseSession({
  id,
  onClosed,
}: {
  id: string;
  onClosed: () => void;
}) {
  const [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const request = useRef<{ request_id: string; reason: string } | null>(null);
  async function close() {
    const trimmed = reason.trim();
    if (!trimmed) return;
    if (!request.current || request.current.reason !== trimmed)
      request.current = { request_id: randomUUID(), reason: trimmed };
    setBusy(true);
    setError('');
    try {
      await api('/inspection-sessions/' + id + '/close', request.current);
      onClosed();
    } catch {
      setError(
        'Closure was not confirmed. Refresh session status before retrying; the session may already have ended or access may have changed.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Host matchContents colorScheme="dark" seedColor={color.accent}>
      <FieldGroup>
        <FieldGroup.Section title="Lost-phone closure">
          <TextInput
            accessibilityLabel="Closure reason"
            placeholder="Why is this phone unavailable?"
            onChangeText={setReason}
            editable={!busy}
            multiline
          />
          <Text>
            Closing stops capture without claiming missing evidence was
            received.
          </Text>
          <Button
            label="Close lost-phone session"
            disabled={busy || !reason.trim() || reason.trim().length > 1000}
            onPress={() =>
              Alert.alert(
                'Close this session?',
                'The original phone must reconcile its saved evidence before sync can be complete.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Close session',
                    onPress: () => {
                      void close();
                    },
                  },
                ],
              )
            }
          />
          {!!error && <Text>{error}</Text>}
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
