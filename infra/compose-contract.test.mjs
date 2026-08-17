import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const compose = readFileSync(join(root, 'infra', 'docker-compose.yml'), 'utf8');
const envExample = readFileSync(join(root, '.env.example'), 'utf8');
const init = readFileSync(join(root, 'infra', 'minio', 'init.sh'), 'utf8');

test('compose does not introduce Redis (KD-17)', () => {
  const serviceNames = [...compose.matchAll(/^  ([a-z0-9-]+):$/gm)].map((m) => m[1]);
  assert.ok(!serviceNames.includes('redis'));
  assert.doesNotMatch(compose, /^\s+image:.*redis/im);
  assert.doesNotMatch(compose, /\bbullmq\b/i);
});

test('tusd hook traffic is not published as a host port', () => {
  assert.match(compose, /hooks-http=http:\/\/api:3001\/internal\/tus/);
  const tusdStart = compose.indexOf('\n  tusd:\n');
  const apiStart = compose.indexOf('\n  api:\n');
  assert.ok(tusdStart >= 0 && apiStart > tusdStart);
  const tusdBlock = compose.slice(tusdStart, apiStart);
  assert.match(tusdBlock, /"\$\{TUSD_PORT:-1080\}:8080"/);
  assert.doesNotMatch(tusdBlock, /:8081/);
  assert.doesNotMatch(tusdBlock, /:1081/);
});

test('MinIO init forces a private bucket', () => {
  assert.match(init, /mc anonymous set none/);
  assert.doesNotMatch(init, /anonymous set download/);
  assert.doesNotMatch(init, /anonymous set public/);
});

test('.env.example includes TILE_PROVIDER_URL (KD-35) and hook secret', () => {
  assert.match(envExample, /^TILE_PROVIDER_URL=/m);
  assert.match(envExample, /^TUSD_HOOK_SECRET=/m);
  assert.match(envExample, /^S3_BUCKET=/m);
});

test('compose runs PostGIS, MinIO, tusd, api, and worker', () => {
  for (const name of ['postgres:', 'minio:', 'minio-init:', 'tusd:', 'api:', 'worker:']) {
    assert.match(compose, new RegExp(`^  ${name}`, 'm'));
  }
  assert.match(compose, /postgis\/postgis:16/);
});
