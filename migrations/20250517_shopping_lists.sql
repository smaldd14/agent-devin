-- Create shopping_lists table
 CREATE TABLE IF NOT EXISTS shopping_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  updated_at TIMESTAMP
);

-- Create shopping_list_items table
 CREATE TABLE IF NOT EXISTS shopping_list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopping_list_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity REAL,
  unit TEXT,
  category TEXT,
  brand TEXT,
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
);