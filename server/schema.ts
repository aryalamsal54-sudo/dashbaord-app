import db from './db';

export async function initSchema() {
  try {
    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User Sessions
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duration_sec INTEGER DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Physics Solutions
    await db.query(`
      CREATE TABLE IF NOT EXISTS physics_solutions (
        id SERIAL PRIMARY KEY,
        question_id TEXT NOT NULL UNIQUE,
        topic TEXT NOT NULL,
        topic_title TEXT,
        tab TEXT NOT NULL,
        num TEXT,
        question TEXT NOT NULL,
        solution TEXT,
        model_used TEXT,
        solved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Math Questions
    await db.query(`
      CREATE TABLE IF NOT EXISTS math_questions (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('example', 'exercise')),
        topic TEXT NOT NULL,
        subtopic TEXT DEFAULT '',
        page TEXT DEFAULT '',
        question TEXT NOT NULL,
        solution TEXT DEFAULT '',
        solved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Student Progress (Programming)
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_progress (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        question_id INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(username, question_id)
      );
    `);

    // Math Solutions (AI Cached)
    await db.query(`
      CREATE TABLE IF NOT EXISTS math_solutions (
        id SERIAL PRIMARY KEY,
        question_id TEXT NOT NULL UNIQUE,
        topic TEXT NOT NULL,
        question TEXT NOT NULL,
        solution TEXT,
        model_used TEXT,
        solved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Programming Solutions (AI Cached)
    await db.query(`
      CREATE TABLE IF NOT EXISTS programming_solutions (
        id SERIAL PRIMARY KEY,
        question_id TEXT NOT NULL UNIQUE,
        topic TEXT NOT NULL,
        question TEXT NOT NULL,
        solution TEXT,
        model_used TEXT,
        solved INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Electrical Topics
    await db.query(`
      CREATE TABLE IF NOT EXISTS electrical_topics (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        overview TEXT,
        sections TEXT,
        custom_qa TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Rate Limits
    await db.query(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        id SERIAL PRIMARY KEY,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        date TEXT NOT NULL,
        last_failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, model, date)
      );
    `);

    console.log('Database schema initialized');
  } catch (err) {
    console.error('Error initializing schema:', err);
  }
}
