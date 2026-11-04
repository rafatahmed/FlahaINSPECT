import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { CloseSession } from './close-session';
import type { AdministrativeClosure } from './session-store';
import { api } from './api';
import { color } from './field-brand';
type State = {
  id: string;
  ended_at: string | null;
  closure?: AdministrativeClosure | null;
  last_contact_at: string | null;
  known_pending: number | null;
  known_failed: number | null;
  sync_state: string;
  removed_count: number;
};
export function SessionStatus({
  projectId,
  refresh,
}: {
  projectId: string;
  refresh: number;
}) {
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<State[]>([]),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setItems([]);
    setError('');
    setLoading(true);
    api('/projects/' + projectId + '/inspection-sessions')
      .then((data) => {
        if (active) {
          setItems(data.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Session status unavailable. Completeness is unknown.');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [projectId, refresh, revision]);
  return (
    <View style={{ gap: 8 }}>
      <Text
        accessibilityRole="header"
        style={{ color: color.ink, fontSize: 20 }}
      >
        Inspection sessions
      </Text>
      {loading && (
        <Text style={{ color: color.ink }}>Loading session status.</Text>
      )}
      {!loading && !error && !items.length && (
        <Text style={{ color: color.ink }}>
          No inspection sessions received from a phone yet.
        </Text>
      )}
      {!!error && <Text style={{ color: color.ink }}>{error}</Text>}
      {items.map((visit) => (
        <View key={visit.id} style={{ gap: 8 }}>
          <Text selectable style={{ color: color.ink }}>
            Session {visit.id}:{' '}
            {visit.closure
              ? 'Administratively closed'
              : visit.ended_at
                ? 'Ended'
                : 'Active'}{' '}
            — {visit.sync_state}. Last contact:{' '}
            {visit.last_contact_at
              ? new Date(visit.last_contact_at).toLocaleString()
              : 'unknown'}
            . Pending: {visit.known_pending ?? 'unknown'}; failed:{' '}
            {visit.known_failed ?? 'unknown'}; removed: {visit.removed_count}.
            Status reflects the last phone contact.
          </Text>
          {visit.closure && (
            <Text selectable style={{ color: color.ink }}>
              Closure reason: {visit.closure.reason}. Closed by{' '}
              {visit.closure.actor_id} at {visit.closure.closed_at}. Closure
              history is retained after recovery.
            </Text>
          )}
          {!visit.ended_at && !visit.closure && (
            <CloseSession
              id={visit.id}
              onClosed={() => setRevision((value) => value + 1)}
            />
          )}
        </View>
      ))}
    </View>
  );
}
