// Run after migrating and seeding a fresh, disposable database, with API and worker built and no poller running.
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { createDb, createPool } = require('../../apps/api/dist/db/client');
const { ReportsService } = require('../../apps/api/dist/reports/reports.service');
const { finishJob, reclaimExpiredLeases } = require('../../apps/worker/dist/jobs/claimer');

let pool, service, projectId, actor;
before(async () => {
  const url = new URL(process.env.DATABASE_URL);
  assert.equal(process.env.DISPOSABLE_REPORT_TEST, '1');
  assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname) && url.pathname.endsWith('_disposable'));
  pool = createPool(url.href);
  const { rows: [seed] } = await pool.query("SELECT p.id, u.id AS manager FROM projects p JOIN users u ON u.id = p.created_by WHERE p.code = 'LOCAL'");
  projectId = seed.id;
  actor = { id: seed.manager, role: 'manager' };
  service = new ReportsService(createDb(pool), null);
});
after(async () => { await pool?.end(); });

test('failed enqueue rolls back and racing retries create exactly one report and job', async () => {
  await pool.query("ALTER TABLE jobs ADD CONSTRAINT test_reject_enqueue CHECK (type <> 'generate_report')");
  try {
    await assert.rejects(service.create(actor, projectId, 'Queue test'), /test_reject_enqueue|insert into "jobs"/i);
  } finally {
    await pool.query('ALTER TABLE jobs DROP CONSTRAINT test_reject_enqueue');
  }
  const count = async table => (await pool.query('SELECT count(*)::int AS n FROM ' + table)).rows[0].n;
  assert.equal(await count('reports'), 0);
  assert.equal(await count('jobs'), 0);
  const requests = await Promise.allSettled([service.create(actor, projectId), service.create(actor, projectId)]);
  const successes = requests.filter(r => r.status === 'fulfilled');
  const failures = requests.filter(r => r.status === 'rejected');
  assert.equal(successes.length, 1);
  assert.equal(failures.length, 1);
  const id = successes[0].value.report.id;
  assert.equal(successes[0].value.status, 202);
  assert.equal(failures[0].reason.getStatus(), 409);
  assert.equal(failures[0].reason.details.report_id, id);
  assert.equal(await count('reports'), 1);
  assert.equal(await count('jobs'), 1);
  assert.equal((await pool.query('SELECT payload FROM jobs')).rows[0].payload.report_id, id);
});

test('failure releases the lease, schedules a retry, and fails the report at exhaustion', async () => {
  const { rows: [project] } = await pool.query(
    "INSERT INTO projects(code, name, created_by) VALUES ('RETRY', 'Retry test', $1) RETURNING id", [actor.id],
  );
  const { rows: [report] } = await pool.query(
    "INSERT INTO reports(project_id, requested_by, status) VALUES ($1, $2, 'processing') RETURNING id",
    [project.id, actor.id],
  );
  const { rows: [job] } = await pool.query(`INSERT INTO jobs(type,status,payload,attempts,max_attempts,locked_at,locked_by)
    VALUES ('generate_report','running',$1,1,2,now(),'test') RETURNING id`, [{report_id:report.id}]);
  async function state() {
    return (await pool.query(`SELECT j.status,j.locked_at,j.locked_by,j.run_after > now() AS delayed,
      r.status AS report_status,r.error_message FROM jobs j JOIN reports r ON r.id=$2 WHERE j.id=$1`,[job.id,report.id])).rows[0];
  }
  await finishJob(pool,job.id,false,'first failure');
  assert.deepEqual(await state(),{status:'pending',locked_at:null,locked_by:null,delayed:true,report_status:'processing',error_message:null});
  await pool.query("UPDATE jobs SET status='running', attempts=2,locked_at=now(),locked_by='test' WHERE id=$1",[job.id]);
  await finishJob(pool,job.id,false,'terminal failure');
  assert.deepEqual(await state(),{status:'dead',locked_at:null,locked_by:null,delayed:true,report_status:'failed',error_message:'terminal failure'});
});

