import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Exercise the same policy used by the client and server with Node's test runner.
const source = readFileSync(new URL('../lib/workspace.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { afterLogin, mayOpen, mayUseStaffApi } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
);

test('each role gets its own landing and only permitted deep links', () => {
  assert.equal(afterLogin('manager'), '/dashboard');
  assert.equal(afterLogin('inspector', '/reports'), '/projects');
  assert.equal(afterLogin('inspector', '/projects?project=123'), '/projects?project=123');
  assert.equal(afterLogin('client', '/projects'), '/client');
  for (const next of ['//outside.example/client', '/client/../users', '/bff/users']) {
    assert.equal(afterLogin('client', next), '/client');
  }
  assert.equal(mayOpen('manager', '/client'), false);
  assert.equal(mayOpen('inspector', '/dashboard'), false);
  assert.equal(mayOpen('client', '/points/123'), false);
});

test('inspectors can read assigned evidence through staff routes; clients cannot', () => {
  for (const path of ['/projects', '/projects/id/stats', '/inspection-points?project_id=id',
    '/inspection-points/id', '/photos/id']) {
    assert.equal(mayUseStaffApi('inspector', 'GET', path), true);
    assert.equal(mayUseStaffApi('client', 'GET', path), false);
  }
  for (const [method, path] of [['GET', '/users'], ['GET', '/projects/id/reports'],
    ['PATCH', '/inspection-points/id'], ['DELETE', '/inspection-points/id']]) {
    assert.equal(mayUseStaffApi('inspector', method, path), false);
    assert.equal(mayUseStaffApi('manager', method, path), true);
  }
});
