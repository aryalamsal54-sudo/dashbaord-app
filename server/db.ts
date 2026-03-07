import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('ioe_hub.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

export default db;
