import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'esf.db');

let db = null;

export const initDb = async () => {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'PreSale', 'TechLead', 'PM')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      data TEXT NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Seed default users if table is empty
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = result[0]?.values[0][0] || 0;

  if (userCount === 0) {
    const seedUsers = [
      { email: 'admin@test.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
      { email: 'presale@test.com', password: 'presale123', name: 'PreSale Manager', role: 'PreSale' },
      { email: 'techlead@test.com', password: 'techlead123', name: 'Tech Lead', role: 'TechLead' },
      { email: 'pm@test.com', password: 'pm123', name: 'Project Manager', role: 'PM' }
    ];

    for (const user of seedUsers) {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [user.email, hashedPassword, user.name, user.role]
      );
    }
    console.log('✓ Seeded default users');
    saveDb();
  }

  // Migration for share_uuid
  try {
    const tableInfo = db.exec("PRAGMA table_info(estimates)");
    const columns = tableInfo[0]?.values.map(col => col[1]) || [];
    if (!columns.includes('share_uuid')) {
      db.run('ALTER TABLE estimates ADD COLUMN share_uuid TEXT');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_share_uuid ON estimates(share_uuid)');
      saveDb();
      console.log('✓ Applied migration: added share_uuid to estimates');
    }
  } catch (err) {
    console.log('Migration note:', err.message);
  }

  return db;
};

export const saveDb = () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
};

export const getDb = () => db;

// Helper to convert sql.js result to object array
export const queryAll = (sql, params = []) => {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
};

export const queryOne = (sql, params = []) => {
  const results = queryAll(sql, params);
  return results[0] || null;
};

export const run = (sql, params = []) => {
  db.run(sql, params);
  saveDb();
};

export const getEstimateByShareUuid = (uuid) => {
  return queryOne('SELECT * FROM estimates WHERE share_uuid = ?', [uuid]);
};

export const setEstimateShareUuid = (id, uuid) => {
  db.run('UPDATE estimates SET share_uuid = ? WHERE id = ?', [uuid, id]);
  saveDb();
  return queryOne('SELECT * FROM estimates WHERE id = ?', [id]);
};

// Special insert helper that returns the new row
export const insertEstimate = (name, createdBy, data) => {
  db.run(
    'INSERT INTO estimates (name, created_by, data) VALUES (?, ?, ?)',
    [name, createdBy, data]
  );
  saveDb();

  // Get the newly inserted row by finding max id for this user
  const result = queryOne(
    'SELECT * FROM estimates WHERE created_by = ? ORDER BY id DESC LIMIT 1',
    [createdBy]
  );
  return result;
};
