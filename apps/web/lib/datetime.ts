/** Stable across SSR and the browser (no host locale). */
export function formatCapturedAt(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toISOString().replace('T', ' ').slice(0, 16)} UTC`;
}
