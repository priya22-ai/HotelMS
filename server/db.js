import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// Neon requires SSL. Support both DATABASE_URL and individual PG vars
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[db] WARNING: DATABASE_URL not set. Set it in .env or Render Env.');
}

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      }
    : {
        host: process.env.PGHOST || 'localhost',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'meal_management',
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        ssl: false,
      }
);

// Test connection on startup (non-blocking)
pool.on('error', (err) => {
  console.error('[db] pool error', err);
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

export async function getOne(text, params) {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
}

export default pool;
