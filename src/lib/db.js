import { Pool } from 'pg';

// Satu pool dipakai ulang (aman untuk hot reload saat development)
const g = globalThis;
export const pool = g._pgPool ?? (g._pgPool = new Pool({ connectionString: process.env.DATABASE_URL }));

export const query = (text, params) => pool.query(text, params);
