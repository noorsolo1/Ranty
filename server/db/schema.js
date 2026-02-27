const { getDb } = require('./database');

function initSchema() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      transcript TEXT NOT NULL,
      audio_filename TEXT,
      duration_sec INTEGER,
      recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
      emotions TEXT,
      trigger_keywords TEXT,
      ai_summary TEXT,
      sentiment_score REAL,
      hour_of_day INTEGER
    );

    CREATE TABLE IF NOT EXISTS analysis_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      summary TEXT,
      generated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('Database schema initialized.');
}

module.exports = { initSchema };
