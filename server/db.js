import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'esf.db');

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

  // Initialize schema - users table with Sale role
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('Admin', 'PreSale', 'TechLead', 'PM', 'Sale')),
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

  // Leads table
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_by INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Pending Review', 'Reviewing', 'Pending Estimation', 'Estimated')),
      client_name TEXT NOT NULL,
      cooperation_model TEXT,
      work_type TEXT,
      tech_stack TEXT,
      hourly_rate REAL,
      budget TEXT,
      timeframe TEXT,
      deadline TEXT,
      start_date TEXT,
      team_need TEXT,
      english_level TEXT,
      meetings TEXT,
      timezone TEXT,
      project_stage TEXT,
      intro_call_link TEXT,
      presentation_link TEXT,
      business_idea TEXT,
      job_description TEXT,
      design_link TEXT,
      project_overview TEXT,
      estimate_id INTEGER,
      assigned_presale INTEGER,
      assigned_techlead INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (estimate_id) REFERENCES estimates(id),
      FOREIGN KEY (assigned_presale) REFERENCES users(id),
      FOREIGN KEY (assigned_techlead) REFERENCES users(id)
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
      { email: 'pm@test.com', password: 'pm123', name: 'Project Manager', role: 'PM' },
      { email: 'sale@test.com', password: 'sale123', name: 'Sales Manager', role: 'Sale' }
    ];

    for (const user of seedUsers) {
      const hashedPassword = bcrypt.hashSync(user.password, 10);
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        [user.email, hashedPassword, user.name, user.role]
      );
    }
    console.log('✓ Seeded default users (including Sale)');
    saveDb();
  }

  // Migration: Add Sale user if not exists
  const saleUser = queryOne('SELECT * FROM users WHERE email = ?', ['sale@test.com']);
  if (!saleUser) {
    const hashedPassword = bcrypt.hashSync('sale123', 10);
    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['sale@test.com', hashedPassword, 'Sales Manager', 'Sale']
    );
    saveDb();
    console.log('✓ Added Sale user');
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

  // Migration: Update leads table to support 'Pending Review'
  try {
    const leadsSchema = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='leads'")[0]?.values[0][0];
    if (leadsSchema && !leadsSchema.includes("'Pending Review'")) {
      console.log('Migrating leads table to support Pending Review status...');
      db.run("BEGIN TRANSACTION");
      db.run("ALTER TABLE leads RENAME TO leads_old");
      db.run(`
        CREATE TABLE leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_by INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Pending Review', 'Reviewing', 'Pending Estimation', 'Estimated')),
          client_name TEXT NOT NULL,
          cooperation_model TEXT,
          work_type TEXT,
          tech_stack TEXT,
          hourly_rate REAL,
          budget TEXT,
          timeframe TEXT,
          deadline TEXT,
          start_date TEXT,
          team_need TEXT,
          english_level TEXT,
          meetings TEXT,
          timezone TEXT,
          project_stage TEXT,
          intro_call_link TEXT,
          presentation_link TEXT,
          business_idea TEXT,
          job_description TEXT,
          design_link TEXT,
          project_overview TEXT,
          estimate_id INTEGER,
          assigned_presale INTEGER,
          assigned_techlead INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (estimate_id) REFERENCES estimates(id),
          FOREIGN KEY (assigned_presale) REFERENCES users(id),
          FOREIGN KEY (assigned_techlead) REFERENCES users(id)
        )
      `);
      db.run("INSERT INTO leads SELECT * FROM leads_old");
      db.run("DROP TABLE leads_old");
      db.run("COMMIT");
      saveDb();
      console.log('✓ Migrated leads table');
    }
  } catch (err) {
    console.error('Leads migration failed:', err);
    db.run("ROLLBACK");
  }

  // Migration: Add Rejected and Contract statuses to leads
  try {
    const leadsSchema = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='leads'")[0]?.values[0][0];
    if (leadsSchema && !leadsSchema.includes("'Rejected'")) {
      console.log('Migrating leads table to support Rejected/Contract statuses...');
      db.run("BEGIN TRANSACTION");
      db.run("ALTER TABLE leads RENAME TO leads_old2");
      db.run(`
        CREATE TABLE leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_by INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Pending Review', 'Reviewing', 'Pending Estimation', 'Estimated', 'Rejected', 'Contract')),
          client_name TEXT NOT NULL,
          cooperation_model TEXT,
          work_type TEXT,
          tech_stack TEXT,
          hourly_rate REAL,
          budget TEXT,
          timeframe TEXT,
          deadline TEXT,
          start_date TEXT,
          team_need TEXT,
          english_level TEXT,
          meetings TEXT,
          timezone TEXT,
          project_stage TEXT,
          intro_call_link TEXT,
          presentation_link TEXT,
          business_idea TEXT,
          job_description TEXT,
          design_link TEXT,
          project_overview TEXT,
          rejection_reason TEXT,
          estimate_id INTEGER,
          assigned_presale INTEGER,
          assigned_techlead INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (estimate_id) REFERENCES estimates(id),
          FOREIGN KEY (assigned_presale) REFERENCES users(id),
          FOREIGN KEY (assigned_techlead) REFERENCES users(id)
        )
      `);
      db.run(`INSERT INTO leads (id, created_by, status, client_name, cooperation_model, work_type, tech_stack, 
        hourly_rate, budget, timeframe, deadline, start_date, team_need, english_level, meetings, timezone,
        project_stage, intro_call_link, presentation_link, business_idea, job_description, design_link,
        project_overview, estimate_id, assigned_presale, assigned_techlead, created_at, updated_at)
        SELECT id, created_by, status, client_name, cooperation_model, work_type, tech_stack,
        hourly_rate, budget, timeframe, deadline, start_date, team_need, english_level, meetings, timezone,
        project_stage, intro_call_link, presentation_link, business_idea, job_description, design_link,
        project_overview, estimate_id, assigned_presale, assigned_techlead, created_at, updated_at FROM leads_old2`);
      db.run("DROP TABLE leads_old2");
      db.run("COMMIT");
      saveDb();
      console.log('✓ Migrated leads table with Rejected/Contract statuses');
    }
  } catch (err) {
    console.error('Leads Rejected/Contract migration failed:', err);
    db.run("ROLLBACK");
  }

  // Projects table (1 Lead -> N Projects)
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      name TEXT,
      status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Active', 'Paused', 'Finished')),
      assigned_pm INTEGER,
      assigned_developers TEXT,
      credentials TEXT,
      project_charter TEXT,
      documentation TEXT,
      changelog TEXT,
      invoices TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (assigned_pm) REFERENCES users(id)
    )
  `);

  // Estimate requests table (PM requests estimate for a project)
  db.run(`
    CREATE TABLE IF NOT EXISTS estimate_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      requested_by INTEGER NOT NULL,
      scope_description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
      estimate_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (requested_by) REFERENCES users(id),
      FOREIGN KEY (estimate_id) REFERENCES estimates(id)
    )
  `);

  // Migration: Add project_id to estimates if not exists
  try {
    const estTableInfo = db.exec("PRAGMA table_info(estimates)");
    const estColumns = estTableInfo[0]?.values.map(col => col[1]) || [];
    if (!estColumns.includes('project_id')) {
      db.run('ALTER TABLE estimates ADD COLUMN project_id INTEGER REFERENCES projects(id)');
      saveDb();
      console.log('✓ Added project_id to estimates');
    }
  } catch (err) {
    console.log('Migration note (project_id):', err.message);
  }

  // Migration: Add name to projects if not exists
  try {
    const projTableInfo = db.exec("PRAGMA table_info(projects)");
    const projColumns = projTableInfo[0]?.values.map(col => col[1]) || [];
    if (!projColumns.includes('name')) {
      db.run('ALTER TABLE projects ADD COLUMN name TEXT');
      saveDb();
      console.log('✓ Added name to projects');
    }
  } catch (err) {
    console.log('Migration note (projects.name):', err.message);
  }

  // Migration: Remove UNIQUE constraint from projects.lead_id (recreate table)
  try {
    const projSchema = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'")[0]?.values[0][0];
    if (projSchema && projSchema.includes('UNIQUE')) {
      console.log('Migrating projects table to remove UNIQUE constraint on lead_id...');
      db.run("BEGIN TRANSACTION");
      db.run("ALTER TABLE projects RENAME TO projects_old_unique");
      db.run(`
        CREATE TABLE projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER NOT NULL,
          name TEXT,
          status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Active', 'Paused', 'Finished')),
          assigned_pm INTEGER,
          assigned_developers TEXT,
          credentials TEXT,
          project_charter TEXT,
          documentation TEXT,
          changelog TEXT,
          invoices TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lead_id) REFERENCES leads(id),
          FOREIGN KEY (assigned_pm) REFERENCES users(id)
        )
      `);
      db.run(`INSERT INTO projects (id, lead_id, status, assigned_pm, assigned_developers, credentials, project_charter, documentation, changelog, invoices, created_at, updated_at)
              SELECT id, lead_id, status, assigned_pm, assigned_developers, credentials, project_charter, documentation, changelog, invoices, created_at, updated_at FROM projects_old_unique`);
      db.run("DROP TABLE projects_old_unique");
      db.run("COMMIT");
      saveDb();
      console.log('✓ Migrated projects table (removed UNIQUE constraint)');
    }
  } catch (err) {
    console.error('Projects UNIQUE migration failed:', err);
    db.run("ROLLBACK");
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
export const insertEstimate = (name, createdBy, data, projectId = null) => {
  db.run(
    'INSERT INTO estimates (name, created_by, data, project_id) VALUES (?, ?, ?, ?)',
    [name, createdBy, data, projectId]
  );
  saveDb();

  // Get the newly inserted row by finding max id for this user
  const result = queryOne(
    'SELECT * FROM estimates WHERE created_by = ? ORDER BY id DESC LIMIT 1',
    [createdBy]
  );
  return result;
};

// Lead helpers
export const insertLead = (leadData) => {
  const {
    created_by, client_name, cooperation_model, work_type, tech_stack,
    hourly_rate, budget, timeframe, deadline, start_date, team_need,
    english_level, meetings, timezone, project_stage, intro_call_link,
    presentation_link, business_idea, job_description, design_link
  } = leadData;

  db.run(
    `INSERT INTO leads (
      created_by, client_name, cooperation_model, work_type, tech_stack,
      hourly_rate, budget, timeframe, deadline, start_date, team_need,
      english_level, meetings, timezone, project_stage, intro_call_link,
      presentation_link, business_idea, job_description, design_link, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
    [
      created_by, client_name, cooperation_model, work_type, tech_stack,
      hourly_rate, budget, timeframe, deadline, start_date, team_need,
      english_level, meetings, timezone, project_stage, intro_call_link,
      presentation_link, business_idea, job_description, design_link
    ]
  );
  saveDb();

  return queryOne('SELECT * FROM leads WHERE created_by = ? ORDER BY id DESC LIMIT 1', [created_by]);
};

