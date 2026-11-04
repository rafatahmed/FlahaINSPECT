const assert = require('node:assert/strict');
const {test,before,after} = require('node:test');
const {randomUUID} = require('node:crypto');
const {createDb,createPool} = require('../../apps/api/dist/db/client');
const {InspectionPointsService} = require('../../apps/api/dist/inspection-points/inspection-points.service');
let pool, service, inspector, manager, project;
before(async()=>{
 const url = new URL(process.env.DATABASE_URL);
 assert.equal(process.env.DISPOSABLE_REPORT_TEST,'1');
 assert.ok(['localhost','127.0.0.1'].includes(url.hostname) && url.pathname.endsWith('_disposable'));
 pool=createPool(url.href);
 inspector={id:randomUUID(),role:'inspector'}; manager={id:randomUUID(),role:'manager'};
 for(const actor of [inspector,manager]) await pool.query('INSERT INTO users(id,email,password_hash,full_name,role) VALUES($1,$2,$3,$4,$5)',[actor.id,actor.id+'@example.test','unused','Synthetic',actor.role]);
 project=(await pool.query("INSERT INTO projects(name) VALUES('Session fixture') RETURNING id")).rows[0].id;
 await pool.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2)',[project,inspector.id]);
 service=new InspectionPointsService(createDb(pool),{signedGet:async()=>null});
});
after(async()=>{await pool?.end()});
function capture(extra={}) { return {client_uuid:randomUUID(),project_id:project,category:'defect',latitude:25,longitude:51,captured_at:'2026-11-04T09:00:00.000Z',...extra}; }
test('numbered capture retries retain identity and manager-visible session/number',async()=>{
 const input=capture({session_client_uuid:randomUUID(),session_device_id:randomUUID(),session_started_at:'2026-11-04T08:00:00.000Z',observation_number:1});
 const first=await service.create(inspector,input);
 const retry=await service.create(inspector,input);
 assert.equal(retry.point.id,first.point.id);
 assert.equal(first.point.session_client_uuid,input.session_client_uuid);
 assert.equal(first.point.observation_number,1);
 const listed=await service.list(manager,{project_id:project});
 assert.equal(listed.items.find(p=>p.id===first.point.id).observation_number,1);
});
test('number, device, owner and project conflicts cannot change an accepted capture',async()=>{
 const visit={session_client_uuid:randomUUID(),session_device_id:randomUUID(),session_started_at:'2026-11-04T08:00:00.000Z',observation_number:1};
 const input=capture(visit);
 const first=await service.create(inspector,input);
 for(const changed of [
   {...input,observation_number:2},
   {...input,session_device_id:randomUUID()},
   {...input,session_started_at:'2026-11-04T07:00:00.000Z'},
   {...input,session_client_uuid:randomUUID()},
   capture(visit),
 ]) await assert.rejects(service.create(inspector,changed),e=>e.getStatus()===409);
 await assert.rejects(service.create(manager,capture(visit)),e=>e.getStatus()===409);
 const project2=(await pool.query("INSERT INTO projects(name) VALUES('Other project') RETURNING id")).rows[0].id;
 await pool.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2)',[project2,inspector.id]);
 await assert.rejects(service.create(inspector,{...input,project_id:project2}),e=>e.getStatus()===409);
 const unchanged=await service.get(manager,first.point.id);
 assert.equal(unchanged.point.observation_number,1);
});
test('concurrent number collision has one winner and retries remain idempotent',async()=>{
 const visit={session_client_uuid:randomUUID(),session_device_id:randomUUID(),session_started_at:'2026-11-04T08:00:00.000Z',observation_number:1};
 const outcomes=await Promise.allSettled([service.create(inspector,capture(visit)),service.create(inspector,capture(visit))]);
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(outcomes.find(r=>r.status==='rejected').reason.getStatus(),409);
});
test('legacy captures still sync, partial session payloads fail, revoked access retains server state',async()=>{
 const old=await service.create(inspector,capture());
 assert.equal(old.point.session_client_uuid,null);
 assert.equal(old.point.observation_number,null);
 await assert.rejects(service.create(inspector,capture({observation_number:1})),e=>e.getStatus()===400);
 const visit={session_client_uuid:randomUUID(),session_device_id:randomUUID(),session_started_at:'2026-11-04T08:00:00.000Z',observation_number:1};
 await pool.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2',[project,inspector.id]);
 await assert.rejects(service.create(inspector,capture(visit)),e=>e.getStatus()===403);
 await pool.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2)',[project,inspector.id]);
 await pool.query('UPDATE projects SET is_archived=true WHERE id=$1',[project]);
 await assert.rejects(service.create(inspector,capture(visit)));
 await pool.query('UPDATE projects SET is_archived=false WHERE id=$1',[project]);
});
test('end before upload accepts only inventoried evidence and completes after server readiness',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');
 const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID(),photo=randomUUID();
 const input=capture({session_client_uuid:id,session_device_id:device,session_started_at:'2026-11-04T08:00:00.000Z',observation_number:1});
 await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:input.session_started_at});
 const end={device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:1,observations:[{client_uuid:input.client_uuid,observation_number:1,photo_client_uuid:photo,disposition:'saved'}]};
 await sessions.end(inspector,id,end); await sessions.end(inspector,id,end);
 await assert.rejects(sessions.end(inspector,id,{...end,observations:[]}),e=>e.getStatus()===409);
 await assert.rejects(service.create(inspector,{...input,client_uuid:randomUUID()}),e=>e.getStatus()===409);
 const point=(await service.create(inspector,input)).point;
 await sessions.syncState(inspector,id,{device_id:device,sequence:1,pending:1,failed:0,complete:false});
 assert.equal((await sessions.list(manager,project)).items.find(s=>s.id===id).sync_state,'pending');
 await assert.rejects(sessions.syncState(inspector,id,{device_id:device,sequence:2,pending:0,failed:0,complete:true}),e=>e.getStatus()===409);
 await pool.query("INSERT INTO photos(client_uuid,inspection_point_id,project_id,sha256,byte_size,content_type,status) VALUES($1,$2,$3,$4,1,'image/jpeg','ready')",[photo,point.id,project,'a'.repeat(64)]);
 await sessions.syncState(inspector,id,{device_id:device,sequence:3,pending:0,failed:0,complete:true});
 assert.equal((await sessions.list(manager,project)).items.find(s=>s.id===id).sync_state,'complete');
 await assert.rejects(sessions.syncState(inspector,id,{device_id:device,sequence:1,pending:1,failed:0,complete:false}),e=>e.getStatus()===409);
});
test('active and empty sessions cannot appear complete without an ended inventory',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID();await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:'2026-11-04T08:00:00.000Z'});
 assert.equal((await sessions.list(manager,project)).items.find(s=>s.id===id).sync_state,'unknown');
 await assert.rejects(sessions.syncState(inspector,id,{device_id:device,sequence:1,pending:0,failed:0,complete:true}),e=>e.getStatus()===409);
 await assert.rejects(sessions.end(manager,id,{device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:0,observations:[]}),e=>e.getStatus()===404);
 await assert.rejects(sessions.syncState(inspector,id,{device_id:randomUUID(),sequence:1,pending:0,failed:0,complete:false}),e=>e.getStatus()===409);
 await sessions.end(inspector,id,{device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:0,observations:[]});
 await sessions.syncState(inspector,id,{device_id:device,sequence:1,pending:0,failed:0,complete:true});
 assert.equal((await sessions.list(manager,project)).items.find(s=>s.id===id).sync_state,'complete');
 await assert.rejects(sessions.list({id:randomUUID(),role:'client'},project),e=>e.getStatus()===404);
});
test('final inventory cannot omit accepted captures or substitute photo identity',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID();const input=capture({session_client_uuid:id,session_device_id:device,session_started_at:'2026-11-04T08:00:00.000Z',observation_number:1});
 const point=(await service.create(inspector,input)).point;const photo=randomUUID();
 await pool.query("INSERT INTO photos(client_uuid,inspection_point_id,project_id,sha256,byte_size,content_type,status) VALUES($1,$2,$3,$4,1,'image/jpeg','ready')",[photo,point.id,project,'b'.repeat(64)]);
 const end={device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:1,observations:[]};
 await assert.rejects(sessions.end(inspector,id,end),e=>e.getStatus()===409);
 await assert.rejects(sessions.end(inspector,id,{...end,observations:[{client_uuid:input.client_uuid,observation_number:1,photo_client_uuid:randomUUID(),disposition:'saved'}]}),e=>e.getStatus()===409);
 await sessions.end(inspector,id,{...end,observations:[{client_uuid:input.client_uuid,observation_number:1,photo_client_uuid:photo,disposition:'saved'}]});
});
test('end racing capture never accepts evidence outside the frozen inventory',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID(),started='2026-11-04T08:00:00.000Z';
 await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:started});
 const results=await Promise.allSettled([
  sessions.end(inspector,id,{device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:0,observations:[]}),
  service.create(inspector,capture({session_client_uuid:id,session_device_id:device,session_started_at:started,observation_number:1}))
 ]);
 assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
 assert.equal(results.find(result=>result.status==='rejected').reason.getStatus(),409);
});
test('late photo identity and current project access are enforced for ended sessions',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID(),photo=randomUUID(),started='2026-11-04T08:00:00.000Z';
 const input=capture({session_client_uuid:id,session_device_id:device,session_started_at:started,observation_number:1});
 await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:started});
 await sessions.end(inspector,id,{device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:1,observations:[{client_uuid:input.client_uuid,observation_number:1,photo_client_uuid:photo,disposition:'saved'}]});
 const point=(await service.create(inspector,input)).point;
 await assert.rejects(pool.query("INSERT INTO photos(client_uuid,inspection_point_id,project_id,sha256,byte_size,content_type,status) VALUES($1,$2,$3,$4,1,'image/jpeg','ready')",[randomUUID(),point.id,project,'c'.repeat(64)]),e=>e.code==='23514');
 await pool.query('UPDATE projects SET is_archived=true WHERE id=$1',[project]);
 await assert.rejects(sessions.syncState(inspector,id,{device_id:device,sequence:1,pending:1,failed:0,complete:false}),e=>e.code==='PROJECT_ARCHIVED');
 await pool.query('UPDATE projects SET is_archived=false WHERE id=$1',[project]);
 await pool.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2',[project,inspector.id]);
 await assert.rejects(sessions.list(inspector,project),e=>e.getStatus()===404);
 await pool.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2)',[project,inspector.id]);
});
test('only the owning inspector and phone can register ended-session photos',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const {PhotosService}=require('../../apps/api/dist/photos/photos.service');const photoService=new PhotosService(createDb(pool),{signedGet:async()=>null});
 const id=randomUUID(),device=randomUUID(),photo=randomUUID(),started='2026-11-04T08:00:00.000Z';
 const input=capture({session_client_uuid:id,session_device_id:device,session_started_at:started,observation_number:1});
 const registered=await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:started});
 assert.ok(registered.session.last_contact_at);
 await sessions.end(inspector,id,{device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:1,observations:[{client_uuid:input.client_uuid,observation_number:1,photo_client_uuid:photo,disposition:'saved'}]});
 await service.create(inspector,input);
 const other={id:randomUUID(),role:'inspector'};
 await pool.query("INSERT INTO users(id,email,password_hash,full_name,role) VALUES($1,$2,'unused','Other','inspector')",[other.id,other.id+'@example.test']);
 await pool.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2)',[project,other.id]);
 const payload={client_uuid:photo,inspection_point_client_uuid:input.client_uuid,project_id:project,sha256:'d'.repeat(64),byte_size:1,session_device_id:device};
 await assert.rejects(photoService.register(other,payload,'127.0.0.1'),e=>e.getStatus()===403);
 await assert.rejects(photoService.register(inspector,{...payload,session_device_id:randomUUID()},'127.0.0.1'),e=>e.getStatus()===409);
 assert.equal((await photoService.register(inspector,payload,'127.0.0.1')).status,201);
 await assert.rejects(photoService.register(other,payload,'127.0.0.1'),e=>e.getStatus()===403);
});
test('manager closure preserves unknown completeness until original-phone recovery',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID(),photo=randomUUID(),started='2026-11-04T08:00:00.000Z';
 const point=capture({session_client_uuid:id,session_device_id:device,session_started_at:started,observation_number:1});
 await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:started});
 await sessions.syncState(inspector,id,{device_id:device,sequence:1,pending:1,failed:0,complete:false});
 const close={request_id:randomUUID(),reason:'Capture phone reported lost'};
 const closed=(await sessions.close(manager,id,close)).session;
 assert.equal(closed.sync_state,'unknown');assert.equal(closed.closure.reason,close.reason);assert.equal(closed.closure.actor_id,manager.id);
 assert.deepEqual((await sessions.close(manager,id,close)).session.closure,closed.closure);
 await assert.rejects(service.create(inspector,point),e=>e.getStatus()===409);
 const end={device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:1,observations:[{client_uuid:point.client_uuid,observation_number:1,photo_client_uuid:photo,disposition:'saved'}]};
 await assert.rejects(sessions.end(inspector,id,end),e=>e.getStatus()===409);
 await assert.rejects(sessions.end(inspector,id,{...end,device_id:randomUUID(),closure_id:close.request_id}),e=>e.getStatus()===409);
 await sessions.end(inspector,id,{...end,closure_id:close.request_id});
 const accepted=(await service.create(inspector,point)).point;
 await assert.rejects(service.create(inspector,{...point,client_uuid:randomUUID(),observation_number:2}),e=>e.getStatus()===409);
 await pool.query("INSERT INTO photos(client_uuid,inspection_point_id,project_id,sha256,byte_size,content_type,status) VALUES($1,$2,$3,$4,1,'image/jpeg','ready')",[photo,accepted.id,project,'e'.repeat(64)]);
 await assert.rejects(sessions.syncState(inspector,id,{device_id:device,sequence:2,pending:0,failed:0,complete:true}),e=>e.getStatus()===409);
 const done=(await sessions.syncState(inspector,id,{device_id:device,closure_id:close.request_id,sequence:2,pending:0,failed:0,complete:true})).session;
 assert.equal(done.sync_state,'complete');assert.deepEqual(done.closure,closed.closure);
});
test('closure is manager-only, immutable, and does not bypass archived or revoked access',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID(),started='2026-11-04T08:00:00.000Z';
 await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:started});
 const close={request_id:randomUUID(),reason:'Lost original phone'};
 await assert.rejects(sessions.close(inspector,id,close),e=>e.getStatus()===403);
 await assert.rejects(sessions.close(manager,id,{...close,reason:'   '}),e=>e.getStatus()===400);
 await sessions.close(manager,id,close);
 await assert.rejects(sessions.close(manager,id,{...close,reason:'Changed history'}),e=>e.getStatus()===409);
 await assert.rejects(pool.query('UPDATE inspection_sessions SET closure=NULL WHERE id=$1',[id]),e=>e.code==='23514');
 const end={device_id:device,closure_id:close.request_id,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:0,observations:[]};
 await pool.query('UPDATE projects SET is_archived=true WHERE id=$1',[project]);
 await assert.rejects(sessions.end(inspector,id,end),e=>e.code==='PROJECT_ARCHIVED');
 await pool.query('UPDATE projects SET is_archived=false WHERE id=$1',[project]);
 await pool.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2',[project,inspector.id]);
 await assert.rejects(sessions.end(inspector,id,end),e=>e.getStatus()===404);
 await pool.query('INSERT INTO project_members(project_id,user_id) VALUES($1,$2)',[project,inspector.id]);
 await sessions.end(inspector,id,end);
 await sessions.syncState(inspector,id,{device_id:device,closure_id:close.request_id,sequence:2,pending:0,failed:0,complete:true});
 await assert.rejects(sessions.syncState(inspector,id,{device_id:device,closure_id:close.request_id,sequence:1,pending:0,failed:0,complete:false}),e=>e.getStatus()===409);
});
test('manager closure racing owner ending cannot erase or invent history',async()=>{
 const {InspectionSessionsService}=require('../../apps/api/dist/inspection-sessions/inspection-sessions.service');const sessions=new InspectionSessionsService(createDb(pool));
 const id=randomUUID(),device=randomUUID();await sessions.register(inspector,{client_uuid:id,project_id:project,device_id:device,started_at:'2026-11-04T08:00:00.000Z'});
 const results=await Promise.allSettled([
  sessions.close(manager,id,{request_id:randomUUID(),reason:'Lost phone'}),
  sessions.end(inspector,id,{device_id:device,ended_at:'2026-11-04T10:00:00.000Z',allocated_count:0,observations:[]})
 ]);
 assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
 assert.equal(results.find(result=>result.status==='rejected').reason.getStatus(),409);
});
