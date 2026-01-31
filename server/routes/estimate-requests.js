import { Router } from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import {
    insertEstimateRequest,
    getEstimateRequestsByProject,
    getPendingEstimateRequests,
    updateEstimateRequest,
    queryOne
} from '../db.js';

const router = Router();

// GET /api/estimate-requests - List pending requests (for TechLead/Admin)
router.get('/', authenticateToken, authorize('TechLead', 'Admin'), async (req, res) => {
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
            status: 'Completed',
            estimate_id: estimate_id
        });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/estimate-requests/:id/status - Update status
router.put('/:id/status', authenticateToken, authorize('TechLead', 'Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Pending', 'In Progress', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updated = updateEstimateRequest(id, { status });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