export const updateLead = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(f => `${f} = ?`).join(', ');

  db.run(`UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
  saveDb();

  return queryOne('SELECT * FROM leads WHERE id = ?', [id]);
};

export const getLeadWithCreator = (id) => {
  return queryOne(`
    SELECT leads.*, users.name as creator_name, users.email as creator_email
    FROM leads
    LEFT JOIN users ON leads.created_by = users.id
    WHERE leads.id = ?
  `, [id]);
};

export const getAllLeads = () => {
  return queryAll(`
    SELECT leads.*, users.name as creator_name
    FROM leads
    LEFT JOIN users ON leads.created_by = users.id
    ORDER BY leads.created_at DESC
  `);
};

export const getLeadsByStatus = (status) => {
  return queryAll(`
    SELECT leads.*, users.name as creator_name
    FROM leads
    LEFT JOIN users ON leads.created_by = users.id
    WHERE leads.status = ?
    ORDER BY leads.created_at DESC
  `, [status]);
};

export const getLeadsByCreator = (userId) => {
  return queryAll(`
    SELECT leads.*, users.name as creator_name
    FROM leads
    LEFT JOIN users ON leads.created_by = users.id
    WHERE leads.created_by = ?
    ORDER BY leads.created_at DESC
  `, [userId]);
};

// Project helpers
export const insertProject = (leadId, name = null) => {
  db.run(
    'INSERT INTO projects (lead_id, name, changelog) VALUES (?, ?, ?)',
    [leadId, name, JSON.stringify([{ date: new Date().toISOString(), action: 'Project created from lead', user: 'System' }])]
  );
  saveDb();
  // Return the newly created project (might have multiple per lead now)
  return queryOne('SELECT * FROM projects WHERE lead_id = ? ORDER BY id DESC LIMIT 1', [leadId]);
};

export const updateProject = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(f => `${f} = ?`).join(', ');

  db.run(`UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
  saveDb();

  return queryOne('SELECT * FROM projects WHERE id = ?', [id]);
};

