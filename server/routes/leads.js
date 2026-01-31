import express from 'express';
import {
    queryOne, queryAll, insertLead, updateLead,
    getLeadWithCreator, getAllLeads, getLeadsByStatus, getLeadsByCreator,
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
            case 'PreSale':
                // PreSale sees all leads
                leads = getAllLeads();
                break;
            case 'TechLead':
                // TechLead sees leads with status 'Pending Estimation' or 'Estimated'
                leads = queryAll(`
          SELECT leads.*, users.name as creator_name
          FROM leads
          LEFT JOIN users ON leads.created_by = users.id
          WHERE leads.status IN ('Pending Estimation', 'Estimated')
          ORDER BY leads.created_at DESC
        `);
                break;
            case 'Admin':
                // Admin sees all
                leads = getAllLeads();
                break;
            case 'PM':
                // PM sees all (read-only)
                leads = getAllLeads();
                break;
            default:
                leads = [];
        }

        res.json(leads);
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});

// GET /api/leads/pending - Get leads pending estimation
router.get('/pending', authenticateToken, (req, res) => {
    try {
        const leads = getLeadsByStatus('Pending Estimation');
        res.json(leads);
    } catch (error) {
        console.error('Get pending leads error:', error);
        res.status(500).json({ error: 'Failed to fetch pending leads' });
    }
});

// POST /api/leads - Create lead (Sale only)
router.post('/', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const leadData = {
            created_by: req.user.id,
            client_name: req.body.client_name,
            cooperation_model: req.body.cooperation_model,
            work_type: req.body.work_type,
            tech_stack: req.body.tech_stack,
            hourly_rate: req.body.hourly_rate,
            budget: req.body.budget,
            timeframe: req.body.timeframe,
            deadline: req.body.deadline,
            start_date: req.body.start_date,
            team_need: req.body.team_need,
            english_level: req.body.english_level,
            meetings: req.body.meetings,
            timezone: req.body.timezone,
            project_stage: req.body.project_stage,
            intro_call_link: req.body.intro_call_link,
            presentation_link: req.body.presentation_link,
            business_idea: req.body.business_idea,
            job_description: req.body.job_description,
            design_link: req.body.design_link
        };

        if (!leadData.client_name) {
            return res.status(400).json({ error: 'Client name is required' });
        }

        const lead = insertLead(leadData);
        res.status(201).json(lead);
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ error: 'Failed to create lead' });
    }
});

// GET /api/leads/:id - Get single lead
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const lead = getLeadWithCreator(req.params.id);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        // If there's an estimate_id, get estimate details
        if (lead.estimate_id) {
            const estimate = queryOne(`
        SELECT estimates.*, users.name as creator_name
        FROM estimates
        LEFT JOIN users ON estimates.created_by = users.id
        WHERE estimates.id = ?
      `, [lead.estimate_id]);
            lead.estimate = estimate;
        }

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

        const { role, id: userId } = req.user;

        // Check permissions
        if (role === 'PM') {
            return res.status(403).json({ error: 'PM cannot modify leads' });
        }
        if (role === 'Sale' && lead.created_by !== userId) {
            return res.status(403).json({ error: 'Can only modify your own leads' });
        }

        const updates = {};
        const allowedFields = [
            'client_name', 'cooperation_model', 'work_type', 'tech_stack',
            'hourly_rate', 'budget', 'timeframe', 'deadline', 'start_date',
            'team_need', 'english_level', 'meetings', 'timezone', 'project_stage',
            'intro_call_link', 'presentation_link', 'business_idea',
            'job_description', 'design_link', 'status'
        ];

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

// PUT /api/leads/:id/overview - PreSale adds project overview
router.put('/:id/overview', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const lead = queryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const { project_overview } = req.body;
        if (!project_overview) {
            return res.status(400).json({ error: 'Project overview is required' });
        }

        const updated = updateLead(req.params.id, {
            project_overview,
            status: 'Pending Estimation',
            assigned_presale: req.user.id
        });

        res.json(updated);
    } catch (error) {
        console.error('Add overview error:', error);
        res.status(500).json({ error: 'Failed to add project overview' });
    }
});

// PUT /api/leads/:id/review - PreSale starts reviewing
router.put('/:id/review', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const lead = queryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const updated = updateLead(req.params.id, {
            status: 'Reviewing',
            assigned_presale: req.user.id
        });

        res.json(updated);
    } catch (error) {
        console.error('Review lead error:', error);
        res.status(500).json({ error: 'Failed to update lead status' });
    }
});

// PUT /api/leads/:id/approve - TechLead approves with estimate link
router.put('/:id/approve', authenticateToken, authorize('TechLead', 'Admin'), (req, res) => {
    try {
        const lead = queryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const { estimate_id } = req.body;
        if (!estimate_id) {
            return res.status(400).json({ error: 'Estimate ID is required' });
        }

        // Verify estimate exists
        const estimate = queryOne('SELECT * FROM estimates WHERE id = ?', [estimate_id]);
        if (!estimate) {
            return res.status(400).json({ error: 'Estimate not found' });
        }

        const updated = updateLead(req.params.id, {
            status: 'Estimated',
            estimate_id,
            assigned_techlead: req.user.id
        });

        res.json(updated);
    } catch (error) {
        console.error('Approve lead error:', error);
        res.status(500).json({ error: 'Failed to approve lead' });
    }
});

// DELETE /api/leads/:id - Delete lead
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const lead = queryOne('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (!lead) {
            return res.status(404).json({ error: 'Lead not found' });
        }

        const { role, id: userId } = req.user;

        // Check permissions
        if (role === 'PM') {
            return res.status(403).json({ error: 'PM cannot delete leads' });
        }
        if (role === 'Sale' && lead.created_by !== userId) {
            return res.status(403).json({ error: 'Can only delete your own leads' });
        }
        if (role !== 'Admin' && lead.status !== 'New') {
            return res.status(403).json({ error: 'Can only delete leads with New status' });
        }

        run('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.json({ message: 'Lead deleted' });
    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ error: 'Failed to delete lead' });
    }
});

export default router;
