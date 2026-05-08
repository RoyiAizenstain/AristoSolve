const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/usersController');

router.get('/', auth(['admin']), ctrl.getAll);
router.get('/:id', ctrl.getById);       // own check handled in controller
router.post('/', ctrl.create);          // public
router.put('/:id', ctrl.update);        // own check handled in controller
router.delete('/:id', auth(['admin']), ctrl.remove);

module.exports = router;
