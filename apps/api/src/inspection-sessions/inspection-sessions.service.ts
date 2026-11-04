import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Db } from '../db/client';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type {
  EndSessionDto,
  CloseSessionDto,
  RegisterSessionDto,
  SessionSyncDto,
  InventoryEntry,
} from './inspection-sessions.dto';
type Query = Pick<Db, 'execute'>;
type Visit = {
  id: string;
  project_id: string;
  inspector_id: string;
  device_id: string;
  started_at: Date;
  ended_at: Date | null;
  manifest: InventoryEntry[] | null;
  allocated_count: number | null;
  sequence: number;
  known_pending: number | null;
  known_failed: number | null;
  complete_requested: boolean;
  last_contact_at: Date | null;
  closure: {
    id: string;
    actor_id: string;
    closed_at: string;
    reason: string;
  } | null;
};
const conflict = () => new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
@Injectable()
export class InspectionSessionsService {
  constructor(@Inject('DB') private readonly db: Db) {}
  private async access(
    db: Query,
    actor: AuthUser,
    projectId: string,
    write = false,
  ) {
    const { rows } = await db.execute<{ is_archived: boolean }>(
      sql`SELECT p.is_archived FROM projects p WHERE p.id=${projectId}::uuid AND p.deleted_at IS NULL AND (${actor.role}='manager' OR (${actor.role}='inspector' AND EXISTS(SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.user_id=${actor.id}::uuid))) FOR SHARE OF p`,
    );
    if (!rows[0]) throw new ApiException(ErrorCode.NOT_FOUND);
    if (write && rows[0].is_archived)
      throw new ApiException(ErrorCode.PROJECT_ARCHIVED);
  }
  private async owned(db: Query, actor: AuthUser, id: string, device: string) {
    const { rows } = await db.execute<Visit>(
      sql`SELECT * FROM inspection_sessions WHERE id=${id}::uuid FOR UPDATE`,
    );
    const visit = rows[0];
    if (!visit || visit.inspector_id !== actor.id)
      throw new ApiException(ErrorCode.NOT_FOUND);
    await this.access(db, actor, visit.project_id, true);
    if (visit.device_id !== device) throw conflict();
    return visit;
  }
  async register(actor: AuthUser, input: RegisterSessionDto) {
    return this.db.transaction(async (db) => {
      await this.access(db, actor, input.project_id, true);
      await db.execute(
        sql`INSERT INTO inspection_sessions(id,project_id,inspector_id,device_id,started_at) VALUES(${input.client_uuid}::uuid,${input.project_id}::uuid,${actor.id}::uuid,${input.device_id}::uuid,${input.started_at}::timestamptz) ON CONFLICT(id) DO NOTHING`,
      );
      const visit = await this.owned(
        db,
        actor,
        input.client_uuid,
        input.device_id,
      );
      if (
        visit.project_id !== input.project_id ||
        new Date(visit.started_at).getTime() !==
          new Date(input.started_at).getTime()
      )
        throw conflict();
      await db.execute(
        sql`UPDATE inspection_sessions SET last_contact_at=now() WHERE id=${visit.id}::uuid`,
      );
      return { session: await this.read(db, visit.id) };
    });
  }
  async close(actor: AuthUser, id: string, input: CloseSessionDto) {
    if (actor.role !== 'manager') throw new ApiException(ErrorCode.FORBIDDEN);
    const reason = input.reason.trim();
    if (!reason || reason.length > 1000)
      throw new ApiException(ErrorCode.VALIDATION_ERROR);
    return this.db.transaction(async (db) => {
      const { rows } = await db.execute<Visit>(
        sql`SELECT * FROM inspection_sessions WHERE id=${id}::uuid FOR UPDATE`,
      );
      const visit = rows[0];
      if (!visit) throw new ApiException(ErrorCode.NOT_FOUND);
      await this.access(db, actor, visit.project_id, true);
      if (visit.closure) {
        if (
          visit.closure.id !== input.request_id ||
          visit.closure.actor_id !== actor.id ||
          visit.closure.reason !== reason
        )
          throw conflict();
      } else {
        if (visit.ended_at) throw conflict();
        await db.execute(
          sql`UPDATE inspection_sessions SET closure=jsonb_build_object('id',${input.request_id}::text,'actor_id',${actor.id}::text,'closed_at',now(),'reason',${reason}::text),complete_requested=false WHERE id=${id}::uuid`,
        );
      }
      return { session: await this.read(db, id) };
    });
  }
  private acknowledgeClosure(visit: Visit, closureId?: string) {
    if (visit.closure && visit.closure.id !== closureId) {
      throw new ApiException(
        ErrorCode.CONFLICT_IDEMPOTENCY,
        undefined,
        'This visit was administratively closed. Reconcile its saved inventory from the original phone.',
      );
    }
    if (!visit.closure && closureId) throw conflict();
  }
  async end(actor: AuthUser, id: string, input: EndSessionDto) {
    return this.db.transaction(async (db) => {
      const visit = await this.owned(db, actor, id, input.device_id);
      this.acknowledgeClosure(visit, input.closure_id);
      const manifest = [...input.observations].sort(
        (a, b) => a.observation_number - b.observation_number,
      );
      if (
        manifest.some((e) => e.observation_number > input.allocated_count) ||
        new Set(manifest.map((e) => e.observation_number)).size !==
          manifest.length ||
        new Set(manifest.map((e) => e.client_uuid)).size !== manifest.length ||
        new Set(manifest.map((e) => e.photo_client_uuid)).size !==
          manifest.length ||
        new Date(input.ended_at) < new Date(visit.started_at)
      )
        throw conflict();
      if (visit.ended_at) {
        if (
          new Date(visit.ended_at).getTime() !==
            new Date(input.ended_at).getTime() ||
          visit.allocated_count !== input.allocated_count ||
          JSON.stringify(
            visit.manifest?.map((e) => [
              e.client_uuid,
              e.observation_number,
              e.photo_client_uuid,
              e.disposition,
            ]),
          ) !==
            JSON.stringify(
              manifest.map((e) => [
                e.client_uuid,
                e.observation_number,
                e.photo_client_uuid,
                e.disposition,
              ]),
            )
        )
          throw conflict();
      } else {
        const existing = await db.execute<{
          client_uuid: string;
          observation_number: number;
          photo_uuid: string | null;
        }>(
          sql`SELECT p.client_uuid,p.observation_number,h.client_uuid AS photo_uuid FROM inspection_points p LEFT JOIN photos h ON h.inspection_point_id=p.id WHERE p.session_id=${id}::uuid`,
        );
        for (const row of existing.rows) {
          const entry = manifest.find(
            (e) =>
              e.client_uuid === row.client_uuid &&
              e.observation_number === row.observation_number,
          );
          if (
            !entry ||
            (row.photo_uuid && entry.photo_client_uuid !== row.photo_uuid)
          )
            throw conflict();
        }
        await db.execute(
          sql`UPDATE inspection_sessions SET ended_at=${input.ended_at}::timestamptz,manifest=${JSON.stringify(manifest)}::jsonb,allocated_count=${input.allocated_count},last_contact_at=now(),complete_requested=false WHERE id=${id}::uuid`,
        );
      }
      return { session: await this.read(db, id) };
    });
  }
  private async ready(db: Query, visit: Visit) {
    if (
      !visit.ended_at ||
      !visit.manifest ||
      visit.manifest.length !== visit.allocated_count
    )
      return false;
    const rows = await db.execute<{
      client_uuid: string;
      photo_uuid: string;
      status: string;
      deleted_at: Date | null;
    }>(
      sql`SELECT p.client_uuid,h.client_uuid AS photo_uuid,h.status,p.deleted_at FROM inspection_points p LEFT JOIN photos h ON h.inspection_point_id=p.id WHERE p.session_id=${visit.id}::uuid`,
    );
    return visit.manifest.every(
      (entry) =>
        entry.disposition === 'deleted' ||
        rows.rows.some(
          (row) =>
            row.client_uuid === entry.client_uuid &&
            row.photo_uuid === entry.photo_client_uuid &&
            row.status === 'ready' &&
            !row.deleted_at,
        ),
    );
  }
  async syncState(actor: AuthUser, id: string, input: SessionSyncDto) {
    return this.db.transaction(async (db) => {
      const visit = await this.owned(db, actor, id, input.device_id);
      this.acknowledgeClosure(visit, input.closure_id);
      if (visit.closure && !visit.ended_at) throw conflict();
      if (
        input.failed > input.pending ||
        input.sequence < visit.sequence ||
        (input.sequence === visit.sequence &&
          (visit.known_pending !== input.pending ||
            visit.known_failed !== input.failed ||
            visit.complete_requested !== input.complete))
      )
        throw conflict();
      if (
        input.complete &&
        (input.pending !== 0 ||
          input.failed !== 0 ||
          !(await this.ready(db, visit)))
      )
        throw conflict();
      await db.execute(
        sql`UPDATE inspection_sessions SET sequence=${input.sequence},known_pending=${input.pending},known_failed=${input.failed},complete_requested=${input.complete},last_contact_at=now() WHERE id=${id}::uuid`,
      );
      return { session: await this.read(db, id) };
    });
  }
  private async read(db: Query, id: string) {
    const { rows } = await db.execute<Visit>(
      sql`SELECT * FROM inspection_sessions WHERE id=${id}::uuid`,
    );
    return this.publicSession(db, rows[0]);
  }
  private async publicSession(db: Query, visit: Visit) {
    const complete = visit.complete_requested && (await this.ready(db, visit));
    return {
      id: visit.id,
      project_id: visit.project_id,
      inspector_id: visit.inspector_id,
      started_at: visit.started_at,
      ended_at: visit.ended_at,
      closure: visit.closure,
      last_contact_at: visit.last_contact_at,
      known_pending: visit.known_pending,
      known_failed: visit.known_failed,
      sequence: visit.sequence,
      removed_count:
        visit.manifest?.filter((e) => e.disposition === 'deleted').length ?? 0,
      sync_state: complete
        ? 'complete'
        : (visit.closure && !visit.ended_at) || visit.known_pending === null
          ? 'unknown'
          : 'pending',
    };
  }
  async list(actor: AuthUser, projectId: string) {
    await this.access(this.db, actor, projectId);
    const { rows } = await this.db.execute<Visit>(
      sql`SELECT * FROM inspection_sessions WHERE project_id=${projectId}::uuid AND (${actor.role}='manager' OR inspector_id=${actor.id}::uuid) ORDER BY started_at DESC,id`,
    );
    return {
      items: await Promise.all(
        rows.map((row) => this.publicSession(this.db, row)),
      ),
    };
  }
}
