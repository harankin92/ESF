import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

const SOCKET_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const NotificationsProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        // If no user, disconnect existing socket and return
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: true
        });

        newSocket.on('connect', () => {
            console.log('✓ WebSocket connected');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('✗ WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connected', (data) => {
            console.log('✓ Received connection confirmation:', data);
        });

        // Listen for incoming notifications
        newSocket.on('notification', (notification) => {
            console.log('📬 New notification:', notification);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('ESF Notification', {
                    body: notification.message,
                    icon: '/logo.png'
                });
            }
        });

        setSocket(newSocket);

        // Fetch initial notifications
        fetchNotifications();
        fetchUnreadCount();

        return () => {
            newSocket.close();
        };
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await api.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const data = await api.getUnreadCount();
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            const wasUnread = notifications.find(n => n.id === id)?.read === false;
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    const value = {
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: fetchNotifications,
        requestNotificationPermission
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationsProvider');
    }
    return context;
};
