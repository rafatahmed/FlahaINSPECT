// Run against a disposable local stack with a fresh, unreleased observation and ready photo.
// Provide WEB_URL, POINT_ID, PROJECT_NAME, MANAGER_EMAIL, ASSIGNED_EMAIL, OTHER_EMAIL,
// and SEED_PASSWORD for three test accounts. PW_RUNTIME can point to installed Playwright.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

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
  const photo = await assigned.request.get(photoUrl);
  assert.equal(photo.status(), 200);
  assert.match(photo.headers()['cache-control'], /no-store/);

  const denied = await other.goto(exactUrl);
  assert.equal(denied.status(), 404);
  assert.ok(!(await denied.text()).includes(summary));
  assert.equal((await other.request.get(photoUrl)).status(), 404);
  for (const client of [assigned, other]) {
    assert.equal((await client.goto(staffUrl)).status(), 403);
  }
  return { exactUrl, photoUrl, summary };
}

module.exports = { verifyRelease };

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
    const manager = await login(env.MANAGER_EMAIL, '/dashboard');
    const assigned = await login(env.ASSIGNED_EMAIL, '/client');
    const other = await login(env.OTHER_EMAIL, '/client');
    await verifyRelease({ manager, assigned, other, web: url.origin, pointId: env.POINT_ID, projectName: env.PROJECT_NAME });
    console.log('Passed manager release, assigned client viewing and cross-project URL isolation.');
  } finally {
    await browser.close();
  }
}
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
