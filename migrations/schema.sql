-- Create recipes table
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  instructions TEXT NOT NULL,
  cooking_time INTEGER,
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  updated_at TIMESTAMP
);

-- Create recipe_ingredients table
CREATE TABLE recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  ingredient_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  is_protein INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Create inventory_items table
CREATE TABLE inventory_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  item_description TEXT,
  brand TEXT,
  storage_location TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  minimum_quantity REAL,
  expiry_date TIMESTAMP,
  purchase_date TIMESTAMP NOT NULL,
  unit_price REAL,
  notes TEXT,
  restock_flag INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  updated_at TIMESTAMP
);

-- Add index on item_name for faster lookups
CREATE INDEX idx_inventory_items_item_name ON inventory_items (item_name);

-- Create inventory_history table
CREATE TABLE inventory_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  change_type TEXT NOT NULL,
  quantity_change REAL NOT NULL,
  previous_quantity REAL NOT NULL,
  new_quantity REAL NOT NULL,
  change_timestamp TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  change_source TEXT NOT NULL,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

-- Create shopping_lists table
 CREATE TABLE shopping_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TIMESTAMP DEFAULT (datetime('now')) NOT NULL,
  updated_at TIMESTAMP
);

-- Create shopping_list_items table
 CREATE TABLE shopping_list_items (
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

-- Create triggers for updated_at fields
CREATE TRIGGER update_recipes_updated_at 
AFTER UPDATE ON recipes
BEGIN
  UPDATE recipes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_inventory_items_updated_at 
AFTER UPDATE ON inventory_items
BEGIN
  UPDATE inventory_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER update_shopping_lists_updated_at 
AFTER UPDATE ON shopping_lists
BEGIN
  UPDATE shopping_lists SET updated_at = datetime('now') WHERE id = NEW.id;
END;