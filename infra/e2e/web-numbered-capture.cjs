const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
// Consecutive browser suites share the API's ten-logins-per-minute limit.
// Retry only that explicit response, never invalid credentials or locked accounts.
async function loginWhenAllowed(attempt) {
 for (let retry=0; ; retry++) {
  const result=await attempt();
  if (result.status !== 429 || result.json?.error?.code !== 'RATE_LIMITED' || retry === 13) return result;
  await new Promise(resolve=>setTimeout(resolve,5000));
 }
}
async function main() {
 const env=process.env;
 assert.equal(env.DISPOSABLE_FINDINGS_TEST,'1');
 const api=env.API_BASE_URL, web=env.WEB_URL;
 assert.ok(['localhost','127.0.0.1'].includes(new URL(api).hostname));
 async function request(path,body,token) {
  const response=await fetch(api+'/v1'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
  const json=await response.json(); return {status:response.status,json};
 }
 const login=await loginWhenAllowed(()=>request('/auth/login',{email:'inspector@local.flaha',password:env.SEED_PASSWORD}));
 assert.equal(login.status,200);
 const token=login.json.access_token;
 // The issuance suite archives its project. Own this fixture instead of reusing it.
 const managerLogin=await loginWhenAllowed(()=>request('/auth/login',{email:'manager@local.flaha',password:env.SEED_PASSWORD}));
 assert.equal(managerLogin.status,200);
 const managerToken=managerLogin.json.access_token;
 const created=await request('/projects',{code:'NUMBERED-'+randomUUID(),name:'Numbered capture acceptance'},managerToken);
 assert.equal(created.status,201);
 const project=created.json.project;
 const membership=await request('/projects/'+project.id+'/members',{user_id:login.json.user.id,member_role:'inspector'},managerToken);
 assert.equal(membership.status,201);
 const session=randomUUID();
 const point={client_uuid:randomUUID(),project_id:project.id,category:'defect',latitude:25,longitude:51,captured_at:new Date().toISOString(),
   session_client_uuid:session,session_device_id:randomUUID(),session_started_at:new Date().toISOString(),observation_number:1};
 const first=await request('/inspection-points',point,token);
 assert.equal(first.status,201);
 const retry=await request('/inspection-points',point,token);
 assert.equal(retry.json.point.id,first.json.point.id);
 assert.equal(retry.json.point.observation_number,1);
 const second=await request('/inspection-points',{...point,client_uuid:randomUUID(),observation_number:2},token);
 assert.equal(second.status,201);
 const partial=await request('/inspection-points',{...point,client_uuid:randomUUID(),session_device_id:undefined},token);
 assert.equal(partial.status,400);
 const {chromium}=require(env.PW_RUNTIME || 'playwright');
 const browser=await chromium.launch({executablePath:env.CHROME_PATH});
 try {
  const page=await browser.newPage();
  await page.goto(web+'/login');
  await page.getByLabel('Email').fill('manager@local.flaha');
  await page.getByLabel('Password').fill(env.SEED_PASSWORD);
  const browserLogin=await loginWhenAllowed(async()=>{
   const pending=page.waitForResponse(response=>response.url().endsWith('/bff/auth/login') && response.request().method()==='POST');
   await page.getByRole('button',{name:'Log in',exact:true}).click();
   const response=await pending;
   return {status:response.status(),json:await response.json()};
  });
  assert.equal(browserLogin.status,200);
  await page.waitForURL('**/dashboard');
  await page.goto(web+'/dashboard?project='+project.id);
  await page.getByRole('cell',{name:session+' / 1',exact:true}).waitFor();
  await page.getByRole('cell',{name:session+' / 2',exact:true}).waitFor();
  for (const width of [375, 768, 1280]) {
   await page.setViewportSize({width,height:900});
   const sizes=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));
   assert.ok(sizes.content <= sizes.viewport+1, `Numbered dashboard overflows: ${JSON.stringify(sizes)}`);
   const region=page.getByRole('region',{name:'Observations',exact:true});
   await region.focus();
   assert.equal(await region.evaluate(el=>document.activeElement===el),true);
   await region.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
   const lastCell=page.getByRole('cell',{name:session+' / 1',exact:true}).locator('..').locator('td').last();
   const bounds=await lastCell.boundingBox(), viewport=await region.boundingBox();
   assert.ok(bounds.x+bounds.width <= viewport.x+viewport.width+1, 'Inspector column remains reachable');
  }
  await page.goto(web+'/points/'+first.json.point.id);
  await page.getByText('Session '+session+' / Observation 1',{exact:true}).waitFor();
  await page.reload();
  await page.getByText('Session '+session+' / Observation 1',{exact:true}).waitFor();
  console.log('PASS: real API retry and manager browser session/number display after reload');
 } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
