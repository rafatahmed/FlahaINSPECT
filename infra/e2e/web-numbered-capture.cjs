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
  const expectedPhoto=randomUUID();
  const ended=await request('/inspection-sessions/'+session+'/end',{
   device_id:point.session_device_id,ended_at:new Date().toISOString(),allocated_count:2,
   observations:[{client_uuid:point.client_uuid,observation_number:1,photo_client_uuid:expectedPhoto,disposition:'saved'},
    {client_uuid:second.json.point.client_uuid,observation_number:2,photo_client_uuid:randomUUID(),disposition:'saved'}]
  },token);
  assert.equal(ended.status,201);
  const progress=await request('/inspection-sessions/'+session+'/sync-state',{device_id:point.session_device_id,sequence:1,pending:2,failed:1,complete:false},token);
  assert.equal(progress.status,201);
  const premature=await request('/inspection-sessions/'+session+'/sync-state',{device_id:point.session_device_id,sequence:2,pending:0,failed:0,complete:true},token);
  assert.equal(premature.status,409);
  await page.goto(web+'/dashboard?project='+project.id);
  const sessionCard=page.getByRole('heading',{name:'Session '+session,exact:true}).locator('..');
  await sessionCard.getByText('Ended — pending',{exact:true}).waitFor();
  await sessionCard.getByText(/Pending: 2; failed: 1/).waitFor();
  await page.reload();
  await page.getByRole('heading',{name:'Session '+session,exact:true}).locator('..').getByText('Ended — pending',{exact:true}).waitFor();
  const otherEmail='session-peer-'+randomUUID()+'@example.test';
  const otherUser=await request('/users',{email:otherEmail,password:env.SEED_PASSWORD,full_name:'Other inspector',role:'inspector'},managerToken);
  assert.equal(otherUser.status,201);
  assert.equal((await request('/projects/'+project.id+'/members',{user_id:otherUser.json.user.id,member_role:'inspector'},managerToken)).status,201);
  const peerLogin=await loginWhenAllowed(()=>request('/auth/login',{email:otherEmail,password:env.SEED_PASSWORD}));
  assert.equal(peerLogin.status,200);
  const photoPayload={client_uuid:expectedPhoto,inspection_point_client_uuid:point.client_uuid,project_id:project.id,byte_size:1,sha256:'d'.repeat(64),session_device_id:point.session_device_id};
  assert.equal((await request('/photos',photoPayload,peerLogin.json.access_token)).status,403);
  assert.equal((await request('/photos',{...photoPayload,session_device_id:randomUUID()},token)).status,409);
  assert.equal((await request('/photos',photoPayload,token)).status,201);
  console.log('PASS: actual HTTP rejects another inspector and phone at late-photo registration');
  // Manager browser closes a visit whose evidence still exists only on the phone.
  const lostId=randomUUID(), lostDevice=randomUUID(), recoveredPhoto=randomUUID();
  const savedPoint={...point,client_uuid:randomUUID(),session_client_uuid:lostId,session_device_id:lostDevice,observation_number:10001};
  assert.equal((await request('/inspection-sessions',{client_uuid:lostId,project_id:project.id,device_id:lostDevice,started_at:point.session_started_at},token)).status,201);
  await page.goto(web+'/dashboard?project='+project.id);
  const lostCard=page.getByRole('heading',{name:'Session '+lostId,exact:true}).locator('..');
  await lostCard.getByLabel('Closure reason').fill('Phone lost during site visit');
  page.once('dialog',dialog=>dialog.accept());
  await lostCard.getByRole('button',{name:'Close lost-phone session',exact:true}).click();
  await lostCard.getByText(/Administratively closed.*unknown/).waitFor();
  await page.reload();
  await lostCard.getByText(/Closure reason: Phone lost during site visit/).waitFor();
  const returned=await request('/inspection-sessions',{client_uuid:lostId,project_id:project.id,device_id:lostDevice,started_at:point.session_started_at},token);
  const closure=returned.json.session.closure;
  assert.equal(closure.actor_id,managerLogin.json.user.id);
  assert.equal((await request('/inspection-points',savedPoint,token)).status,409);
  assert.equal((await request('/inspection-sessions/'+lostId+'/close',{request_id:randomUUID(),reason:'Unauthorized'},token)).status,403);
  const recoveredEnd={device_id:lostDevice,closure_id:closure.id,ended_at:new Date().toISOString(),allocated_count:10001,
   observations:[...Array.from({length:10000},(_,i)=>({client_uuid:randomUUID(),observation_number:i+1,photo_client_uuid:randomUUID(),disposition:'deleted'})),
    {client_uuid:savedPoint.client_uuid,observation_number:10001,photo_client_uuid:recoveredPhoto,disposition:'saved'}]};
  // Full oversized requests remain bounded; only chunks may carry the legacy inventory.
  assert.equal((await request('/inspection-sessions/'+lostId+'/end',recoveredEnd,token)).status,400);
  const chunk=(offset)=>({...recoveredEnd,inventory_size:10001,offset,observations:recoveredEnd.observations.slice(offset,offset+1000)});
  assert.equal((await request('/inspection-sessions/'+lostId+'/end-parts',{...chunk(0),device_id:randomUUID()},token)).status,409);
  assert.equal((await request('/inspection-sessions/'+lostId+'/end-parts',{...chunk(0),observations:recoveredEnd.observations.slice(0,1001)},token)).status,400);
  assert.equal((await request('/inspection-sessions/'+lostId+'/end-parts',chunk(0),token)).status,201);
  await page.reload();await lostCard.getByText(/Administratively closed.*unknown/).waitFor();
  assert.equal((await request('/inspection-points',savedPoint,token)).status,409);
  assert.equal((await request('/inspection-sessions/'+lostId+'/end-parts',chunk(0),token)).status,201);
  for(let offset=1000;offset<10001;offset+=1000) assert.equal((await request('/inspection-sessions/'+lostId+'/end-parts',chunk(offset),token)).status,201);
  const recoveredPoint=await request('/inspection-points',savedPoint,token);assert.equal(recoveredPoint.status,201);
  assert.equal((await request('/inspection-points',{...savedPoint,client_uuid:randomUUID(),observation_number:2},token)).status,409);
  const uploaded=await request('/photos',{client_uuid:recoveredPhoto,inspection_point_client_uuid:savedPoint.client_uuid,project_id:project.id,session_device_id:lostDevice,sha256:'f'.repeat(64),byte_size:1},token);
  assert.equal(uploaded.status,201);
  // Materialize photo readiness in the disposable DB, as in the report fixture.
  // This is server reconciliation acceptance, not a physical-phone/TUS transfer claim.
  const {Client}=require('node:module').createRequire(require('node:path').resolve('apps/api/package.json'))('pg');
  const dbUrl=new URL(env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(dbUrl.hostname)&&dbUrl.pathname.endsWith('_disposable'));
  const db=new Client({connectionString:env.DATABASE_URL});await db.connect();
  try{await db.query("UPDATE photos SET status='ready' WHERE id=$1",[uploaded.json.photo.id]);}finally{await db.end();}
  const reconciled=await request('/inspection-sessions/'+lostId+'/sync-state',{device_id:lostDevice,closure_id:closure.id,sequence:1,pending:0,failed:0,complete:true},token);
  assert.equal(reconciled.status,201);assert.deepEqual(reconciled.json.session.closure,closure);
  await page.reload();await lostCard.getByText(/Administratively closed.*complete/).waitFor();
  await lostCard.getByText(/Closure reason: Phone lost during site visit/).waitFor();
  console.log('PASS: manager browser closure, interrupted 10,001-allocation inventory recovery and retained closure history after completion');
  const largeId=randomUUID(), largeDevice=randomUUID();
  assert.equal((await request('/inspection-sessions',{client_uuid:largeId,project_id:project.id,device_id:largeDevice,started_at:point.session_started_at},token)).status,201);
  const largeEnd={device_id:largeDevice,ended_at:new Date().toISOString(),allocated_count:10000,
   observations:Array.from({length:10000},(_,index)=>({client_uuid:randomUUID(),observation_number:index+1,photo_client_uuid:randomUUID(),disposition:'saved'}))};
  assert.ok(Buffer.byteLength(JSON.stringify(largeEnd))>102400);
  assert.equal((await request('/inspection-sessions/'+largeId+'/end',largeEnd,token)).status,201);
  console.log('PASS: actual HTTP accepts the maximum 10,000-entry inventory');
  console.log('PASS: manager browser shows ended visit with pending/failed evidence and rejects premature completion');
  console.log('PASS: real API retry and manager browser session/number display after reload');
 } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
