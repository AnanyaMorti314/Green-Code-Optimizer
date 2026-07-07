const router = require('express').Router();
const analysisCtrl = require('../controllers/analysis.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/upload', authMiddleware, upload.single('codeFile'), analysisCtrl.analyzeCode);

module.exports = router;