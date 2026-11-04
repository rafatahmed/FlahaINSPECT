const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
async function main() {
 const env=process.env;
 assert.equal(env.DISPOSABLE_FINDINGS_TEST,'1');
 const api=env.API_BASE_URL, web=env.WEB_URL;
 assert.ok(['localhost','127.0.0.1'].includes(new URL(api).hostname));
 async function request(path,body,token) {
  const response=await fetch(api+'/v1'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
  const json=await response.json(); return {status:response.status,json};
 }
 const login=await request('/auth/login',{email:'inspector@local.flaha',password:env.SEED_PASSWORD});
 assert.equal(login.status,200);
 const token=login.json.access_token;
 const projects=await request('/projects',undefined,token);
 const project=projects.json.items.find(p=>p.code==='LOCAL') || projects.json.items[0];
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
  await page.getByRole('button',{name:'Log in',exact:true}).click();
  await page.waitForURL('**/dashboard');
  await page.goto(web+'/dashboard?project='+project.id);
  await page.getByRole('cell',{name:session+' / 1',exact:true}).waitFor();
  await page.getByRole('cell',{name:session+' / 2',exact:true}).waitFor();
  await page.goto(web+'/points/'+first.json.point.id);
  await page.getByText('Session '+session+' / Observation 1',{exact:true}).waitFor();
  await page.reload();
  await page.getByText('Session '+session+' / Observation 1',{exact:true}).waitFor();
  console.log('PASS: real API retry and manager browser session/number display after reload');
 } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
