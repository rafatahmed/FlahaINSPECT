/** In-process Prometheus text exposition. No third-party client. */

export const HTTP_DURATION = 'http_request_duration_seconds';
export const SYNC_DELTA_ITEMS = 'sync_delta_items';
export const TUS_PRE_CREATE = 'tus_pre_create_total';
export const TUS_POST_FINISH = 'tus_post_finish_total';
export const PHOTO_BYTES = 'photo_bytes_uploaded';
export const SYNC_LAG = 'sync_lag_seconds';
export const PHOTO_UPLOAD_LAG = 'photo_upload_lag_seconds';
export const JOB_DEAD_LETTERS = 'job_dead_letters';
export const JOB_TOTAL = 'job_total';

export const HTTP_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
export const LAG_BUCKETS = [1, 5, 15, 30, 60, 300, 900, 1800, 3600, 86400];
export const ITEMS_BUCKETS = [1, 5, 10, 25, 50, 100, 200];

type Labels = Record<string, string>;

type CounterSeries = { labels: Labels; value: number };
type HistSeries = { labels: Labels; buckets: number[]; counts: number[]; sum: number; count: number };
type GaugeSeries = { labels: Labels; value: number };

type CounterMetric = { help: string; series: Map<string, CounterSeries> };
type HistMetric = { help: string; buckets: number[]; series: Map<string, HistSeries> };
type GaugeMetric = { help: string; series: Map<string, GaugeSeries> };

const counters = new Map<string, CounterMetric>();
const histograms = new Map<string, HistMetric>();
const gauges = new Map<string, GaugeMetric>();

export function resetMetrics(): void {
  counters.clear();
  histograms.clear();
  gauges.clear();
}

export function incCounter(name: string, help: string, labels: Labels = {}, delta = 1): void {
  let metric = counters.get(name);
  if (!metric) {
    metric = { help, series: new Map() };
    counters.set(name, metric);
  }
  const key = labelKey(labels);
  const existing = metric.series.get(key);
  if (existing) {
    existing.value += delta;
    return;
  }
  metric.series.set(key, { labels, value: delta });
}

export function observeHistogram(
  name: string,
  help: string,
  value: number,
  labels: Labels = {},
  buckets: number[] = HTTP_BUCKETS,
): void {
  let metric = histograms.get(name);
  if (!metric) {
    metric = { help, buckets: [...buckets], series: new Map() };
    histograms.set(name, metric);
  }
  const key = labelKey(labels);
  let series = metric.series.get(key);
  if (!series) {
    series = {
      labels,
      buckets: metric.buckets,
      counts: metric.buckets.map(() => 0),
      sum: 0,
      count: 0,
    };
    metric.series.set(key, series);
  }
  series.sum += value;
  series.count += 1;
  for (let i = 0; i < series.buckets.length; i += 1) {
    if (value <= series.buckets[i]) series.counts[i] += 1;
  }
}

export function setGauge(name: string, help: string, value: number, labels: Labels = {}): void {
  let metric = gauges.get(name);
  if (!metric) {
    metric = { help, series: new Map() };
    gauges.set(name, metric);
  }
  metric.series.set(labelKey(labels), { labels, value });
}

export function recordHttp(method: string, route: string, status: number, seconds: number): void {
  observeHistogram(
    HTTP_DURATION,
    'HTTP request duration in seconds',
    seconds,
    { method: method.toUpperCase(), route, status: String(status) },
    HTTP_BUCKETS,
  );
}

export function recordTus(hook: 'pre_create' | 'post_finish', result: 'ok' | 'error'): void {
  const name = hook === 'pre_create' ? TUS_PRE_CREATE : TUS_POST_FINISH;
  incCounter(name, `tusd ${hook.replace('_', '-')} hook results`, { result });
}

export function recordPhotoBytes(bytes: number): void {
  incCounter(PHOTO_BYTES, 'Uploaded photo bytes finalized by post-finish', {}, bytes);
}

export function recordSyncLag(seconds: number): void {
  observeHistogram(SYNC_LAG, 'created_at minus captured_at on insert', Math.max(0, seconds), {}, LAG_BUCKETS);
}

export function recordPhotoUploadLag(seconds: number): void {
  observeHistogram(
    PHOTO_UPLOAD_LAG,
    'uploaded_at minus point captured_at',
    Math.max(0, seconds),
    {},
    LAG_BUCKETS,
  );
}

export function recordSyncDeltaItems(n: number): void {
  observeHistogram(SYNC_DELTA_ITEMS, 'Items returned by a delta page', n, {}, ITEMS_BUCKETS);
}

export function renderPrometheus(): string {
  const lines: string[] = [];
  for (const [name, metric] of counters) {
    lines.push(`# HELP ${name} ${metric.help}`);
    lines.push(`# TYPE ${name} counter`);
    for (const series of metric.series.values()) {
      lines.push(`${name}${formatLabels(series.labels)} ${formatNum(series.value)}`);
    }
  }
  for (const [name, metric] of histograms) {
    lines.push(`# HELP ${name} ${metric.help}`);
    lines.push(`# TYPE ${name} histogram`);
    for (const series of metric.series.values()) {
      let acc = 0;
      for (let i = 0; i < series.buckets.length; i += 1) {
        acc = series.counts[i];
        lines.push(
          `${name}_bucket${formatLabels({ ...series.labels, le: String(series.buckets[i]) })} ${acc}`,
        );
      }
      lines.push(`${name}_bucket${formatLabels({ ...series.labels, le: '+Inf' })} ${series.count}`);
      lines.push(`${name}_sum${formatLabels(series.labels)} ${formatNum(series.sum)}`);
      lines.push(`${name}_count${formatLabels(series.labels)} ${series.count}`);
    }
  }
  for (const [name, metric] of gauges) {
    lines.push(`# HELP ${name} ${metric.help}`);
    lines.push(`# TYPE ${name} gauge`);
    for (const series of metric.series.values()) {
      lines.push(`${name}${formatLabels(series.labels)} ${formatNum(series.value)}`);
    }
  }
  return `${lines.join('\n')}\n`;
}

function labelKey(labels: Labels): string {
  return Object.keys(labels)
    .sort()
    .map((k) => `${k}=${labels[k]}`)
    .join(',');
}

function formatLabels(labels: Labels): string {
  const keys = Object.keys(labels).sort();
  if (keys.length === 0) return '';
  return `{${keys.map((k) => `${k}="${escapeLabel(labels[k])}"`).join(',')}}`;
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(n);
}
