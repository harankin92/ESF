import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import estimatesRoutes from './routes/estimates.js';
import publicRoutes from './routes/public.js';

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
  
  Test Users:
  - admin@test.com / admin123 (Admin)
  - presale@test.com / presale123 (PreSale)
  - techlead@test.com / techlead123 (TechLead)
  - pm@test.com / pm123 (PM)
    `);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
