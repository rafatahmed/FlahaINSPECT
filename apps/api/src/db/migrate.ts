import { join } from 'node:path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createDb, createPool } from './client';

export const migrationsFolder = join(__dirname, '../../drizzle');

export async function runMigrations(databaseUrl = process.env.DATABASE_URL): Promise<void> {
  const pool = createPool(databaseUrl);
  try {
    const db = createDb(pool);
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}

async function main(): Promise<void> {
  const times = process.argv.includes('--twice') ? 2 : 1;
  for (let i = 0; i < times; i += 1) {
    await runMigrations();
    console.log(`migrate pass ${i + 1}/${times} ok (${migrationsFolder})`);
  }
}

if (require.main === module) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
