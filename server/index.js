import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import estimatesRoutes from './routes/estimates.js';
import publicRoutes from './routes/public.js';
import leadsRoutes from './routes/leads.js';
import requestsRoutes from './routes/requests.js';
import projectsRoutes from './routes/projects.js';
import estimateRequestsRoutes from './routes/estimate-requests.js';

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
app.use('/api/requests', requestsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/estimate-requests', estimateRequestsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize database and start server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`
  🚀 ESF Server running on http://localhost:${PORT}
  
  Lead Endpoints (basic client info):
  - GET  /api/leads          - List leads
  - POST /api/leads          - Create lead (Sale)
  - GET  /api/leads/:id      - Get lead with requests
  - PUT  /api/leads/:id      - Update lead
  - DELETE /api/leads/:id    - Delete lead
  
  Request Endpoints (project details, 1 Lead -> N Requests):
  - GET  /api/requests          - List requests
  - POST /api/requests          - Create request (Sale)
  - GET  /api/requests/:id      - Get request
  - PUT  /api/requests/:id      - Update request
  - GET  /api/requests/by-lead/:leadId - Get requests for lead
  - PUT  /api/requests/:id/send-to-review - Send to PreSale (Sale)
  - PUT  /api/requests/:id/review   - Start reviewing (PreSale)
  - PUT  /api/requests/:id/overview - Add overview (PreSale)
  - PUT  /api/requests/:id/approve  - Approve (TechLead)
  - PUT  /api/requests/:id/reject   - Reject (Sale)
  - PUT  /api/requests/:id/contract - Convert to project (Sale)
  - DELETE /api/requests/:id    - Delete request
  
  Project Endpoints:
  - GET  /api/projects       - List projects
  - GET  /api/projects/:id   - Get project details
  - PUT  /api/projects/:id   - Update project
  
  Estimate Endpoints:
  - GET  /api/estimates      - List estimates
  - POST /api/estimates      - Create estimate
  - GET  /api/estimates/:id  - Get estimate
  - PUT  /api/estimates/:id  - Update estimate
  - DELETE /api/estimates/:id - Delete estimate
  
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
