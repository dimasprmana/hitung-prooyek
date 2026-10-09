PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'Berjalan',
  total_cost REAL NOT NULL DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  calculator_type TEXT,
  title TEXT NOT NULL,
  input_data TEXT,
  result_data TEXT,
  total_cost REAL NOT NULL DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calculation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  calculator_type TEXT NOT NULL,
  calculator_name TEXT NOT NULL,
  title TEXT,
  input_data TEXT,
  result_data TEXT,
  total_cost REAL NOT NULL DEFAULT 0,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Aktif',
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS material_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id INTEGER NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  region TEXT,
  effective_date TEXT,
  created_at DATETIME,
  FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE
);
