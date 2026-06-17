const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/settingsController');

// Any authenticated role; the record is scoped to x-user-id inside the controller.
router.get('/', auth(['admin', 'company', 'candidate']), ctrl.get);
router.put('/', auth(['admin', 'company', 'candidate']), ctrl.update);

module.exports = router;
