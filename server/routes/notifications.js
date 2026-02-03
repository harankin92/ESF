import express from 'express';
import {
    getNotificationsByUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount
} from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - Get user's notifications
router.get('/', authenticateToken, (req, res) => {
    try {
        const notifications = getNotificationsByUser(req.user.id);
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET /api/notifications/unread/count - Get unread count
router.get('/unread/count', authenticateToken, (req, res) => {
    try {
        const count = getUnreadNotificationCount(req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        const updated = markNotificationAsRead(notificationId);

        if (!updated) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(updated);
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticateToken, (req, res) => {
    try {
        markAllNotificationsAsRead(req.user.id);
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        deleteNotification(notificationId);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