export const getProjectWithDetails = (id) => {
  const project = queryOne(`
    SELECT projects.*, 
           pm.name as pm_name,
           leads.client_name, leads.cooperation_model, leads.work_type, leads.tech_stack,
           leads.hourly_rate, leads.budget, leads.timeframe, leads.deadline, leads.start_date,
           leads.team_need, leads.english_level, leads.meetings, leads.timezone, leads.project_stage,
           leads.intro_call_link, leads.presentation_link, leads.business_idea, leads.job_description,
           leads.design_link, leads.project_overview, leads.estimate_id,
           sale.name as sale_name,
           presale.name as presale_name
    FROM projects
    LEFT JOIN users pm ON projects.assigned_pm = pm.id
    LEFT JOIN leads ON projects.lead_id = leads.id
    LEFT JOIN users sale ON leads.created_by = sale.id
    LEFT JOIN users presale ON leads.assigned_presale = presale.id
    WHERE projects.id = ?
  `, [id]);

  if (project && project.estimate_id) {
    project.estimate = queryOne('SELECT * FROM estimates WHERE id = ?', [project.estimate_id]);
  }

  return project;
};

export const getAllProjects = () => {
  return queryAll(`
    SELECT projects.*, leads.client_name, pm.name as pm_name
    FROM projects
    LEFT JOIN leads ON projects.lead_id = leads.id
    LEFT JOIN users pm ON projects.assigned_pm = pm.id
    ORDER BY projects.created_at DESC
  `);
};

