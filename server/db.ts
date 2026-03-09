import pkg from 'pg';
const { Pool } = pkg;

const connectionString = 'postgresql://derivation_user:p1mu2oOuQTHNQPZYsUHLcsOH4saXVh5b@dpg-d6lr38k50q8c73a998pg-a/derivation';

const pool = new Pool({
  connectionString,
});

export default pool;
