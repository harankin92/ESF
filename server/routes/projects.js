import express from 'express';
import {
    queryOne, queryAll, insertProject, updateProject,
    getProjectWithDetails, getAllProjects, getProjectsByPM, getProjectByLeadId,
    getEstimateRequestsByProject, getEstimatesByProject
} from '../db.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/projects - List projects (filtered by role)
router.get('/', authenticateToken, (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let projects;

        switch (role) {
            case 'PM':
                // PM sees all projects (will filter by assigned in future)
                projects = getAllProjects();
                break;
            case 'Admin':
                // Admin sees all
                projects = getAllProjects();
                break;
            case 'Sale':
            case 'PreSale':
            case 'TechLead':
                // Other roles can view projects but limited
                projects = getAllProjects();
                break;
            default:
                projects = [];
        }

        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /api/projects/:id - Get single project with all details
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const project = getProjectWithDetails(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// PUT /api/projects/:id - Update project
router.put('/:id', authenticateToken, authorize('PM', 'Admin'), (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const updates = {};
        const allowedFields = ['assigned_pm', 'assigned_developers'];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const updated = updateProject(req.params.id, updates);
        res.json(updated);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// PUT /api/projects/:id/status - Change project status
router.put('/:id/status', authenticateToken, authorize('PM', 'Admin'), (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const { status } = req.body;
        const validStatuses = ['New', 'Active', 'Paused', 'Finished'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Add changelog entry
        let changelog = [];
        try {
            changelog = JSON.parse(project.changelog || '[]');
        } catch (e) {
            changelog = [];
        }
        changelog.push({
            date: new Date().toISOString(),
            action: `Status changed from ${project.status} to ${status}`,
            user: req.user.name
        });

        const updated = updateProject(req.params.id, {
            status,
            changelog: JSON.stringify(changelog)
        });
        res.json(updated);
    } catch (error) {
        console.error('Update project status error:', error);
        res.status(500).json({ error: 'Failed to update project status' });
    }
});

// PUT /api/projects/:id/credentials - Update credentials
router.put('/:id/credentials', authenticateToken, authorize('PM', 'Admin'), (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const { credentials } = req.body;

        // Add changelog entry
        let changelog = [];
        try {
            changelog = JSON.parse(project.changelog || '[]');
        } catch (e) {
            changelog = [];
        }
        changelog.push({
            date: new Date().toISOString(),
            action: 'Credentials updated',
            user: req.user.name
        });

        const updated = updateProject(req.params.id, {
            credentials: JSON.stringify(credentials),
            changelog: JSON.stringify(changelog)
        });
        res.json(updated);
    } catch (error) {
        console.error('Update credentials error:', error);
        res.status(500).json({ error: 'Failed to update credentials' });
    }
});

// PUT /api/projects/:id/documentation - Update documentation
router.put('/:id/documentation', authenticateToken, authorize('PM', 'Admin'), (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const { project_charter, documentation } = req.body;
        const updates = {};

        if (project_charter !== undefined) updates.project_charter = project_charter;
        if (documentation !== undefined) updates.documentation = JSON.stringify(documentation);

        // Add changelog entry
        let changelog = [];
        try {
            changelog = JSON.parse(project.changelog || '[]');
        } catch (e) {
            changelog = [];
        }
        changelog.push({
            date: new Date().toISOString(),
            action: 'Documentation updated',
            user: req.user.name
        });
        updates.changelog = JSON.stringify(changelog);

        const updated = updateProject(req.params.id, updates);
        res.json(updated);
    } catch (error) {
        console.error('Update documentation error:', error);
        res.status(500).json({ error: 'Failed to update documentation' });
    }
});

// PUT /api/projects/:id/changelog - Add changelog entry
router.put('/:id/changelog', authenticateToken, (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const { entry } = req.body;
        if (!entry) {
            return res.status(400).json({ error: 'Changelog entry is required' });
        }

        let changelog = [];
        try {
            changelog = JSON.parse(project.changelog || '[]');
        } catch (e) {
            changelog = [];
        }
        changelog.push({
            date: new Date().toISOString(),
            action: entry,
            user: req.user.name
        });

        const updated = updateProject(req.params.id, {
            changelog: JSON.stringify(changelog)
        });
        res.json(updated);
    } catch (error) {
        console.error('Add changelog error:', error);
        res.status(500).json({ error: 'Failed to add changelog entry' });
    }
});

// PUT /api/projects/:id/invoices - Update invoices
router.put('/:id/invoices', authenticateToken, authorize('PM', 'Admin'), (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const { invoices } = req.body;

        // Add changelog entry
        let changelog = [];
        try {
            changelog = JSON.parse(project.changelog || '[]');
        } catch (e) {
            changelog = [];
        }
        changelog.push({
            date: new Date().toISOString(),
            action: 'Invoices updated',
            user: req.user.name
        });

        const updated = updateProject(req.params.id, {
            invoices: JSON.stringify(invoices),
            changelog: JSON.stringify(changelog)
        });
        res.json(updated);
    } catch (error) {
        console.error('Update invoices error:', error);
        res.status(500).json({ error: 'Failed to update invoices' });
    }
});

// GET /api/projects/:id/estimates - List estimates linked to project
router.get('/:id/estimates', authenticateToken, (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const estimates = getEstimatesByProject(req.params.id);
        res.json(estimates);
    } catch (error) {
        console.error('Get project estimates error:', error);
        res.status(500).json({ error: 'Failed to fetch project estimates' });
    }
});

// GET /api/projects/:id/requests - List estimate requests for project
router.get('/:id/requests', authenticateToken, (req, res) => {
    try {
        const project = queryOne('SELECT * FROM projects WHERE id = ?', [req.params.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const requests = getEstimateRequestsByProject(req.params.id);
        res.json(requests);
    } catch (error) {
        console.error('Get project requests error:', error);
        res.status(500).json({ error: 'Failed to fetch project requests' });
    }
});

export default router;
