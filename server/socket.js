import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Store connected users: userId -> socket.id
const connectedUsers = new Map();

export const initializeWebSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            socket.userName = decoded.name;
            next();
        } catch (err) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        console.log(`✓ User connected: ${socket.userName} (ID: ${socket.userId})`);

        // Store the connection
        connectedUsers.set(socket.userId, socket.id);

        // Send initial connection confirmation
        socket.emit('connected', {
            message: 'Connected to notifications server',
            userId: socket.userId
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`✗ User disconnected: ${socket.userName} (ID: ${socket.userId})`);
            connectedUsers.delete(socket.userId);
        });

        // Optional: Handle client-side ping for connection health
        socket.on('ping', () => {
            socket.emit('pong');
        });
    });

    return io;
};

// Helper function to send notification to a specific user
export const sendNotificationToUser = (io, userId, notification) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit('notification', notification);
        console.log(`✓ Sent notification to user ${userId}`);
        return true;
    } else {
        console.log(`✗ User ${userId} not connected`);
        return false;
    }
};

// Helper function to send notification to multiple users
export const sendNotificationToUsers = (io, userIds, notification) => {
    let sentCount = 0;
    for (const userId of userIds) {
        if (sendNotificationToUser(io, userId, notification)) {
            sentCount++;
        }
    }
    return sentCount;
};

// Export connectedUsers for debugging
export const getConnectedUsers = () => Array.from(connectedUsers.keys());
