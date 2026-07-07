const router = require('express').Router();
const authCtrl = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/profile', authMiddleware, authCtrl.getProfile);

module.exports = router;