const assert = require('node:assert/strict'),
  { randomUUID, createHash } = require('node:crypto'),
  path = require('node:path');
const dep = require('node:module').createRequire(
  path.resolve('apps/api/package.json'),
);
const { Client } = dep('pg'),
  s3 = dep('@aws-sdk/client-s3'),
  { chromium } = require(process.env.PW_RUNTIME);
const web = process.env.WEB_URL,
  api = process.env.API_BASE,
  password = process.env.SEED_PASSWORD;
async function call(token, p, body) {
  const r = await fetch(api + '/v1' + p, {
    method: body ? 'POST' : 'GET',
    headers: {
      'content-type': 'application/json',
      ...(token && { authorization: 'Bearer ' + token }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}
async function ok(t, p, b) {
  const r = await call(t, p, b);
  assert.ok(r.status < 300, p + ' ' + r.status);
  return r.data;
}

// Fetch protected bytes inside the signed-in browser, including Secure localhost cookies.
async function browserGet(page, url) {
  const result = await page.evaluate(async target => {
    const response = await fetch(target, { cache: 'no-store' });
    return { status: response.status, bytes: Array.from(new Uint8Array(await response.arrayBuffer())) };
  }, url);
  return { status: () => result.status, body: async () => Buffer.from(result.bytes) };
}
async function assertNarrow(page, label) {
  await page.setViewportSize({ width: 375, height: 812 });
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  assert.ok(sizes.content <= sizes.viewport + 1, `${label} overflows: ${JSON.stringify(sizes)}`);
  await page.setViewportSize({ width: 1280, height: 900 });
}
async function run() {
  assert.equal(process.env.DISPOSABLE_FINDINGS_TEST, '1');
  assert.ok(new URL(process.env.DATABASE_URL).pathname.endsWith('_disposable'));
  for (const url of [web, api, process.env.S3_ENDPOINT, process.env.DATABASE_URL])
    assert.ok(['localhost', '127.0.0.1'].includes(new URL(url).hostname));
  for (const url of [api + '/health', web + '/login']) {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      if (
        await fetch(url)
          .then((r) => r.ok)
          .catch(() => false)
      ) {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.ok(ready, url);
  }
  const token = async (email) =>
    (await ok(null, '/auth/login', { email, password })).access_token;
  const m = await token('manager@local.flaha'),
    i = await token('inspector@local.flaha');
  const [a] = (await ok(i, '/projects')).items,
    b = (
      await ok(m, '/projects', { code: 'B', name: 'Synthetic second project' })
    ).project;
  const clients = [];
  for (const [project, email] of [
    [a, 'assigned@example.test'],
    [b, 'other@example.test'],
  ]) {
    const { user } = await ok(m, '/users', {
      email,
      password,
      full_name: 'Synthetic client',
      role: 'client',
    });
    await ok(m, '/projects/' + project.id + '/members', {
      user_id: user.id,
      member_role: 'client',
    });
    const t = await token(email);
    assert.deepEqual(
      (await ok(t, '/client/projects')).items.map((x) => x.id),
      [project.id],
    );
    clients.push({ email, t, project, userId: user.id });
  }
  const secret = 'Private field note ' + randomUUID(),
    { point } = await ok(i, '/inspection-points', {
      client_uuid: randomUUID(),
      project_id: a.id,
      category: 'defect',
      latitude: 25,
      longitude: 51,
      captured_at: new Date().toISOString(),
      note: secret,
    });
  const photo = randomUUID(),
    bytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jU1sAAAAASUVORK5CYII=',
      'base64',
    ),
    key = 'photos/' + photo + '.png';
  const storage = new s3.S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: 'us-east-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
  });
  await storage.send(new s3.CreateBucketCommand({ Bucket: 'ci-private' }));
  await storage.send(
    new s3.PutObjectCommand({
      Bucket: 'ci-private',
      Key: key,
      Body: bytes,
      ContentType: 'image/png',
    }),
  );
  storage.destroy();
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    await db.query(
      "insert into photos(id,client_uuid,inspection_point_id,project_id,sha256,byte_size,content_type,storage_key,thumbnail_key,status) values($1,$2,$3,$4,$5,$6,'image/png',$7,$7,'ready')",
      [
        photo,
        randomUUID(),
        point.id,
        a.id,
        createHash('sha256').update(bytes).digest('hex'),
        bytes.length,
        key,
      ],
    );
  } finally {
    await db.end();
  }
  await ok(m, '/inspection-points/' + point.id + '/release', {
    version: point.version,
    summary: 'Approved snapshot',
  });

  // Expo's manager list must retain publication state after reopening or refreshing.
  for (let refresh = 0; refresh < 2; refresh++) {
    const managerItems = (await ok(m, '/inspection-points?project_id=' + a.id)).items;
    assert.equal(managerItems.find(item => item.id === point.id).release?.summary, 'Approved snapshot');
    const inspectorItems = (await ok(i, '/inspection-points?project_id=' + a.id)).items;
    assert.equal(Object.hasOwn(inspectorItems.find(item => item.id === point.id), 'release'), false);
  }
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
  });
  try {
    async function login(email, landing) {
      const context = await browser.newContext();
      const p = await context.newPage();
      await p.goto(web + '/login');
      await assertNarrow(p, 'Login');
      await p.getByLabel('Email').fill(email);
      await p.getByLabel('Password').fill(password);
      await p.getByLabel('Password').press('Enter');
      await p.waitForURL(web + landing);
      await assertNarrow(p, landing);
      return p;
    }
    const manager = await login('manager@local.flaha', '/dashboard');
    const assigned = await login(clients[0].email, '/client');
    const other = await login(clients[1].email, '/client');

    await login('inspector@local.flaha', '/projects');
    const peer = await login('manager@local.flaha', '/dashboard');
    await manager.goto(web + '/points/' + point.id);
    await peer.goto(web + '/points/' + point.id);
    for (const page of [manager, peer]) {
      await page.getByLabel('Field note', { exact: true }).waitFor();
      await page.getByLabel('Recommended procedure', { exact: true }).waitFor();
      await page.getByLabel('Status', { exact: true }).waitFor();
      await assertNarrow(page, 'Observation editor');
    }
    await manager.getByLabel('Remarks', { exact: true }).fill('Manager A edit');
    await peer.getByLabel('Remarks', { exact: true }).fill('Manager B edit');
    const beforeEdit = (await ok(m, '/inspection-points/' + point.id)).point;
    const raceDb = new Client({ connectionString: process.env.DATABASE_URL });
    await raceDb.connect();
    try {
      await raceDb.query("CREATE FUNCTION test_slow_edit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM pg_sleep(0.3); RETURN NEW; END $$");
      await raceDb.query("CREATE TRIGGER test_slow_edit BEFORE UPDATE ON inspection_points FOR EACH ROW EXECUTE FUNCTION test_slow_edit()");
      const edits = await Promise.all([manager, peer].map(async page => {
        const response = page.waitForResponse(r => r.url().includes('/bff/inspection-points/' + point.id) && r.request().method() === 'PATCH');
        await page.getByRole('button', { name: 'Save', exact: true }).focus();
        await page.keyboard.press('Enter');
        return (await response).status();
      }));
      assert.deepEqual(edits.sort(), [200, 409], 'concurrent edits must reject the stale writer');
      const latest = (await ok(m, '/inspection-points/' + point.id)).point;
      assert.equal(latest.version, beforeEdit.version + 1);
      assert.ok(['Manager A edit', 'Manager B edit'].includes(latest.remarks));
    } finally {
      await raceDb.query('DROP TRIGGER IF EXISTS test_slow_edit ON inspection_points');
      await raceDb.query('DROP FUNCTION IF EXISTS test_slow_edit()');
      await raceDb.end();
    }
    async function issue(summary, revision) {
      await manager.goto(web + '/reports/issue/' + a.id);
      await manager.getByLabel('Approved summary 1').fill(summary);
      await assertNarrow(manager, 'Report issuance');
      const response = manager.waitForResponse(
        (r) =>
          r.url().endsWith('/issued-reports') &&
          r.request().method() === 'POST',
      );
      await manager.getByRole('button', { name: 'Issue new revision' }).click();
      const got = await response;
      assert.equal(got.status(), 202);
      const created = await got.json();
      const original = got.request().postDataJSON();
      const retries = await Promise.all([
        call(m, '/projects/' + a.id + '/issued-reports', original),
        call(m, '/projects/' + a.id + '/issued-reports', original),
      ]);
      assert.ok(
        retries.every(
          (r) => r.status === 202 && r.data.report.id === created.report.id,
        ),
      );
      console.log('Revision', revision, 'queued and retries kept the same ID');
      await manager
        .getByRole('status')
        .filter({ hasText: 'Revision ' + revision + ' queued' })
        .waitFor();
    }
    const deniedIssue = await call(
      clients[0].t,
      '/projects/' + a.id + '/issued-reports',
      { request_id: randomUUID(), summaries: [] },
    );
    assert.equal(deniedIssue.status, 403);
    const verifyDb = new Client({ connectionString: process.env.DATABASE_URL });
    await verifyDb.connect();
    try {
      await verifyDb.query(
        "ALTER TABLE jobs ADD CONSTRAINT test_issue_enqueue CHECK (type <> 'generate_report')",
      );
      const failed = await call(m, '/projects/' + a.id + '/issued-reports', {
        request_id: randomUUID(),
        summaries: [],
      });
      assert.equal(failed.status, 500);
      assert.equal(
        (await verifyDb.query('SELECT count(*)::int AS n FROM reports')).rows[0]
          .n,
        0,
      );
    } finally {
      await verifyDb.query(
        'ALTER TABLE jobs DROP CONSTRAINT test_issue_enqueue',
      );
      await verifyDb.end();
    }
    await issue('Approved revision one', 1);
    async function revision(n) {
      for (let k = 0; k < 80; k++) {
        const r = await call(
          clients[0].t,
          '/client/projects/' + a.id + '/reports',
        );
        const found = r.data.items?.find((x) => x.revision === n);
        if (found) return found;
        await new Promise((r) => setTimeout(r, 500));
      }
      throw Error('Issued report did not become ready');
    }
    const first = await revision(1);
    await assigned.goto(web + '/client');
    await assigned.getByRole('link', { name: a.name, exact: true }).click();
    await assigned
      .getByRole('link', { name: 'Issued reports', exact: true })
      .click();
    await assigned
      .getByRole('link', { name: 'Revision 1', exact: true })
      .click();
    await assertNarrow(assigned, 'Issued report');
    const exact = assigned.url();
    assert.equal((await assigned.reload()).status(), 200);
    const photoUrl = new URL(
      await assigned
        .getByRole('link', { name: 'View PDF' })
        .getAttribute('href'),
      web,
    ).href;
    const pdf = await browserGet(assigned, photoUrl);
    assert.equal(pdf.status(), 200);
    const firstBytes = await pdf.body();
    await require('node:fs/promises').writeFile(
      process.env.AUDIT_PDF_PATH + '-1.pdf',
      firstBytes,
    );
    const downloaded = assigned.waitForEvent('download');
    await assigned
      .getByRole('button', { name: 'Download', exact: true })
      .click();
    assert.deepEqual(
      await require('node:fs/promises').readFile(
        await (await downloaded).path(),
      ),
      firstBytes,
    );
    assert.equal((await other.goto(exact)).status(), 404);
    assert.equal((await browserGet(other, photoUrl)).status(), 404);
    await issue('Corrected revision two', 2);
    const second = await revision(2);
    assert.notEqual(first.id, second.id);
    assert.deepEqual(
      await (await browserGet(assigned, photoUrl)).body(),
      firstBytes,
    );
    const secondBytes = await (
      await browserGet(assigned,
        web + '/bff/client/reports/' + second.id + '/file',
      )
    ).body();
    await require('node:fs/promises').writeFile(
      process.env.AUDIT_PDF_PATH + '-2.pdf',
      secondBytes,
    );
    assert.notDeepEqual(firstBytes, secondBytes);

    await ok(m, '/projects/' + a.id + '/archive', {});
    assert.ok(!(await ok(i, '/projects?archived=false')).items.some(project => project.id === a.id));
    const archivedCapture = await call(i, '/inspection-points', {
      client_uuid: randomUUID(), project_id: a.id, category: 'note',
      latitude: 25, longitude: 51, captured_at: new Date().toISOString(),
    });
    assert.equal(archivedCapture.data.error?.code, 'PROJECT_ARCHIVED');
    assert.equal((await browserGet(assigned, photoUrl)).status(), 200);
    console.log('PASS archive blocks new capture while preserving authorized issued PDF access.');
    const deleted = await fetch(
      api + '/v1/projects/' + a.id + '/members/' + clients[0].userId,
      { method: 'DELETE', headers: { authorization: 'Bearer ' + m } },
    );
    assert.equal(deleted.status, 200);
    assert.equal((await assigned.goto(exact)).status(), 404);
    assert.equal((await browserGet(assigned, photoUrl)).status(), 404);
    await assigned.goto(web + '/client');
    await assigned
      .getByText('No projects assigned.', { exact: true })
      .waitFor();
    console.log(
      'PASS manager issuance, client navigation and download, revisions 1 and 2 with immutable original bytes, other-client denial and same-session revocation.',
    );
  } finally {
    await browser.close();
  }
}
run().catch((e) => {
  console.error(e.message.split('Call log:')[0]);
  process.exitCode = 1;
});
