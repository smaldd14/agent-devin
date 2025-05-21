-- Migration: Add meal_plans table for weekly meal planning
-- Date: 2025-05-16

CREATE TABLE IF NOT EXISTS meal_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_date TEXT NOT NULL,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Optional: trigger to update updated_at on row modification
CREATE TRIGGER IF NOT EXISTS update_meal_plans_updated_at
AFTER UPDATE ON meal_plans
BEGIN
  UPDATE meal_plans SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;