test('exhausted lease recovery rolls back on report failure and unblocks the next report', async () => {
  const { rows: [project] } = await pool.query(
    "INSERT INTO projects(code,name,created_by) VALUES ('LEASE','Lease recovery',$1) RETURNING id", [actor.id]);
  const { rows: [report] } = await pool.query(
    "INSERT INTO reports(project_id,requested_by,status) VALUES ($1,$2,'processing') RETURNING id", [project.id,actor.id]);
  const { rows: [job] } = await pool.query(
    `INSERT INTO jobs(type,status,payload,attempts,max_attempts,locked_at,locked_by)
     VALUES ('generate_report','running',$1,2,2,now()-interval '16 minutes','expired-worker') RETURNING id`,
    [{report_id:report.id}]);
  const state = async () => (await pool.query(
    `SELECT j.status,j.locked_by,j.locked_at IS NOT NULL AS locked,r.status AS report_status
     FROM jobs j JOIN reports r ON r.id=$2 WHERE j.id=$1`,[job.id,report.id])).rows[0];
  await pool.query("ALTER TABLE reports ADD CONSTRAINT test_reject_lease_failure CHECK (status <> 'failed') NOT VALID");
  try {
    await assert.rejects(reclaimExpiredLeases(pool), e => e.code === '23514' && e.constraint === 'test_reject_lease_failure');
    assert.deepEqual(await state(), {status:'running',locked_by:'expired-worker',locked:true,report_status:'processing'});
  } finally {
    await pool.query('ALTER TABLE reports DROP CONSTRAINT test_reject_lease_failure');
  }
  assert.equal(await reclaimExpiredLeases(pool),1);
  assert.deepEqual(await state(), {status:'dead',locked_by:null,locked:false,report_status:'failed'});
  assert.equal(await reclaimExpiredLeases(pool),0);
  const next = await service.create(actor,project.id,'After recovered lease');
  assert.equal(next.status,202);
  assert.notEqual(next.report.id,report.id);
  assert.equal((await pool.query("SELECT count(*)::int AS n FROM jobs WHERE payload->>'report_id'=$1",[next.report.id])).rows[0].n,1);
});

test('lease recovery preserves ready reports and live leases while requeuing retryable jobs', async () => {
  const { rows: [project] } = await pool.query(
    "INSERT INTO projects(code,name,created_by) VALUES ('LEASE-GUARDS','Lease guards',$1) RETURNING id",[actor.id]);
  const { rows: [ready] } = await pool.query(
    "INSERT INTO reports(project_id,requested_by,status,storage_key) VALUES ($1,$2,'ready','reports/frozen.pdf') RETURNING id",[project.id,actor.id]);
  const { rows: [active] } = await pool.query(
    "INSERT INTO reports(project_id,requested_by,status) VALUES ($1,$2,'processing') RETURNING id",[project.id,actor.id]);
  async function job(reportId, attempts, expired) {
    return (await pool.query(
      `INSERT INTO jobs(type,status,payload,attempts,max_attempts,locked_at,locked_by)
       VALUES ('generate_report','running',$1,$2,2,now()-($3::int * interval '1 minute'),'guard-worker') RETURNING id`,
      [{report_id:reportId},attempts,expired ? 16 : 1])).rows[0].id;
  }
  const readyJob=await job(ready.id,2,true);
  const retryJob=await job(active.id,1,true);
  const liveJob=await job(active.id,2,false);
  assert.equal(await reclaimExpiredLeases(pool),2);
  const rows=(await pool.query('SELECT id,status,locked_by FROM jobs WHERE id=ANY($1::uuid[])',[[readyJob,retryJob,liveJob]])).rows;
  const byId=new Map(rows.map(row=>[row.id,row]));
  assert.deepEqual(byId.get(readyJob),{id:readyJob,status:'dead',locked_by:null});
  assert.deepEqual(byId.get(retryJob),{id:retryJob,status:'pending',locked_by:null});
  assert.deepEqual(byId.get(liveJob),{id:liveJob,status:'running',locked_by:'guard-worker'});
  assert.deepEqual((await pool.query('SELECT status,storage_key,error_message FROM reports WHERE id=$1',[ready.id])).rows[0],
    {status:'ready',storage_key:'reports/frozen.pdf',error_message:null});
  assert.equal((await pool.query('SELECT status FROM reports WHERE id=$1',[active.id])).rows[0].status,'processing');
});
