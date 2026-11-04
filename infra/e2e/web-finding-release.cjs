// Run against a disposable local stack with a fresh, unreleased observation and ready photo.
// Provide WEB_URL, POINT_ID, PROJECT_NAME, MANAGER_EMAIL, ASSIGNED_EMAIL, OTHER_EMAIL,
// and SEED_PASSWORD for three test accounts. PW_RUNTIME can point to installed Playwright.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

async function browserResponse(page, url) {
  return page.evaluate(async target => {
    const response = await fetch(target, { cache: 'no-store' });
    return { status: response.status, cacheControl: response.headers.get('cache-control'), size: (await response.arrayBuffer()).byteLength };
  }, url);
}

async function verifyRelease({ manager, assigned, other, web, pointId, projectName }) {
  const staffUrl = web + '/points/' + pointId;
  const findingUrl = web + '/client/findings/' + pointId;
  await manager.goto(staffUrl);
  const release = manager.getByRole('button', { name: 'Release finding', exact: true });
  await release.waitFor();
  assert.equal((await assigned.goto(findingUrl)).status(), 404);

  const summary = 'Approved test finding ' + randomUUID();
  await manager.getByLabel('Client summary').fill(summary);
  await release.click();
  await manager.getByText('Finding released to project clients.').waitFor();
  await manager.reload();
  await manager.getByText('Finding released to project clients.').waitFor();

  await assigned.goto(web + '/client');
  await assigned.getByRole('link', { name: projectName, exact: true }).click();
  await assigned.getByRole('link', { name: summary, exact: true }).click();
  await assigned.waitForURL(findingUrl);
  const exactUrl = assigned.url();
  assert.equal((await assigned.reload()).status(), 200);
  await assigned.getByText(summary, { exact: true }).waitFor();
  const evidence = assigned.getByAltText('Released finding evidence');
  await evidence.waitFor();
  await assigned.waitForFunction(() => document.querySelector('img[alt="Released finding evidence"]')?.naturalWidth > 0);
  const photoUrl = new URL(await evidence.getAttribute('src'), exactUrl).href;
  assert.equal(new URL(photoUrl).origin, web);
  const photo = await browserResponse(assigned, photoUrl);
  assert.equal(photo.status, 200);
  assert.match(photo.cacheControl, /no-store/);

  const denied = await other.goto(exactUrl);
  assert.equal(denied.status(), 404);
  assert.ok(!(await denied.text()).includes(summary));
  assert.equal((await browserResponse(other, photoUrl)).status, 404);
  for (const client of [assigned, other]) {
    assert.equal((await client.goto(staffUrl)).status(), 403);
  }
  return { exactUrl, photoUrl, summary };
}

async function verifyRevocation({ assigned, web, exactUrl, photoUrl, summary, projectName, remove }) {
  assert.equal((await assigned.goto(exactUrl)).status(), 200);
  assert.equal((await browserResponse(assigned, photoUrl)).status, 200);
  await remove();
  const denied = await assigned.reload();
  assert.equal(denied.status(), 404);
  assert.ok(!(await denied.text()).includes(summary));
  const photo = await browserResponse(assigned, photoUrl);
  assert.equal(photo.status, 404);
  assert.equal(photo.size, 0);
  assert.equal((await assigned.goto(web + '/client')).status(), 200);
  await assigned.getByText('No projects assigned.', { exact: true }).waitFor();
  assert.equal(await assigned.getByRole('link', { name: projectName }).count(), 0);
  assert.equal((await browserResponse(assigned, web + '/bff/auth/me')).status, 200);
}

module.exports = { verifyRelease, verifyRevocation };

async function main() {
  const env = process.env;
  const url = new URL(env.WEB_URL);
  assert.ok(['localhost', '127.0.0.1'].includes(url.hostname));
  assert.equal(env.DISPOSABLE_FINDINGS_TEST, '1');
  const { chromium } = require(env.PW_RUNTIME || 'playwright');
  const browser = await chromium.launch({ executablePath: env.CHROME_PATH });
  try {
    async function login(email, landing) {
      const page = await browser.newPage();
      await page.goto(url.origin + '/login');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(env.SEED_PASSWORD);
      await page.getByRole('button', { name: 'Log in' }).click();
      await page.waitForURL(url.origin + landing);
      return page;
    }
    if (!env.WEB_GATE_FIXTURE) {
      const manager = await login(env.MANAGER_EMAIL, '/dashboard');
      const assigned = await login(env.ASSIGNED_EMAIL, '/client');
      const other = await login(env.OTHER_EMAIL, '/client');
      await verifyRelease({ manager, assigned, other, web: url.origin, pointId: env.POINT_ID, projectName: env.PROJECT_NAME });
      return;
    }
    const api = new URL(env.API_BASE || 'http://127.0.0.1:3001');
    assert.ok(['localhost', '127.0.0.1'].includes(api.hostname));
    const { projectId, pointId } = JSON.parse(require('node:fs').readFileSync(env.WEB_GATE_FIXTURE, 'utf8'));
    async function request(method, path, token, body) {
      const response = await fetch(api.origin + '/v1' + path, { method, headers: {
        'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}),
      }, body: body && JSON.stringify(body) });
      assert.ok(response.ok, method + ' ' + path + ' returned ' + response.status);
      return response.json();
    }
    const email = env.MANAGER_EMAIL || 'manager@local.flaha';
    const { access_token: token } = await request('POST','/auth/login',null,{ email, password: env.SEED_PASSWORD });
    const { project } = await request('GET','/projects/' + projectId,token);
    const { project: second } = await request('POST','/projects',token,{ name:'Other gate project',code:randomUUID().slice(0,8) });
    async function client(id) {
      const { user } = await request('POST','/users',token,{ email:randomUUID()+'@example.test', password:env.SEED_PASSWORD, role:'client',full_name:'Browser test client' });
      await request('POST','/projects/'+id+'/members',token,{user_id:user.id,member_role:'client'});
      return user;
    }
    const owner = await client(projectId);
    const outsider = await client(second.id);
    const manager = await login(email, '/dashboard');
    const assigned = await login(owner.email, '/client');
    const other = await login(outsider.email, '/client');
    const published = await verifyRelease({ manager, assigned, other, web:url.origin, pointId, projectName:project.name });
    await verifyRevocation({ assigned,web:url.origin,...published,projectName:project.name,
      remove: () => request('DELETE','/projects/'+projectId+'/members/'+owner.id,token) });
    console.log('Passed manager release, assigned client access, cross-project denial and same-session revocation.');
  } finally {
    await browser.close();
  }
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
