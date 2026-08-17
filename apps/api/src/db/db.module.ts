import { Global, Module } from '@nestjs/common';
import { createDb, createPool } from './client';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => {
        if (!process.env.DATABASE_URL) {
          return null;
        }
        return createPool();
      },
    },
    {
      provide: 'DB',
      useFactory: (pool: ReturnType<typeof createPool> | null) => {
        if (!pool) {
          return null;
        }
        return createDb(pool);
      },
      inject: ['PG_POOL'],
    },
  ],
  exports: ['PG_POOL', 'DB'],
})
export class DbModule {}
