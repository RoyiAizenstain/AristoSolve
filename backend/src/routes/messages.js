const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const ctrl = require('../controllers/messagesController');

router.get('/', ctrl.getAll);
router.post('/', auth(['admin', 'candidate']), ctrl.create);
router.put('/:msgId', auth(['admin']), ctrl.update);
router.delete('/:msgId', auth(['admin']), ctrl.remove);

module.exports = router;
