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
      request_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      data TEXT NOT NULL,
      edit_history TEXT DEFAULT '[]',
      FOREIGN KEY (created_by) REFERENCES users(id),
      FOREIGN KEY (request_id) REFERENCES requests(id)
    )
  `);

  // NEW simplified Leads table - just client info
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_by INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      company TEXT,
      timezone TEXT,
      source TEXT CHECK(source IN ('Upwork', 'LinkedIn', 'Website', 'Referral', 'Other')),
      status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'In Progress', 'Closed')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // NEW Requests table - project details (1 Lead -> N Requests)
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      project_name TEXT,
      status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Pending Review', 'Reviewing', 'Rejected', 'Pending Estimation', 'Estimated', 'PreSale Review', 'Sale Review', 'Accepted', 'Contract')),
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
      project_stage TEXT,
      intro_call_link TEXT,
      call_summary TEXT,
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
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
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

  // === MIGRATION: Old leads table to new structure ===
  try {
    const leadsTableInfo = db.exec("PRAGMA table_info(leads)");
    const leadsColumns = leadsTableInfo[0]?.values.map(col => col[1]) || [];

    // Check if old structure exists (has cooperation_model in leads)
    if (leadsColumns.includes('cooperation_model')) {
      console.log('Migrating old leads structure to Lead + Request...');
      db.run("BEGIN TRANSACTION");

      // Get all old leads
      const oldLeads = queryAll('SELECT * FROM leads');

      // Rename old table
      db.run("ALTER TABLE leads RENAME TO leads_old_migration");

      // Create new leads table
      db.run(`
        CREATE TABLE leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_by INTEGER NOT NULL,
          client_name TEXT NOT NULL,
          company TEXT,
          timezone TEXT,
          source TEXT CHECK(source IN ('Upwork', 'LinkedIn', 'Website', 'Referral', 'Other')),
          status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'In Progress', 'Closed')),
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Create requests table if not exists
      db.run(`
        CREATE TABLE IF NOT EXISTS requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER NOT NULL,
          created_by INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Pending Review', 'Reviewing', 'Rejected', 'Pending Estimation', 'Estimated', 'PreSale Review', 'Sale Review', 'Accepted', 'Contract')),
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
          project_stage TEXT,
          intro_call_link TEXT,
          call_summary TEXT,
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
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (estimate_id) REFERENCES estimates(id),
          FOREIGN KEY (assigned_presale) REFERENCES users(id),
          FOREIGN KEY (assigned_techlead) REFERENCES users(id)
        )
      `);

      // Migrate each old lead
      for (const oldLead of oldLeads) {
        // Insert new lead with basic info
        const leadStatus = oldLead.status === 'Contract' ? 'Closed' :
          (oldLead.status === 'New' ? 'New' : 'In Progress');

        db.run(
          `INSERT INTO leads (id, created_by, client_name, company, timezone, source, status, created_at, updated_at)
           VALUES (?, ?, ?, NULL, ?, 'Other', ?, ?, ?)`,
          [oldLead.id, oldLead.created_by, oldLead.client_name, oldLead.timezone, leadStatus, oldLead.created_at, oldLead.updated_at]
        );

        // Insert request with project details
        db.run(
          `INSERT INTO requests (lead_id, created_by, status, cooperation_model, work_type, tech_stack,
            hourly_rate, budget, timeframe, deadline, start_date, team_need, english_level, meetings,
            project_stage, intro_call_link, call_summary, presentation_link, business_idea, job_description,
            design_link, project_overview, rejection_reason, estimate_id, assigned_presale, assigned_techlead,
            created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            oldLead.id, oldLead.created_by, oldLead.status, oldLead.cooperation_model, oldLead.work_type,
            oldLead.tech_stack, oldLead.hourly_rate, oldLead.budget, oldLead.timeframe, oldLead.deadline,
            oldLead.start_date, oldLead.team_need, oldLead.english_level, oldLead.meetings, oldLead.project_stage,
            oldLead.intro_call_link, oldLead.presentation_link, oldLead.business_idea, oldLead.job_description,
            oldLead.design_link, oldLead.project_overview, oldLead.rejection_reason, oldLead.estimate_id,
            oldLead.assigned_presale, oldLead.assigned_techlead, oldLead.created_at, oldLead.updated_at
          ]
        );
      }

      // Drop old table
      db.run("DROP TABLE leads_old_migration");

      db.run("COMMIT");
      saveDb();
      console.log(`✓ Migrated ${oldLeads.length} leads to new structure`);
    }
  } catch (err) {
    console.error('Lead migration failed:', err);
    try { db.run("ROLLBACK"); } catch (e) { }
  }

  // Projects table (1 Lead -> N Projects)
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      request_id INTEGER,
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
      FOREIGN KEY (request_id) REFERENCES requests(id),
      FOREIGN KEY (assigned_pm) REFERENCES users(id)
    )
  `);

  // Migration: Add request_id to projects if not exists
  try {
    const projTableInfo = db.exec("PRAGMA table_info(projects)");
    const projColumns = projTableInfo[0]?.values.map(col => col[1]) || [];
    if (!projColumns.includes('request_id')) {
      db.run('ALTER TABLE projects ADD COLUMN request_id INTEGER REFERENCES requests(id)');
      saveDb();
      console.log('✓ Added request_id to projects');
    }
    if (!projColumns.includes('name')) {
      db.run('ALTER TABLE projects ADD COLUMN name TEXT');
      saveDb();
      console.log('✓ Added name to projects');
    }
  } catch (err) {
    console.log('Migration note (projects):', err.message);
  }

  // Migration: Add new columns to requests if not exists
  try {
    const reqTableInfo = db.exec("PRAGMA table_info(requests)");
    const reqColumns = reqTableInfo[0]?.values.map(col => col[1]) || [];
    if (!reqColumns.includes('project_name')) {
      db.run('ALTER TABLE requests ADD COLUMN project_name TEXT');
      saveDb();
      console.log('✓ Added project_name to requests');
    }
    if (!reqColumns.includes('rejection_reason')) {
      db.run('ALTER TABLE requests ADD COLUMN rejection_reason TEXT');
      saveDb();
      console.log('✓ Added rejection_reason to requests');
    }
  } catch (err) {
    console.log('Migration note (requests columns):', err.message);
  }

  // Migration: Add request_id and edit_history to estimates if not exists
  try {
    const estTableInfo = db.exec("PRAGMA table_info(estimates)");
    const estColumns = estTableInfo[0]?.values.map(col => col[1]) || [];
    if (!estColumns.includes('request_id')) {
      db.run('ALTER TABLE estimates ADD COLUMN request_id INTEGER REFERENCES requests(id)');
      saveDb();
      console.log('✓ Added request_id to estimates');
    }
    if (!estColumns.includes('edit_history')) {
      db.run("ALTER TABLE estimates ADD COLUMN edit_history TEXT DEFAULT '[]'");
      saveDb();
      console.log('✓ Added edit_history to estimates');
    }
  } catch (err) {
    console.log('Migration note (estimates):', err.message);
  }

  // Migration: Update requests table CHECK constraint if needed
  try {
    const tableSql = db.exec("SELECT sql FROM sqlite_master WHERE name='requests'")[0].values[0][0];
    if (!tableSql.includes('PreSale Review') || !tableSql.includes('Sale Review') || !tableSql.includes('Accepted')) {
      console.log('Updating requests table CHECK constraint...');

      db.run("BEGIN TRANSACTION");

      // 1. Rename old table
      db.run("ALTER TABLE requests RENAME TO requests_old_constraint");

      // 2. Create new table with correct constraint
      db.run(`
        CREATE TABLE requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          lead_id INTEGER NOT NULL,
          created_by INTEGER NOT NULL,
          project_name TEXT,
          status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'Pending Review', 'Reviewing', 'Rejected', 'Pending Estimation', 'Estimated', 'PreSale Review', 'Sale Review', 'Accepted', 'Contract')),
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
          project_stage TEXT,
          intro_call_link TEXT,
          call_summary TEXT,
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
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id),
          FOREIGN KEY (estimate_id) REFERENCES estimates(id),
          FOREIGN KEY (assigned_presale) REFERENCES users(id),
          FOREIGN KEY (assigned_techlead) REFERENCES users(id)
        )
      `);

      // 3. Copy data
      db.run(`
        INSERT INTO requests (
          id, lead_id, created_by, project_name, status, cooperation_model, work_type, tech_stack,
          hourly_rate, budget, timeframe, deadline, start_date, team_need, english_level, meetings,
          project_stage, intro_call_link, call_summary, presentation_link, business_idea, job_description,
          design_link, project_overview, rejection_reason, estimate_id, assigned_presale, assigned_techlead,
          created_at, updated_at
        )
        SELECT 
          id, lead_id, created_by, project_name, status, cooperation_model, work_type, tech_stack,
          hourly_rate, budget, timeframe, deadline, start_date, team_need, english_level, meetings,
          project_stage, intro_call_link, call_summary, presentation_link, business_idea, job_description,
          design_link, project_overview, rejection_reason, estimate_id, assigned_presale, assigned_techlead,
          created_at, updated_at
        FROM requests_old_constraint
      `);

      // 4. Drop old table
      db.run("DROP TABLE requests_old_constraint");

      db.run("COMMIT");
      saveDb();
      console.log('✓ Successfully updated requests table CHECK constraint and kept all data');
    }
  } catch (err) {
    console.log('Migration note (requests constraint):', err.message);
    try { db.run("ROLLBACK"); } catch (e) { }
  }

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
export const insertEstimate = (name, createdBy, data, projectId = null, requestId = null, editHistory = '[]') => {
  db.run(
    'INSERT INTO estimates (name, created_by, data, project_id, request_id, edit_history) VALUES (?, ?, ?, ?, ?, ?)',
    [name, createdBy, data, projectId, requestId, editHistory]
  );
  saveDb();

  // Get the newly inserted row by finding max id for this user
  const result = queryOne(
    'SELECT * FROM estimates WHERE created_by = ? ORDER BY id DESC LIMIT 1',
    [createdBy]
  );
  return result;
};

// Lead helpers (simplified)
export const insertLead = (leadData) => {
  const { created_by, client_name, company, timezone, source } = leadData;

  db.run(
    `INSERT INTO leads (created_by, client_name, company, timezone, source, status)
     VALUES (?, ?, ?, ?, ?, 'New')`,
    [created_by, client_name, company, timezone, source]
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
    SELECT leads.*, users.name as creator_name,
           (SELECT COUNT(*) FROM requests WHERE requests.lead_id = leads.id) as request_count
    FROM leads
    LEFT JOIN users ON leads.created_by = users.id
    ORDER BY leads.created_at DESC
  `);
};

export const getLeadsByCreator = (userId) => {
  return queryAll(`
    SELECT leads.*, users.name as creator_name,
           (SELECT COUNT(*) FROM requests WHERE requests.lead_id = leads.id) as request_count
    FROM leads
    LEFT JOIN users ON leads.created_by = users.id
    WHERE leads.created_by = ?
    ORDER BY leads.created_at DESC
  `, [userId]);
};

// Request helpers
export const insertRequest = (requestData) => {
  const {
    lead_id, created_by, project_name, cooperation_model, work_type, tech_stack,
    hourly_rate, budget, timeframe, deadline, start_date, team_need,
    english_level, meetings, project_stage, intro_call_link, call_summary,
    presentation_link, business_idea, job_description, design_link
  } = requestData;

  db.run(
    `INSERT INTO requests (
      lead_id, created_by, project_name, cooperation_model, work_type, tech_stack,
      hourly_rate, budget, timeframe, deadline, start_date, team_need,
      english_level, meetings, project_stage, intro_call_link, call_summary,
      presentation_link, business_idea, job_description, design_link, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
    [
      lead_id, created_by, project_name, cooperation_model, work_type, tech_stack,
      hourly_rate, budget, timeframe, deadline, start_date, team_need,
      english_level, meetings, project_stage, intro_call_link, call_summary,
      presentation_link, business_idea, job_description, design_link
    ]
  );
  saveDb();

  // Update lead status to In Progress
  db.run(`UPDATE leads SET status = 'In Progress', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [lead_id]);
  saveDb();

  return queryOne('SELECT * FROM requests WHERE lead_id = ? ORDER BY id DESC LIMIT 1', [lead_id]);
};

export const updateRequest = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map(f => `${f} = ?`).join(', ');

  db.run(`UPDATE requests SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
  saveDb();

  return queryOne('SELECT * FROM requests WHERE id = ?', [id]);
};

export const getRequestWithDetails = (id) => {
  return queryOne(`
    SELECT requests.*, 
           leads.client_name, leads.company, leads.timezone, leads.source,
           creator.name as creator_name, creator.email as creator_email,
           presale.name as presale_name,
           techlead.name as techlead_name
    FROM requests
    LEFT JOIN leads ON requests.lead_id = leads.id
    LEFT JOIN users creator ON requests.created_by = creator.id
    LEFT JOIN users presale ON requests.assigned_presale = presale.id
    LEFT JOIN users techlead ON requests.assigned_techlead = techlead.id
    WHERE requests.id = ?
  `, [id]);
};

export const getRequestsByLead = (leadId) => {
  return queryAll(`
    SELECT requests.*, users.name as creator_name
    FROM requests
    LEFT JOIN users ON requests.created_by = users.id
    WHERE requests.lead_id = ?
    ORDER BY requests.created_at DESC
  `, [leadId]);
};

export const getAllRequests = () => {
  return queryAll(`
    SELECT requests.*, leads.client_name, leads.company, users.name as creator_name
    FROM requests
    LEFT JOIN leads ON requests.lead_id = leads.id
    LEFT JOIN users ON requests.created_by = users.id
    ORDER BY requests.created_at DESC
  `);
};

export const getRequestsByStatus = (status) => {
  return queryAll(`
    SELECT requests.*, leads.client_name, leads.company, users.name as creator_name
    FROM requests
    LEFT JOIN leads ON requests.lead_id = leads.id
    LEFT JOIN users ON requests.created_by = users.id
    WHERE requests.status = ?
    ORDER BY requests.created_at DESC
  `, [status]);
};

export const getRequestsByCreator = (userId) => {
  return queryAll(`
    SELECT requests.*, leads.client_name, leads.company, users.name as creator_name
    FROM requests
    LEFT JOIN leads ON requests.lead_id = leads.id
    LEFT JOIN users ON requests.created_by = users.id
    WHERE requests.created_by = ?
    ORDER BY requests.created_at DESC
  `, [userId]);
};

// Project helpers
export const insertProject = (leadId, requestId = null, name = null) => {
  db.run(
    'INSERT INTO projects (lead_id, request_id, name, changelog) VALUES (?, ?, ?, ?)',
    [leadId, requestId, name, JSON.stringify([{ date: new Date().toISOString(), action: 'Project created from request', user: 'System' }])]
  );
  saveDb();
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
           leads.client_name, leads.company, leads.timezone, leads.source,
           requests.cooperation_model, requests.work_type, requests.tech_stack,
           requests.hourly_rate, requests.budget, requests.timeframe, requests.deadline, requests.start_date,
           requests.team_need, requests.english_level, requests.meetings, requests.project_stage,
           requests.intro_call_link, requests.call_summary, requests.presentation_link, requests.business_idea,
           requests.job_description, requests.design_link, requests.project_overview, requests.estimate_id,
           sale.name as sale_name,
           presale.name as presale_name
    FROM projects
    LEFT JOIN users pm ON projects.assigned_pm = pm.id
    LEFT JOIN leads ON projects.lead_id = leads.id
    LEFT JOIN requests ON projects.request_id = requests.id
    LEFT JOIN users sale ON leads.created_by = sale.id
    LEFT JOIN users presale ON requests.assigned_presale = presale.id
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
