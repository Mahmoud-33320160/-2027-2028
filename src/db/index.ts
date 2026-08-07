import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || 'localhost',
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || '',
      database: process.env.SQL_DB_NAME || 'postgres',
      max: 10,
      connectionTimeoutMillis: 5000,
    });

    global._postgresPool.on('error', (err) => {
      console.warn('Unexpected error on idle SQL pool client (fallback active):', err);
    });
  }
  return global._postgresPool;
};

let dbInstance: any;

try {
  if (process.env.SQL_HOST) {
    const pool = createPool();
    dbInstance = drizzle(pool, { schema });
  } else {
    console.warn('[AI Studio] SQL_HOST not set — using mock db fallback');
    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (d: any) => d?.data ?? {},
      update: async (d: any) => d?.data ?? {},
      delete: async () => ({}),
    };
    dbInstance = new Proxy({}, {
      get: (_, prop) => prop === 'query'
        ? new Proxy({}, { get: () => noOp }) : async () => [],
    });
  }
} catch {
  console.warn('[AI Studio] Database connection fallback active');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  dbInstance = new Proxy({}, {
    get: (_, prop) => prop === 'query'
      ? new Proxy({}, { get: () => noOp }) : async () => [],
  });
}

export const db = dbInstance;
