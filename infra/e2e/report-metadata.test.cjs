// Run after migrating/seeding a disposable database, with API built and no worker running.
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { Readable } = require('node:stream');
const { createDb, createPool } = require('../../apps/api/dist/db/client');
const { ReportsService } = require('../../apps/api/dist/reports/reports.service');
const { IssuedReportsController } = require('../../apps/api/dist/reports/issued-reports.controller');

let pool, service, clients, actor, projectId, reportId, queuedId, observations = [], storageCalls = [];
const pdf = Buffer.from('%PDF-1.4 synthetic metadata authorization fixture');
before(async () => {
  const url = new URL(process.env.DATABASE_URL);
  assert.equal(process.env.DISPOSABLE_REPORT_TEST, '1');
  assert.ok(['127.0.0.1','localhost'].includes(url.hostname) && url.pathname.endsWith('_disposable'));
  pool = createPool(url.href);
  actor = { id: (await pool.query("SELECT id FROM users WHERE role='manager' LIMIT 1")).rows[0].id, role:'manager' };
  projectId = (await pool.query("INSERT INTO projects(code,name,created_by) VALUES ('META','Metadata test',$1) RETURNING id",[actor.id])).rows[0].id;
  await pool.query(`INSERT INTO reports(project_id,requested_by,status,title,client_revision,point_count,storage_key,generated_at,created_at,filters_json)
    SELECT $1,$2,'ready','Revision '||n,n,n,'reports/synthetic-'||n||'.pdf',now(),now()+(n*interval '1 second'),
      jsonb_build_object('evidence',repeat('A',2*1024*1024))
    FROM generate_series(1,12) n`,[projectId,actor.id]);
  reportId=(await pool.query('SELECT id FROM reports WHERE project_id=$1 AND client_revision=12',[projectId])).rows[0].id;
  queuedId=(await pool.query("INSERT INTO reports(project_id,requested_by,status,created_at) VALUES ($1,$2,'queued',now()-interval '1 day') RETURNING id",[projectId,actor.id])).rows[0].id;
  const bytes=(await pool.query("SELECT sum(octet_length(filters_json->>'evidence'))::int AS n FROM reports WHERE project_id=$1",[projectId])).rows[0].n;
  assert.equal(bytes,24*1024*1024);
  const query=pool.query.bind(pool);
  pool.query=async (...args) => {
    const result=await query(...args);
    observations.push({ fields:result.fields.map(f=>f.name), bytes:Buffer.byteLength(JSON.stringify(result.rows)) });
    return result;
  };
  const storage={
    signedReportGet:async key => { storageCalls.push(key); return {url:'https://storage.example.test/synthetic',expires_in:60}; },
    getObject:async key => { storageCalls.push(key); return {body:Readable.from([pdf]),contentLength:pdf.length,contentType:'application/pdf'}; },
  };
  const db=createDb(pool);
  service=new ReportsService(db,storage);
  clients=new IssuedReportsController(db,storage);
});
after(async()=>{await pool?.end();});
function reset() { observations=[];storageCalls=[]; }
function metadataOnly() {
  assert.ok(observations.length>0);
  assert.ok(observations.every(r=>!r.fields.includes('filters_json')),'database returned frozen evidence');
  const bytes=observations.reduce((n,r)=>n+r.bytes,0);
  assert.ok(bytes<64*1024,`metadata fetched ${bytes} bytes`);
}
async function streamBytes(stream) {
  const chunks=[];for await(const chunk of stream) chunks.push(Buffer.from(chunk));return Buffer.concat(chunks);
}

test('history returns complete ordered metadata without loading large snapshots',async()=>{
  reset();
  const {items}=await service.list(actor,projectId);
  assert.equal(items.length,13);
  assert.deepEqual(items.slice(0,12).map(r=>r.title),Array.from({length:12},(_,i)=>'Revision '+(12-i)));
  assert.deepEqual(Object.keys(items[0]).sort(),['id','project_id','status','title','point_count','generated_at','error_message','created_at'].sort());
  assert.equal(items[0].id,reportId);
  assert.equal(storageCalls.length,0);
  metadataOnly();
});
test('status and PDF download retain their contract without fetching snapshots',async()=>{
  reset();
  const {report}=await service.get(actor,reportId,'127.0.0.1');
  assert.equal(report.id,reportId);assert.equal(report.status,'ready');
  assert.equal(report.download_url,'https://storage.example.test/synthetic');
  const file=await service.file(actor,reportId,'127.0.0.1');
  assert.deepEqual(await streamBytes(file.body),pdf);
  assert.deepEqual(storageCalls,['reports/synthetic-12.pdf','reports/synthetic-12.pdf']);
  const queued=await service.get(actor,queuedId,'127.0.0.1');
  assert.equal(queued.report.status,'queued');assert.equal(queued.report.download_url,undefined);
  await assert.rejects(service.file(actor,queuedId,'127.0.0.1'),e=>e.getStatus()===404);
  assert.equal(storageCalls.length,2);
  metadataOnly();
});
test('staff report authorization rejects inspector and client before storage access',async()=>{
  reset();
  for(const role of ['inspector','client']) {
    const denied={...actor,role};
    for(const operation of [
      ()=>service.list(denied,projectId),()=>service.get(denied,reportId,'127.0.0.1'),()=>service.file(denied,reportId,'127.0.0.1'),
    ]) await assert.rejects(operation,e=>e.getStatus()===403);
  }
  assert.equal(storageCalls.length,0);assert.equal(observations.length,0);
});
test('client metadata and PDF access remain membership checked without snapshot reads',async()=>{
  const client={...actor,role:'client'};
  reset();
  await assert.rejects(clients.file(client,reportId),e=>e.getStatus()===404);
  assert.equal(storageCalls.length,0);
  await pool.query('INSERT INTO project_members(project_id,user_id) VALUES ($1,$2)',[projectId,actor.id]);
  reset();
  const list=await clients.list(client,projectId);
  assert.equal(list.items.length,12);assert.equal(list.items[0].revision,12);
  assert.equal((await clients.detail(client,reportId)).report.id,reportId);
  const file=await clients.file(client,reportId);
  assert.deepEqual(await streamBytes(file.getStream()),pdf);
  metadataOnly();
  await pool.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2',[projectId,actor.id]);
  reset();
  for(const operation of [()=>clients.list(client,projectId),()=>clients.detail(client,reportId),()=>clients.file(client,reportId)])
    await assert.rejects(operation,e=>e.getStatus()===404);
  assert.equal(storageCalls.length,0);metadataOnly();
});
test('deleted projects deny manager history, status and PDF without evidence reads',async()=>{
  await pool.query('UPDATE projects SET deleted_at=now() WHERE id=$1',[projectId]);
  reset();
  for(const operation of [()=>service.list(actor,projectId),()=>service.get(actor,reportId,'127.0.0.1'),()=>service.file(actor,reportId,'127.0.0.1')])
    await assert.rejects(operation,e=>e.getStatus()===404);
  assert.equal(storageCalls.length,0);metadataOnly();
});
