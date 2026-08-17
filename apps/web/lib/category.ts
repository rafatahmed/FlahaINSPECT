export const CATEGORY_LEGEND = [
  { id: 'defect', label: 'Defect', color: '#c0392b' },
  { id: 'normal', label: 'Normal', color: '#27ae60' },
  { id: 'note', label: 'Note', color: '#2980b7' },
] as const;

export function categoryColor(category: string): string {
  return CATEGORY_LEGEND.find((c) => c.id === category)?.color ?? '#7f8c8d';
}

export function categoryLabel(category: string): string {
  return CATEGORY_LEGEND.find((c) => c.id === category)?.label ?? category;
}

export const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'] as const;
