import pkg from 'pg';
const { Pool } = pkg;

// Use the DATABASE_URL environment variable if available (standard for Render),
// otherwise fallback to the hardcoded internal Render URL.
const connectionString = process.env.DATABASE_URL || 'postgresql://derivation_user:p1mu2oOuQTHNQPZYsUHLcsOH4saXVh5b@dpg-d6lr38k50q8c73a998pg-a/derivation';

const pool = new Pool({
  connectionString,
  // Render requires SSL for external connections. 
  // If you are using the external database URL, you need this SSL config.
  // It's safely ignored for internal connections.
  ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : undefined
});

export default pool;
