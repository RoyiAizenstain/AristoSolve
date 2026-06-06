const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');

router.post('/login', ctrl.login);     // public
router.post('/logout', ctrl.logout);   // public, no-op

module.exports = router;
