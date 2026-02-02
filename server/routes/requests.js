import express from 'express';
import {
    queryOne, queryAll, insertRequest, updateRequest,
    getRequestWithDetails, getRequestsByLead, getAllRequests, getRequestsByStatus, getRequestsByCreator,
    run, insertProject
} from '../db.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/requests - List requests (filtered by role)
router.get('/', authenticateToken, (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let requests;

        switch (role) {
            case 'Sale':
                // Sale sees only their own requests
                requests = getRequestsByCreator(userId);
                break;
            case 'PreSale':
                // PreSale sees requests in Pending Review, Reviewing, or assigned to them
                requests = queryAll(`
                    SELECT requests.*, leads.client_name, leads.company, users.name as creator_name
                    FROM requests
                    LEFT JOIN leads ON requests.lead_id = leads.id
                    LEFT JOIN users ON requests.created_by = users.id
                    WHERE requests.status IN ('Pending Review', 'Reviewing', 'Pending Estimation')
                       OR requests.assigned_presale = ?
                    ORDER BY requests.created_at DESC
                `, [userId]);
                break;
            case 'TechLead':
                // TechLead sees requests pending estimation or assigned to them
                requests = queryAll(`
                    SELECT requests.*, leads.client_name, leads.company, users.name as creator_name
                    FROM requests
                    LEFT JOIN leads ON requests.lead_id = leads.id
                    LEFT JOIN users ON requests.created_by = users.id
                    WHERE requests.status = 'Pending Estimation'
                       OR requests.assigned_techlead = ?
                    ORDER BY requests.created_at DESC
                `, [userId]);
                break;
            default:
                // Admin sees all
                requests = getAllRequests();
        }

        res.json(requests);
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// GET /api/requests/pending - Get requests pending estimation
router.get('/pending', authenticateToken, (req, res) => {
    try {
        const requests = getRequestsByStatus('Pending Estimation');
        res.json(requests);
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// GET /api/requests/by-lead/:leadId - Get requests for a specific lead
router.get('/by-lead/:leadId', authenticateToken, (req, res) => {
    try {
        const requests = getRequestsByLead(req.params.leadId);
        res.json(requests);
    } catch (error) {
        console.error('Get requests by lead error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// POST /api/requests - Create request (Sale only)
router.post('/', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        if (!req.body.lead_id) {
            return res.status(400).json({ error: 'Lead ID is required' });
        }

        const requestData = {
            lead_id: req.body.lead_id,
            created_by: req.user.id,
            project_name: req.body.project_name,
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
            project_stage: req.body.project_stage,
            intro_call_link: req.body.intro_call_link,
            call_summary: req.body.call_summary,
            presentation_link: req.body.presentation_link,
            business_idea: req.body.business_idea,
            job_description: req.body.job_description,
            design_link: req.body.design_link
        };

        const request = insertRequest(requestData);
        res.status(201).json(request);
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// GET /api/requests/:id - Get single request
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const request = getRequestWithDetails(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Attach estimate if exists
        if (request.estimate_id) {
            const estimate = queryOne('SELECT * FROM estimates WHERE id = ?', [request.estimate_id]);
            request.estimate = estimate;
        }

        res.json(request);
    } catch (error) {
        console.error('Get request error:', error);
        res.status(500).json({ error: 'Failed to fetch request' });
    }
});

// PUT /api/requests/:id - Update request
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Build update object from allowed fields
        const allowedFields = [
            'project_name', 'cooperation_model', 'work_type', 'tech_stack', 'hourly_rate', 'budget',
            'timeframe', 'deadline', 'start_date', 'team_need', 'english_level',
            'meetings', 'project_stage', 'intro_call_link', 'call_summary',
            'presentation_link', 'business_idea', 'job_description', 'design_link'
        ];

        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updated = updateRequest(req.params.id, updates);
        res.json(updated);
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// PUT /api/requests/:id/send-to-review - Sale sends to PreSale for review
router.put('/:id/send-to-review', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'New' && request.status !== 'Rejected') {
            return res.status(400).json({ error: 'Can only send New or Rejected requests to review' });
        }

        const updated = updateRequest(req.params.id, { status: 'Pending Review', rejection_reason: null });
        res.json(updated);
    } catch (error) {
        console.error('Send to review error:', error);
        res.status(500).json({ error: 'Failed to send request to review' });
    }
});

// PUT /api/requests/:id/overview - PreSale adds project overview
router.put('/:id/overview', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Reviewing') {
            return res.status(400).json({ error: 'Can only add overview to requests being reviewed' });
        }

        // Just save overview, don't change status yet
        const updated = updateRequest(req.params.id, {
            project_overview: req.body.project_overview
        });

        res.json(updated);
    } catch (error) {
        console.error('Add overview error:', error);
        res.status(500).json({ error: 'Failed to add project overview' });
    }
});

// PUT /api/requests/:id/review - PreSale starts reviewing
router.put('/:id/review', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const updated = updateRequest(req.params.id, {
            status: 'Reviewing',
            assigned_presale: req.user.id
        });

        res.json(updated);
    } catch (error) {
        console.error('Review request error:', error);
        res.status(500).json({ error: 'Failed to update request status' });
    }
});

// PUT /api/requests/:id/approve - TechLead approves with estimate link → sends to PreSale Review
router.put('/:id/approve', authenticateToken, authorize('TechLead', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Pending Estimation') {
            console.error(`Approve Request Failed: ID ${req.params.id}, Status '${request.status}' (Required: 'Pending Estimation')`);
            return res.status(400).json({ error: `Can only approve requests in Pending Estimation status (Current: ${request.status})` });
        }

        const { estimate_id } = req.body;
        console.log(`Approving request ${req.params.id} with estimate ${estimate_id}`);

        const updated = updateRequest(req.params.id, {
            status: 'PreSale Review',
            estimate_id: estimate_id || null,
            assigned_techlead: req.user.id
        });

        res.json(updated);
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ error: 'Failed to approve request: ' + error.message });
    }
});

