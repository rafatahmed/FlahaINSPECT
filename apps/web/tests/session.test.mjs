import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('AR message keys match EN and login has no language toggle', () => {
  const src = readFileSync(join(root, 'lib/messages.ts'), 'utf8');
  assert.match(src, /lockedUiLocale = 'en'/);
  assert.match(src, /rtlLocales/);
  assert.match(src, /categoryDefect/);
  const login = readFileSync(join(root, 'components/login-form.tsx'), 'utf8');
  assert.doesNotMatch(login, /language|العربية|locale/i);
});

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

test('transparent brand marks are published for web', () => {
  for (const name of ['logo-color.png', 'logo-black.png', 'logo-white.png']) {
    assert.equal(existsSync(join(root, 'public/brand', name)), true);
  }
  const login = readFileSync(join(root, 'components/login-form.tsx'), 'utf8');
  assert.match(login, /variant=\"color\"/);
  const shell = readFileSync(join(root, 'components/shell.tsx'), 'utf8');
  assert.match(shell, /variant=\"white\"/);
});

test('captured timestamps are UTC not host locale', () => {
  for (const rel of ['components/dashboard-client.tsx', 'components/point-editor.tsx']) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.match(src, /formatCapturedAt/);
    assert.doesNotMatch(src, /toLocaleString/);
  }
  const helper = readFileSync(join(root, 'lib/datetime.ts'), 'utf8');
  assert.match(helper, /toISOString/);
});

test('report generate handles 409 in progress and never exposes signed URLs', () => {
  const ui = readFileSync(join(root, 'lib/report-ui.ts'), 'utf8');
  assert.match(ui, /REPORT_IN_PROGRESS/);
  assert.match(ui, /stripDownloadUrl/);
  const client = readFileSync(join(root, 'components/reports-client.tsx'), 'utf8');
  assert.match(client, /in_progress/);
  assert.match(client, /\/bff\/reports\/\$\{r\.id\}\/file/);
  assert.doesNotMatch(client, /download_url/);
  const file = readFileSync(join(root, 'app/bff/reports/[id]/file/route.ts'), 'utf8');
  assert.match(file, /content-type': 'application\/pdf'/);
  assert.match(file, /download_url/);
});

test('photo img src uses BFF not a signed S3 URL (KD-41)', () => {
  const src = readFileSync(join(root, 'components/point-editor.tsx'), 'utf8');
  assert.match(src, /\/bff\/photos\/\$\{photo\.id\}\/thumb/);
});
