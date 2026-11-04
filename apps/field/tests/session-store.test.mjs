import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createSessionStore } from '../session-store.ts';

function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('CREATE TABLE observation(id TEXT PRIMARY KEY,owner TEXT NOT NULL,point TEXT NOT NULL,photo TEXT NOT NULL,hash TEXT NOT NULL,upload TEXT,ready INTEGER NOT NULL DEFAULT 0);');
  const db = {
    execSync: text => sql.exec(text),
    getFirstSync: (text,...args) => sql.prepare(text).get(...args) ?? null,
    runSync: (text,...args) => sql.prepare(text).run(...args),
  };
  return { sql, db, store: createSessionStore(db) };
}
test('saved observations keep session numbers across reopening and deleted gaps', () => {
  const {sql,db,store} = fixture();
  const session = store.start('inspector-a','project-a','visit-a','phone-a','2026-11-04T09:00:00.000Z');
  const point = {client_uuid:'point-a',project_id:'project-a',category:'defect'};
  store.save('inspector-a',session.id,point,'photo-a','hash-a');
  sql.prepare('DELETE FROM observation WHERE id=?').run('point-a');
  const reopened = createSessionStore(db);
  reopened.save('inspector-a',session.id,{...point,client_uuid:'point-b'},'photo-b','hash-b');
  const saved = JSON.parse(sql.prepare('SELECT point FROM observation').get().point);
  assert.equal(saved.observation_number,2);
  assert.equal(saved.session_client_uuid,'visit-a');
  assert.equal(saved.session_device_id,'phone-a');
  assert.equal(reopened.current('inspector-b','project-a'),null);
  sql.close();
});
test('failed save rolls back numbering and preserves legacy queued data', () => {
 const {sql,db,store}=fixture();
 sql.prepare('INSERT INTO observation(id,owner,point,photo,hash,upload) VALUES(?,?,?,?,?,?)').run('legacy','a','{"category":"note"}','legacy-photo','legacy-hash','https://upload.example.test/resource');
 store.start('a','project','visit','phone','2026-11-04T09:00:00.000Z');
 assert.throws(()=>store.save('a','visit',{client_uuid:'legacy',project_id:'project'},'new','hash'));
 store.save('a','visit',{client_uuid:'new',project_id:'project'},'new','hash');
 assert.equal(JSON.parse(sql.prepare('SELECT point FROM observation WHERE id=?').get('new').point).observation_number,1);
 assert.equal(sql.prepare('SELECT upload FROM observation WHERE id=?').get('legacy').upload,'https://upload.example.test/resource');
 assert.throws(()=>store.save('other','visit',{client_uuid:'x',project_id:'project'},'x','x'));
 assert.throws(()=>store.save('a','visit',{client_uuid:'x',project_id:'other-project'},'x','x'));
 assert.equal(createSessionStore(db).device('phone-a'),'phone-a');
 assert.equal(createSessionStore(db).device('phone-b'),'phone-a');
 sql.close();
});
test('number exhaustion preserves the saved ledger and asks for another session', () => {
 const {sql,store}=fixture();
 store.start('a','project','visit','phone','2026-11-04T09:00:00.000Z');
 sql.exec('UPDATE inspection_session SET next_number=2147483648');
 assert.throws(()=>store.save('a','visit',{client_uuid:'x',project_id:'project'},'x','x'),/number/);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM observation').get().n,0);
 sql.close();
});
test('ending freezes saved evidence across restart and permits a new visit', () => {
 const {sql,db,store}=fixture();
 store.start('a','project','visit','phone','2026-11-04T09:00:00.000Z');
 store.save('a','visit',{client_uuid:'one',project_id:'project'},'photo-one','hash');
 const ended=store.end('a','visit','2026-11-04T10:00:00.000Z');
 assert.equal(ended.ended_at,'2026-11-04T10:00:00.000Z');
 assert.deepEqual(JSON.parse(ended.manifest),[{client_uuid:'one',observation_number:1,photo_client_uuid:'photo-one',disposition:'saved'}]);
 const reopened=createSessionStore(db);
 assert.equal(reopened.current('a','project'),null);
 assert.throws(()=>reopened.save('a','visit',{client_uuid:'two',project_id:'project'},'photo-two','hash'),/ended/);
 assert.equal(reopened.end('a','visit','2026-11-05T10:00:00.000Z').ended_at,ended.ended_at);
 assert.equal(reopened.start('a','project','next','phone','2026-11-05T10:00:00.000Z').next_number,1);
 assert.equal(sql.prepare('SELECT photo FROM observation WHERE id=?').get('one').photo,'photo-one');
 sql.close();
});
test('deleted allocations remain in final inventory rather than uploaded evidence',()=>{
 const {sql,store}=fixture();store.start('a','project','visit','phone','2026-11-04T09:00:00.000Z');
 store.save('a','visit',{client_uuid:'one',project_id:'project'},'photo','hash');
 sql.prepare('DELETE FROM observation WHERE id=?').run('one');
 const end=store.end('a','visit','2026-11-04T10:00:00.000Z');
 assert.deepEqual(JSON.parse(end.manifest),[{client_uuid:'one',observation_number:1,photo_client_uuid:'photo',disposition:'deleted'}]);
 assert.equal(end.next_number,2);sql.close();
});
test('new visits stop allocating before the final inventory can exceed its limit',()=>{
 const {sql,store}=fixture();store.start('a','project','visit','phone','2026-11-04T09:00:00.000Z');
 sql.exec('UPDATE inspection_session SET next_number=10000');
 store.save('a','visit',{client_uuid:'last',project_id:'project'},'last-photo','hash');
 assert.throws(()=>store.save('a','visit',{client_uuid:'overflow',project_id:'project'},'overflow-photo','hash'),/limit/);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM observation').get().n,1);
 sql.close();
});
