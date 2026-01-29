import express from 'express';
import { getEstimateByShareUuid } from '../db.js';

const router = express.Router();

// GET public shared estimate
router.get('/:uuid', (req, res) => {
    try {
        const { uuid } = req.params;
        const estimate = getEstimateByShareUuid(uuid);

        if (!estimate) {
            return res.status(404).json({ error: 'Estimate not found' });
        }

        // Return sanitized data (no created_by user ID if we want to hide it, but names are ok)
        // Parse data JSON
        try {
            estimate.data = JSON.parse(estimate.data);
        } catch (e) {
            estimate.data = {};
        }

        res.json(estimate);
    } catch (err) {
        console.error('Shared estimate error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
