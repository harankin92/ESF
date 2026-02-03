import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initDb } from './db.js';
import { initializeWebSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import estimatesRoutes from './routes/estimates.js';
import publicRoutes from './routes/public.js';
import leadsRoutes from './routes/leads.js';
import requestsRoutes from './routes/requests.js';
import projectsRoutes from './routes/projects.js';
import estimateRequestsRoutes from './routes/estimate-requests.js';
import commentsRoutes from './routes/comments.js';
import notificationsRoutes from './routes/notifications.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize WebSocket
export const io = initializeWebSocket(httpServer);

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/estimates', estimatesRoutes);
app.use('/api/shared', publicRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/estimate-requests', estimateRequestsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize database and start server
const startServer = async () => {
    try {
        console.log('🔄 Initializing database...');
        await initDb();
        console.log('✅ Database initialized successfully.');

        httpServer.listen(PORT, () => {
            console.log(`
  🚀 ESF Server running on http://localhost:${PORT}
  🔌 WebSocket ready for real-time notifications
  🌍 CORS allowed for all origins in production
  `);
        });
    } catch (error) {
        console.error('❌ FATAL ERROR DURING STARTUP:');
        console.error(error);
        process.exit(1);
    }
};

startServer();
