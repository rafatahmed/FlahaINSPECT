/**
 * Compose e2e: login → point → tus → list → PDF.
 * Requires a seeded API (manager@local.flaha) and running tusd + worker.
 */
import { createHash, randomUUID } from 'node:crypto';

const API = (process.env.API_BASE ?? 'http://127.0.0.1:3001').replace(/\/$/, '');
const TUSD = (process.env.TUSD_URL ?? 'http://127.0.0.1:1080/files/').replace(/\/?$/, '/');
const EMAIL = process.env.E2E_EMAIL ?? 'manager@local.flaha';
const PASSWORD = process.env.SEED_PASSWORD;
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function fail(step, detail) {
  console.error(`e2e fail at ${step}:`, detail);
  process.exit(1);
}

async function json(method, path, { token, body, expect: expected } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  if (expected && !expected.includes(res.status)) {
    fail(`${method} ${path}`, `status ${res.status} body=${text.slice(0, 500)}`);
  }
  return { status: res.status, json: parsed, text };
}

function b64(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!PASSWORD || PASSWORD.length < 10) {
    fail('env', 'SEED_PASSWORD must be set (same value used by db:seed)');
  }

  const metrics = await fetch(`${API}/metrics`);
  if (!metrics.ok) fail('metrics', `GET /metrics ${metrics.status}`);
  const metricsText = await metrics.text();
  if (!metricsText.includes('http_request_duration_seconds') && !metricsText.includes('# TYPE')) {
    // First scrape may be empty of HTTP series; still must be Prometheus text or empty gauges.
    console.log('metrics endpoint reachable');
  }

  const login = await json('POST', '/v1/auth/login', {
    body: { email: EMAIL, password: PASSWORD },
    expect: [200],
  });
  const token = login.json?.access_token;
  if (!token) fail('login', login.text);

  const projects = await json('GET', '/v1/projects?archived=false', { token, expect: [200] });
  const projectId = projects.json?.items?.[0]?.id;
  if (!projectId) fail('projects', 'no seeded project');

  const clientUuid = randomUUID();
  const point = await json('POST', '/v1/inspection-points', {
    token,
    body: {
      client_uuid: clientUuid,
      project_id: projectId,
      category: 'note',
      note: 'e2e probe',
      latitude: 25.2854,
      longitude: 51.531,
      captured_at: new Date().toISOString(),
    },
    expect: [201, 200],
  });
  const pointId = point.json?.point?.id;
  if (!pointId) fail('point', point.text);

  const photoClient = randomUUID();
  const sha256 = createHash('sha256').update(PNG).digest('hex');
  const registered = await json('POST', '/v1/photos', {
    token,
    body: {
      client_uuid: photoClient,
      inspection_point_client_uuid: clientUuid,
      project_id: projectId,
      sha256,
      byte_size: PNG.length,
      content_type: 'image/png',
      original_filename: 'probe.png',
    },
    expect: [201, 200],
  });
  const uploadToken = registered.json?.photo?.upload_token;
  const photoId = registered.json?.photo?.id;
  if (!uploadToken || !photoId) fail('photo-register', registered.text);

  const create = await fetch(TUSD, {
    method: 'POST',
    headers: {
      'tus-resumable': '1.0.0',
      'upload-length': String(PNG.length),
      authorization: `Bearer ${uploadToken}`,
      'upload-metadata': [
        `filename ${b64('probe.png')}`,
        `filetype ${b64('image/png')}`,
        `photo_client_uuid ${b64(photoClient)}`,
      ].join(','),
    },
  });
  if (![201, 200].includes(create.status)) {
    fail('tus-create', `${create.status} ${await create.text()}`);
  }
  const location = create.headers.get('location');
  if (!location) fail('tus-create', 'missing Location');
  const uploadId = location.replace(/\/$/, '').split('/').pop();
  const patchUrl = `${TUSD}${uploadId}`;
  const patch = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'tus-resumable': '1.0.0',
      'upload-offset': '0',
      'content-type': 'application/offset+octet-stream',
      authorization: `Bearer ${uploadToken}`,
    },
    body: PNG,
  });
  if (![204, 200].includes(patch.status)) {
    fail('tus-patch', `${patch.status} ${await patch.text()}`);
  }

  let photoStatus = '';
  for (let i = 0; i < 30; i += 1) {
    const photo = await json('GET', `/v1/photos/${photoId}`, { token, expect: [200] });
    photoStatus = photo.json?.photo?.status ?? '';
    if (photoStatus === 'processing' || photoStatus === 'ready') break;
    await sleep(2000);
  }
  if (photoStatus !== 'processing' && photoStatus !== 'ready') {
    fail('tus-finalize', `photo status ${photoStatus}`);
  }

  const list = await json('GET', `/v1/inspection-points?project_id=${projectId}`, {
    token,
    expect: [200],
  });
  const found = (list.json?.items ?? []).some((p) => p.id === pointId);
  if (!found) fail('list', 'created point missing from list');

  const report = await json('POST', `/v1/projects/${projectId}/reports`, {
    token,
    body: { title: 'e2e' },
    expect: [202, 409],
  });
  const reportId = report.json?.report?.id ?? report.json?.error?.details?.report_id;
  if (!reportId) fail('report-create', report.text);

  let reportStatus = '';
  for (let i = 0; i < 45; i += 1) {
    const got = await json('GET', `/v1/reports/${reportId}`, { token, expect: [200] });
    reportStatus = got.json?.report?.status ?? '';
    if (reportStatus === 'ready' || reportStatus === 'failed') break;
    await sleep(2000);
  }
  if (reportStatus !== 'ready') {
    fail('report-ready', `status ${reportStatus}`);
  }

  const after = await fetch(`${API}/metrics`);
  const body = await after.text();
  if (!body.includes('http_request_duration_seconds')) {
    fail('metrics-series', body.slice(0, 400));
  }

  console.log('e2e ok', { projectId, pointId, photoId, photoStatus, reportId });
}

main().catch((err) => {
  fail('uncaught', err instanceof Error ? err.stack : String(err));
});