// PUT /api/requests/:id/reject - Sale rejects request from Sale Review
router.put('/:id/reject', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Sale Review') {
            return res.status(400).json({ error: 'Can only reject requests in Sale Review status' });
        }

        const updated = updateRequest(req.params.id, {
            status: 'Rejected',
            rejection_reason: req.body.rejection_reason || 'Rejected by Sale'
        });

        res.json(updated);
    } catch (error) {
        console.error('Sale reject error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// PUT /api/requests/:id/presale-reject - PreSale rejects request (needs more info from Sale)
router.put('/:id/presale-reject', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Reviewing') {
            return res.status(400).json({ error: 'Can only reject requests being reviewed' });
        }

        const updated = updateRequest(req.params.id, {
            status: 'Rejected',
            rejection_reason: req.body.rejection_reason || 'Needs more information'
        });

        res.json(updated);
    } catch (error) {
        console.error('PreSale reject error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// PUT /api/requests/:id/send-to-estimation - PreSale sends to TechLead for estimation
router.put('/:id/send-to-estimation', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Reviewing') {
            return res.status(400).json({ error: 'Can only send Reviewing requests to estimation' });
        }

        if (!request.project_overview) {
            return res.status(400).json({ error: 'Project overview is required before sending to estimation' });
        }

        const updated = updateRequest(req.params.id, { status: 'Pending Estimation' });
        res.json(updated);
    } catch (error) {
        console.error('Send to estimation error:', error);
        res.status(500).json({ error: 'Failed to send to estimation' });
    }
});

// PUT /api/requests/:id/presale-approve - PreSale approves estimate → sends to Sale Review
router.put('/:id/presale-approve', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'PreSale Review') {
            return res.status(400).json({ error: 'Can only approve from PreSale Review status' });
        }

        const updated = updateRequest(req.params.id, { status: 'Sale Review' });
        res.json(updated);
    } catch (error) {
        console.error('PreSale approve error:', error);
        res.status(500).json({ error: 'Failed to approve' });
    }
});

// PUT /api/requests/:id/presale-reject-estimate - PreSale rejects estimate → back to TechLead
router.put('/:id/presale-reject-estimate', authenticateToken, authorize('PreSale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'PreSale Review') {
            return res.status(400).json({ error: 'Can only reject from PreSale Review status' });
        }

        const updated = updateRequest(req.params.id, {
            status: 'Pending Estimation',
            rejection_reason: req.body.rejection_reason || 'Estimate needs changes'
        });

        res.json(updated);
    } catch (error) {
        console.error('PreSale reject estimate error:', error);
        res.status(500).json({ error: 'Failed to reject estimate' });
    }
});

// PUT /api/requests/:id/sale-accept - Sale accepts final estimate
router.put('/:id/sale-accept', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Sale Review') {
            return res.status(400).json({ error: 'Can only accept from Sale Review status' });
        }

        const updated = updateRequest(req.params.id, { status: 'Accepted' });
        res.json(updated);
    } catch (error) {
        console.error('Sale accept error:', error);
        res.status(500).json({ error: 'Failed to accept' });
    }
});

// PUT /api/requests/:id/sale-request-edit - Sale requests changes → back to TechLead
router.put('/:id/sale-request-edit', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Sale Review') {
            return res.status(400).json({ error: 'Can only request edits from Sale Review status' });
        }

        const updated = updateRequest(req.params.id, {
            status: 'Pending Estimation',
            rejection_reason: req.body.rejection_reason || 'Changes requested by Sale'
        });

        res.json(updated);
    } catch (error) {
        console.error('Sale request edit error:', error);
        res.status(500).json({ error: 'Failed to request edit' });
    }
});

// PUT /api/requests/:id/reject - Sale rejects request entirely
router.put('/:id/reject', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const updated = updateRequest(req.params.id, {
            status: 'Rejected',
            rejection_reason: req.body.rejection_reason || null
        });

        res.json(updated);
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// PUT /api/requests/:id/contract - Sale converts request to contract (creates project)
router.put('/:id/contract', authenticateToken, authorize('Sale', 'Admin'), (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'Accepted' && request.status !== 'Estimated') {
            return res.status(400).json({ error: 'Can only convert Accepted or Estimated requests to contract' });
        }

        // Update request status
        const updated = updateRequest(req.params.id, { status: 'Contract' });

        // Create project from request
        const projectName = req.body.project_name || null;
        const project = insertProject(request.lead_id, request.id, projectName);

        res.json({ request: updated, project });
    } catch (error) {
        console.error('Convert to contract error:', error);
        res.status(500).json({ error: 'Failed to convert request to contract' });
    }
});

// DELETE /api/requests/:id - Delete request
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const request = queryOne('SELECT * FROM requests WHERE id = ?', [req.params.id]);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Only creator or Admin can delete
        if (request.created_by !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Not authorized to delete this request' });
        }

        // Don't allow deletion if converted to contract
        if (request.status === 'Contract') {
            return res.status(400).json({ error: 'Cannot delete request that has been converted to contract' });
        }

        run('DELETE FROM requests WHERE id = ?', [req.params.id]);

        res.json({ message: 'Request deleted' });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ error: 'Failed to delete request' });
    }
});

export default router;
