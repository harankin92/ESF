import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import estimatesRoutes from './routes/estimates.js';
import publicRoutes from './routes/public.js';
import leadsRoutes from './routes/leads.js';
import projectsRoutes from './routes/projects.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimatesRoutes);
app.use('/api/shared', publicRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/projects', projectsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize database and start server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`
  🚀 ESF Server running on http://localhost:${PORT}
  
  API Endpoints:
  - POST /api/auth/login     - Login
  - GET  /api/auth/me        - Current user
  - GET  /api/estimates      - List estimates
  - POST /api/estimates      - Create estimate
  - GET  /api/estimates/:id  - Get estimate
  - PUT  /api/estimates/:id  - Update estimate
  - DELETE /api/estimates/:id - Delete estimate
  - POST /api/estimates/:id/share - Generate share link
  - GET  /api/shared/:uuid   - Get shared estimate (Public)
  
  Lead Endpoints:
  - GET  /api/leads          - List leads
  - POST /api/leads          - Create lead (Sale)
  - GET  /api/leads/:id      - Get lead
  - PUT  /api/leads/:id      - Update lead
  - PUT  /api/leads/:id/overview - Add project overview (PreSale)
  - PUT  /api/leads/:id/review   - Start reviewing (PreSale)
  - PUT  /api/leads/:id/approve  - Approve with estimate (TechLead)
  - PUT  /api/leads/:id/reject   - Reject lead (Sale)
  - PUT  /api/leads/:id/contract - Convert to contract (Sale)
  - DELETE /api/leads/:id    - Delete lead
  
  Project Endpoints:
  - GET  /api/projects       - List projects
  - GET  /api/projects/:id   - Get project details
  - PUT  /api/projects/:id   - Update project
  - PUT  /api/projects/:id/status - Change status
  - PUT  /api/projects/:id/credentials - Update credentials
  - PUT  /api/projects/:id/documentation - Update docs
  - PUT  /api/projects/:id/changelog - Add changelog entry
  - PUT  /api/projects/:id/invoices - Update invoices
  
  Test Users:
  - admin@test.com / admin123 (Admin)
  - presale@test.com / presale123 (PreSale)
  - techlead@test.com / techlead123 (TechLead)
  - pm@test.com / pm123 (PM)
  - sale@test.com / sale123 (Sale)
    `);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
