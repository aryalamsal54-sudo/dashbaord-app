import db from './db';

export function initSchema() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // User Sessions
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_start TEXT DEFAULT CURRENT_TIMESTAMP,
      last_ping TEXT DEFAULT CURRENT_TIMESTAMP,
      duration_sec INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Physics Solutions
  db.exec(`
    CREATE TABLE IF NOT EXISTS physics_solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL UNIQUE,
      topic TEXT NOT NULL,
      topic_title TEXT,
      tab TEXT NOT NULL,
      num TEXT,
      question TEXT NOT NULL,
      solution TEXT,
      model_used TEXT,
      solved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Math Questions
  db.exec(`
    CREATE TABLE IF NOT EXISTS math_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK (type IN ('example', 'exercise')),
      topic TEXT NOT NULL,
      subtopic TEXT DEFAULT '',
      page TEXT DEFAULT '',
      question TEXT NOT NULL,
      solution TEXT DEFAULT '',
      solved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Student Progress (Programming)
  db.exec(`
    CREATE TABLE IF NOT EXISTS student_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(username, question_id)
    );
  `);

  // Math Solutions (AI Cached)
  db.exec(`
    CREATE TABLE IF NOT EXISTS math_solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL UNIQUE,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      solution TEXT,
      model_used TEXT,
      solved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Programming Solutions (AI Cached)
  db.exec(`
    CREATE TABLE IF NOT EXISTS programming_solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL UNIQUE,
      topic TEXT NOT NULL,
      question TEXT NOT NULL,
      solution TEXT,
      model_used TEXT,
      solved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Electrical Topics
  db.exec(`
    CREATE TABLE IF NOT EXISTS electrical_topics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      overview TEXT,
      sections TEXT,
      custom_qa TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database schema initialized');
}
