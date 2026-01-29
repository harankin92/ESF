import express from 'express';
import { randomUUID } from 'crypto';
import { queryAll, queryOne, run, insertEstimate, setEstimateShareUuid } from '../db.js';
import { authenticateToken, canModifyEstimate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/estimates/:id/share - Generate share link
router.post('/:id/share', authenticateToken, canModifyEstimate, (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const existing = queryOne('SELECT * FROM estimates WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Estimate not found' });
        }

        // Check ownership
        if (role !== 'Admin' && existing.created_by !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Return existing UUID if present
        if (existing.share_uuid) {
            return res.json({ share_uuid: existing.share_uuid });
        }

        // Generate new UUID
        const uuid = randomUUID();
        setEstimateShareUuid(id, uuid);

        res.json({ share_uuid: uuid });
    } catch (error) {
        console.error('Share estimate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/estimates - List all estimates (filtered by role)
router.get('/', authenticateToken, (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let estimates;

        if (role === 'TechLead') {
            // TechLead sees only their own estimates
            estimates = queryAll(`
        SELECT e.*, u.name as creator_name, u.email as creator_email
        FROM estimates e
        JOIN users u ON e.created_by = u.id
        WHERE e.created_by = ?
        ORDER BY e.updated_at DESC
      `, [userId]);
        } else {
            // Admin, PreSale, PM see all estimates
            estimates = queryAll(`
        SELECT e.*, u.name as creator_name, u.email as creator_email
        FROM estimates e
        JOIN users u ON e.created_by = u.id
        ORDER BY e.updated_at DESC
      `);
        }

        // Parse JSON data for each estimate
        const parsed = estimates.map(e => ({
            ...e,
            data: JSON.parse(e.data)
        }));

        res.json(parsed);
    } catch (error) {
        console.error('List estimates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/estimates/:id - Get single estimate
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const estimate = queryOne(`
      SELECT e.*, u.name as creator_name, u.email as creator_email
      FROM estimates e
      JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [id]);

        if (!estimate) {
            return res.status(404).json({ error: 'Estimate not found' });
        }

        // TechLead can only view their own
        if (role === 'TechLead' && estimate.created_by !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({
            ...estimate,
            data: JSON.parse(estimate.data)
        });
    } catch (error) {
        console.error('Get estimate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/estimates - Create new estimate
router.post('/', authenticateToken, canModifyEstimate, (req, res) => {
    try {
        const { name, data } = req.body;
        const { id: userId } = req.user;

        if (!name || !data) {
            return res.status(400).json({ error: 'Name and data required' });
        }

        const estimate = insertEstimate(name, userId, JSON.stringify(data));

        if (!estimate) {
            return res.status(500).json({ error: 'Failed to create estimate' });
        }

        res.status(201).json({
            ...estimate,
            data: JSON.parse(estimate.data)
        });
    } catch (error) {
        console.error('Create estimate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/estimates/:id - Update estimate
router.put('/:id', authenticateToken, canModifyEstimate, (req, res) => {
    try {
        const { id } = req.params;
        const { name, data } = req.body;
        const { role, id: userId } = req.user;

        const existing = queryOne('SELECT * FROM estimates WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Estimate not found' });
        }

        // Check ownership for non-admin
        if (role !== 'Admin' && existing.created_by !== userId) {
            return res.status(403).json({ error: 'Can only modify your own estimates' });
        }

        run(`
      UPDATE estimates 
      SET name = ?, data = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [name || existing.name, JSON.stringify(data), id]);

        const updated = queryOne('SELECT * FROM estimates WHERE id = ?', [id]);
        res.json({
            ...updated,
            data: JSON.parse(updated.data)
        });
    } catch (error) {
        console.error('Update estimate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/estimates/:id - Delete estimate
router.delete('/:id', authenticateToken, canModifyEstimate, (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const existing = queryOne('SELECT * FROM estimates WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Estimate not found' });
        }

        // Check ownership for non-admin
        if (role !== 'Admin' && existing.created_by !== userId) {
            return res.status(403).json({ error: 'Can only delete your own estimates' });
        }

        run('DELETE FROM estimates WHERE id = ?', [id]);
        res.json({ message: 'Estimate deleted' });
    } catch (error) {
        console.error('Delete estimate error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
