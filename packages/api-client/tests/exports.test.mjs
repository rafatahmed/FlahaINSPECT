import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'index.ts'),
  'utf8',
);

test('stub exports the locked product name and API prefix', () => {
  assert.match(src, /export const PRODUCT = 'FlahaINSPECT'/);
  assert.match(src, /export const API_PREFIX = '\/v1'/);
});
