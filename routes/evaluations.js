const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/evaluationsController');

router.get('/', auth(['admin', 'company']), ctrl.getAll);
router.get('/:id', auth(['admin', 'company', 'candidate']), ctrl.getById);
router.post('/', auth(['admin']), ctrl.create);
router.put('/:id', auth(['admin']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;
