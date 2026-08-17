import argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { createDb, createPool } from './client';
import { projectMembers, projects, users } from './schema';

/**
 * Local/staging only. Requires SEED_PASSWORD. Refuses NODE_ENV=production.
 * AuthZ still uses users.role; member_role is stored and ignored (KD-33).
 */
export async function seed(databaseUrl = process.env.DATABASE_URL): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed when NODE_ENV=production');
  }
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 10) {
    throw new Error(
      'SEED_PASSWORD must be set and at least 10 characters (local/staging only)',
    );
  }

  const pool = createPool(databaseUrl);
  const db = createDb(pool);
  try {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    const manager = await upsertUser(db, {
      email: 'manager@local.flaha',
      fullName: 'Local Manager',
      role: 'manager',
      passwordHash,
    });
    const inspector = await upsertUser(db, {
      email: 'inspector@local.flaha',
      fullName: 'Local Inspector',
      role: 'inspector',
      passwordHash,
    });

    const existingProject = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.code, 'LOCAL'));

    let projectId = existingProject[0]?.id;
    if (!projectId) {
      const [created] = await db
        .insert(projects)
        .values({
          name: 'Local pilot project',
          code: 'LOCAL',
          description: 'Seeded project for internal development. Not for production.',
          createdBy: manager.id,
        })
        .returning({ id: projects.id });
      projectId = created.id;
    }

    await db
      .insert(projectMembers)
      .values({
        projectId,
        userId: inspector.id,
        memberRole: 'inspector',
      })
      .onConflictDoNothing();

    console.log('seed ok', {
      manager: manager.email,
      inspector: inspector.email,
      project: 'LOCAL',
    });
  } finally {
    await pool.end();
  }
}

async function upsertUser(
  db: ReturnType<typeof createDb>,
  input: {
    email: string;
    fullName: string;
    role: 'manager' | 'inspector';
    passwordHash: string;
  },
) {
  const email = input.email.toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing[0]) {
    const [updated] = await db
      .update(users)
      .set({
        passwordHash: input.passwordHash,
        fullName: input.fullName,
        role: input.role,
        isActive: true,
      })
      .where(eq(users.email, email))
      .returning();
    return updated;
  }
  const [created] = await db
    .insert(users)
    .values({
      email,
      fullName: input.fullName,
      role: input.role,
      passwordHash: input.passwordHash,
    })
    .returning();
  return created;
}

if (require.main === module) {
  seed().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
