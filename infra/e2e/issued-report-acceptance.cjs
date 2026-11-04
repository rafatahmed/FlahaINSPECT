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
async function run() {
  assert.equal(process.env.DISPOSABLE_FINDINGS_TEST, '1');
  assert.ok(new URL(process.env.DATABASE_URL).pathname.endsWith('_disposable'));
  for (const url of [web, api, process.env.S3_ENDPOINT])
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
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
  });
  try {
    async function login(email, landing) {
      const context = await browser.newContext();
      const p = await context.newPage();
      await p.goto(web + '/login');
      await p.getByLabel('Email').fill(email);
      await p.getByLabel('Password').fill(password);
      await p.getByRole('button', { name: 'Log in' }).click();
      await p.waitForURL(web + landing);
      return p;
    }
    const manager = await login('manager@local.flaha', '/dashboard');
    const assigned = await login(clients[0].email, '/client');
    const other = await login(clients[1].email, '/client');
    async function issue(summary, revision) {
      await manager.goto(web + '/reports/issue/' + a.id);
      await manager.getByLabel('Approved summary 1').fill(summary);
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
    const exact = assigned.url();
    assert.equal((await assigned.reload()).status(), 200);
    const photoUrl = new URL(
      await assigned
        .getByRole('link', { name: 'View PDF' })
        .getAttribute('href'),
      web,
    ).href;
    const pdf = await assigned.request.get(photoUrl);
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
    assert.equal((await other.request.get(photoUrl)).status(), 404);
    await issue('Corrected revision two', 2);
    const second = await revision(2);
    assert.notEqual(first.id, second.id);
    assert.deepEqual(
      await (await assigned.request.get(photoUrl)).body(),
      firstBytes,
    );
    const secondBytes = await (
      await assigned.request.get(
        web + '/bff/client/reports/' + second.id + '/file',
      )
    ).body();
    await require('node:fs/promises').writeFile(
      process.env.AUDIT_PDF_PATH + '-2.pdf',
      secondBytes,
    );
    assert.notDeepEqual(firstBytes, secondBytes);
    const deleted = await fetch(
      api + '/v1/projects/' + a.id + '/members/' + clients[0].userId,
      { method: 'DELETE', headers: { authorization: 'Bearer ' + m } },
    );
    assert.equal(deleted.status, 200);
    assert.equal((await assigned.goto(exact)).status(), 404);
    assert.equal((await assigned.request.get(photoUrl)).status(), 404);
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
