import React from 'react';
import { Button, FieldGroup, Host, Text } from '@expo/ui';
import { color } from './field-brand';
import type { Role } from './api';

type Props = {
  name: string; email?: string; role?: Role; description?: string;
  busy: boolean; message: string; onBack: () => void; onSignOut: () => void;
};

export function NativeProfileRows({ name, email, role, description, busy, message, onBack, onSignOut }: Props) {
  // Keep every row, including navigation, in one native scrolling surface.
  // No fixed header, font-size cap or line limit can consume/truncate the available viewport.
  return <Host style={{ flex: 1 }} useViewportSizeMeasurement
    accessibilityViewIsModal onAccessibilityEscape={onBack}
    colorScheme="dark" seedColor={color.accent}>
    <FieldGroup>
      <FieldGroup.Section title="My profile">
        <Button label="Back to projects" variant="text" onPress={onBack}/>
        <Button label="Sign out" variant="text" disabled={busy} onPress={onSignOut}/>
      </FieldGroup.Section>
      <FieldGroup.Section title="Account">
        <Text>{'Name\n' + name}</Text>
        <Text>{'Email\n' + (email || 'Unavailable in this session')}</Text>
        {role && <Text>{'Account role\n' + role[0].toUpperCase() + role.slice(1)}</Text>}
      </FieldGroup.Section>
      {description && <FieldGroup.Section title="Workspace"><Text>{description}</Text></FieldGroup.Section>}
      {!!message && <FieldGroup.Section title="Status"><Text>{message}</Text></FieldGroup.Section>}
    </FieldGroup>
  </Host>;
}