export const getProjectsByPM = (pmId) => {
  return queryAll(`
    SELECT projects.*, leads.client_name, pm.name as pm_name
    FROM projects
    LEFT JOIN leads ON projects.lead_id = leads.id
    LEFT JOIN users pm ON projects.assigned_pm = pm.id
    WHERE projects.assigned_pm = ?
    ORDER BY projects.created_at DESC
  `, [pmId]);
};

export const getProjectsByLeadId = (leadId) => {
  return queryAll('SELECT * FROM projects WHERE lead_id = ? ORDER BY id DESC', [leadId]);
};

// Keep singular for backwards compat (returns first)
export const getProjectByLeadId = (leadId) => {
  return queryOne('SELECT * FROM projects WHERE lead_id = ? ORDER BY id ASC', [leadId]);
};

// Estimate request helpers
export const insertEstimateRequest = (projectId, requestedBy, scopeDescription) => {
  db.run(
    'INSERT INTO estimate_requests (project_id, requested_by, scope_description) VALUES (?, ?, ?)',
    [projectId, requestedBy, scopeDescription]
  );
  saveDb();
  return queryOne('SELECT * FROM estimate_requests WHERE project_id = ? ORDER BY id DESC LIMIT 1', [projectId]);
};

export const getEstimateRequestsByProject = (projectId) => {
  return queryAll(`
    SELECT er.*, u.name as requester_name
    FROM estimate_requests er
    LEFT JOIN users u ON er.requested_by = u.id
    WHERE er.project_id = ?
    ORDER BY er.created_at DESC
  `, [projectId]);
};

export const getPendingEstimateRequests = () => {
  return queryAll(`
    SELECT er.*, u.name as requester_name, p.name as project_name, l.client_name
    FROM estimate_requests er
    LEFT JOIN users u ON er.requested_by = u.id
    LEFT JOIN projects p ON er.project_id = p.id
    LEFT JOIN leads l ON p.lead_id = l.id
    WHERE er.status = 'Pending'
    ORDER BY er.created_at ASC
  `);
};

export const updateEstimateRequest = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(f => `${f} = ?`).join(', ');

  db.run(`UPDATE estimate_requests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
  saveDb();

  return queryOne('SELECT * FROM estimate_requests WHERE id = ?', [id]);
};

export const getEstimatesByProject = (projectId) => {
  return queryAll(`
    SELECT e.*, u.name as creator_name
    FROM estimates e
    LEFT JOIN users u ON e.created_by = u.id
    WHERE e.project_id = ?
    ORDER BY e.created_at DESC
  `, [projectId]);
};
