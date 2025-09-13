const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbFile = path.join(__dirname, "taskmanager.db");
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    avatar TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'Todo',
    priority TEXT DEFAULT 'Medium',
    due_date TEXT,
    tags TEXT,
    assignee INTEGER,
    creator INTEGER,
    attachment TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (assignee) REFERENCES users(id),
    FOREIGN KEY (creator) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER,
    userId INTEGER,
    text TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (taskId) REFERENCES tasks(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  )`);
});

module.exports = db;
