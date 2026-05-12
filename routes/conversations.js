const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/conversationsController');

router.get('/', auth(['admin']), ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth(['candidate']), ctrl.create);
router.put('/:id', auth(['admin']), ctrl.update);
router.delete('/:id', auth(['admin']), ctrl.remove);

router.use('/:id/messages', require('./messages'));

module.exports = router;
