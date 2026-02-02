import express from 'express';
import {
    queryOne, queryAll, insertLead, updateLead,
    getLeadWithCreator, getAllLeads, getLeadsByCreator, getRequestsByLead,
    run
} from '../db.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leads - List leads (filtered by role)
router.get('/', authenticateToken, (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let leads;

        switch (role) {
            case 'Sale':
                // Sale sees only their own leads
                leads = getLeadsByCreator(userId);
                break;
            default:
                // Admin, PreSale, TechLead, PM see all leads
                leads = getAllLeads();
        }

        res.json(leads);
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// POST /api/leads - Create lead (Sale only)
router.post('/', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        if (!req.body.client_name) {
            return res.status(400).json({ error: 'Client name is required' });
        }

        const leadData = {
            created_by: req.user.id,
            client_name: req.body.client_name,
            company: req.body.company || null,
            timezone: req.body.timezone || null,
            source: req.body.source || null
        };

        const lead = insertLead(leadData);
        res.status(201).json(lead);
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// GET /api/leads/:id - Get single lead with requests
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const lead = getLeadWithCreator(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Attach requests
        lead.requests = getRequestsByLead(req.params.id);

        res.json(lead);
    } catch (error) {
        console.error('Get lead error:', error);
        res.status(500).json({ error: 'Failed to fetch lead' });
    }
});

// PUT /api/leads/:id - Update lead
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const lead = queryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Only creator or Admin can update
        if (lead.created_by !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to update this lead' });
        }

        // Build update object from allowed fields
        const allowedFields = ['client_name', 'company', 'timezone', 'source', 'status'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updated = updateLead(req.params.id, updates);
        res.json(updated);
    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const lead = queryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // Only creator or Admin can delete
        if (lead.created_by !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to delete this lead' });
        }

        // Check if lead has projects
        const projects = queryOne('SELECT COUNT(*) as count FROM projects WHERE lead_id = ?', [req.params.id]);
        if (projects && projects.count > 0) {
            return res.status(400).json({ error: 'Cannot delete lead with active projects' });
        }

        // Delete associated requests first
        run('DELETE FROM requests WHERE lead_id = ?', [req.params.id]);
        // Delete lead
        run('DELETE FROM leads WHERE id = ?', [req.params.id]);

        res.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

export default router;
