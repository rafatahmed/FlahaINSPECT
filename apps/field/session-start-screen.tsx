import React from 'react';
import { Button, FieldGroup, Host, Text } from '@expo/ui';
import { color } from './field-brand';

export function SessionStartScreen({projectName, busy, message, onBack, onStart}: {
  projectName: string; busy: boolean; message: string; onBack: () => void; onStart: () => void;
}) {
  return <Host style={{flex: 1}} useViewportSizeMeasurement colorScheme="dark" seedColor={color.accent}>
    <FieldGroup>
      <FieldGroup.Section title="Inspection session">
        <Button label="Back to project" variant="text" disabled={busy} onPress={onBack}/>
        <Text>{projectName}</Text>
        <Text>Start this visit on this phone. Saved observations receive permanent numbers, even offline.</Text>
        <Button label="Start inspection session" disabled={busy} onPress={onStart}/>
      </FieldGroup.Section>
      {!!message && <FieldGroup.Section title="Status"><Text>{message}</Text></FieldGroup.Section>}
    </FieldGroup>
  </Host>;
}
