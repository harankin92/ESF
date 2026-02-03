import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import {
    insertEstimateRequest,
    getEstimateRequestsByProject,
    getPendingEstimateRequests,
    updateEstimateRequest,
    queryOne,
    queryAll,
    insertNotification
} from '../db.js';
import { sendNotificationToUser, sendNotificationToUsers } from '../socket.js';

const router = Router();

// GET /api/estimate-requests - List pending requests (for TechLead/Admin)
router.get('/', authenticateToken, authorize('TechLead', 'Admin', 'PM'), async (req, res) => {
    try {
        const requests = getPendingEstimateRequests();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/estimate-requests - Create request (PM)
router.post('/', authenticateToken, authorize('PM', 'Admin'), async (req, res) => {
    try {
        const { project_id, scope_description } = req.body;

        if (!project_id || !scope_description) {
            return res.status(400).json({ error: 'project_id and scope_description are required' });
        }

        const request = insertEstimateRequest(project_id, req.user.id, scope_description);

        // Notify Tech Leads and Admins
        const project = queryOne('SELECT name, client_name FROM projects WHERE id = ?', [project_id]);
        const projectName = project ? (project.name || project.client_name) : 'a project';
        const techLeads = queryAll("SELECT id FROM users WHERE role IN ('TechLead', 'Admin')");
        const notificationMessage = `New estimate request for "${projectName}" from ${req.user.name}`;

        techLeads.forEach(user => {
            insertNotification(user.id, 'status_change', 'estimate_request', request.id, notificationMessage);
            sendNotificationToUser(req.io, user.id, {
                type: 'status_change',
                message: notificationMessage,
                entityType: 'estimate_request',
                entityId: request.id,
                timestamp: new Date().toISOString()
            });
        });

        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/estimate-requests/:id/complete - Complete with estimate
router.put('/:id/complete', authenticateToken, authorize('TechLead', 'Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { estimate_id } = req.body;

        if (!estimate_id) {
            return res.status(400).json({ error: 'estimate_id is required' });
        }

        const existing = queryOne('SELECT * FROM estimate_requests WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const updated = updateEstimateRequest(id, {
            status: 'Pending Review',
            estimate_id: estimate_id
        });

        // Notify PM (requester)
        const project = queryOne(`
            SELECT p.name, p.client_name 
            FROM projects p 
            JOIN estimate_requests er ON p.id = er.project_id 
            WHERE er.id = ?
        `, [id]);
        const projectName = project ? (project.name || project.client_name) : 'your project';
        const notificationMessage = `Estimate ready for "${projectName}"`;

        insertNotification(existing.requested_by, 'status_change', 'estimate_request', id, notificationMessage);
        sendNotificationToUser(req.io, existing.requested_by, {
            type: 'status_change',
            message: notificationMessage,
            entityType: 'estimate_request',
            entityId: id,
            timestamp: new Date().toISOString()
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/estimate-requests/:id - Get specific request
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const request = queryOne(`
            SELECT er.*, u.name as requester_name, p.client_name, p.name as project_name
            FROM estimate_requests er
            JOIN users u ON er.requested_by = u.id
            JOIN projects p ON er.project_id = p.id
            WHERE er.id = ?
        `, [id]);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/estimate-requests/:id/status - Update status
router.put('/:id/status', authenticateToken, authorize('TechLead', 'Admin', 'PM'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        if (!['Pending', 'In Progress', 'Pending Review', 'Changes Requested', 'Approved', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = updateEstimateRequest(id, {
            status,
            rejection_reason: rejection_reason || null
        });

        // Notify Tech Lead (who performed the estimation)
        if (updated.estimate_id && (status === 'Approved' || status === 'Changes Requested')) {
            const estimate = queryOne('SELECT created_by FROM estimates WHERE id = ?', [updated.estimate_id]);
            if (estimate) {
                const project = queryOne(`
                    SELECT p.name, p.client_name 
                    FROM projects p 
                    JOIN estimate_requests er ON p.id = er.project_id 
                    WHERE er.id = ?
                `, [id]);
                const projectName = project ? (project.name || project.client_name) : 'a project';

                let notificationMessage = '';
                if (status === 'Approved') {
                    notificationMessage = `Estimate for "${projectName}" was approved by PM`;
                } else if (status === 'Changes Requested') {
                    notificationMessage = `PM requested changes for "${projectName}"${rejection_reason ? `: ${rejection_reason}` : ''}`;
                }

                insertNotification(estimate.created_by, 'status_change', 'estimate_request', id, notificationMessage);
                sendNotificationToUser(req.io, estimate.created_by, {
                    type: 'status_change',
                    message: notificationMessage,
                    entityType: 'estimate_request',
                    entityId: id,
                    timestamp: new Date().toISOString()
                });
            }
        }

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
