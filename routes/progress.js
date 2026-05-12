const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/progressController');

router.get('/', auth(['admin']), ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth(['candidate']), ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;
