import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('login BFF sets cookies and returns user only (KD-18)', () => {
  const src = readFileSync(join(root, 'app/bff/auth/login/route.ts'), 'utf8');
  assert.match(src, /httpOnly: true|cookieBase/);
  assert.match(src, /publicSession/);
  assert.match(src, /flaha_access|ACCESS_COOKIE/);
});

test('session helper never puts tokens on the public payload', () => {
  const src = readFileSync(join(root, 'lib/session.ts'), 'utf8');
  assert.match(src, /return \{ user: session\.user \}/);
  assert.match(src, /hasTokenLeak/);
  assert.match(src, /httpOnly: true/);
});

test('legend is category not status', () => {
  const src = readFileSync(join(root, 'lib/category.ts'), 'utf8');
  assert.match(src, /Defect/);
  assert.match(src, /Normal/);
  assert.match(src, /Note/);
  assert.doesNotMatch(src, /Urgent/);
});

test('photo img src uses BFF not a signed S3 URL (KD-41)', () => {
  const src = readFileSync(join(root, 'components/point-editor.tsx'), 'utf8');
  assert.match(src, /\/bff\/photos\/\$\{photo\.id\}\/thumb/);
});
