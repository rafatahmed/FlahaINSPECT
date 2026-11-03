import React from 'react';
import { Button, FieldGroup, Host, Text } from '@expo/ui';
import { color } from './field-brand';
import type { Role } from './api';

type Props = {
  name: string; email?: string; role?: Role; description?: string;
  busy: boolean; message: string; onSignOut: () => void;
};

export function NativeProfileRows({ name, email, role, description, busy, message, onSignOut }: Props) {
  // One native Text per informational row keeps label and value together for VoiceOver.
  // Omit explicit font sizes and line limits so SwiftUI uses scalable system text.
  return <Host style={{ flex: 1 }} colorScheme="dark" seedColor={color.accent}>
    <FieldGroup>
      <FieldGroup.Section title="Account">
        <Text>{'Name\n' + name}</Text>
        <Text>{'Email\n' + (email || 'Unavailable in this session')}</Text>
        {role && <Text>{'Account role\n' + role[0].toUpperCase() + role.slice(1)}</Text>}
      </FieldGroup.Section>
      {description && <FieldGroup.Section title="Workspace"><Text>{description}</Text></FieldGroup.Section>}
      <FieldGroup.Section>
        <Button label="Sign out" variant="text" disabled={busy} onPress={onSignOut}/>
        {!!message && <Text>{message}</Text>}
      </FieldGroup.Section>
    </FieldGroup>
  </Host>;
}
