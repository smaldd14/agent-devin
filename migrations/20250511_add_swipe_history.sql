-- 2025-05-11: Add swipe_history table to record swipe actions
-- Run this migration using:
--   npx wrangler d1 execute --database DB migrations/20250511_add_swipe_history.sql

CREATE TABLE IF NOT EXISTS swipe_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT (datetime('now')) NOT NULL
);