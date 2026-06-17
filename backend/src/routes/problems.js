const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/problemsController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth(['admin', 'company']), ctrl.create);
router.put('/:id', auth(['admin', 'company']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;
