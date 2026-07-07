const router = require('express').Router();
const Analysis = require('../models/Analysis.model');
const authMiddleware = require('../middleware/auth.middleware');

// Get user history
router.get('/', authMiddleware, async (req, res) => {
    try {
        const history = await Analysis.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select('projectName overallScore grade totalCo2 createdAt files');
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching history' });
    }
});

// Get single analysis
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.userId });
        if (!analysis) return res.status(404).json({ message: 'Analysis not found' });
        res.json(analysis);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching analysis' });
    }
});

// Delete analysis
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting analysis' });
    }
});

module.exports = router;