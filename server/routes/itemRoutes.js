const router = require('express').Router();
const ItemController = require('../controllers/itemController');
const authentication = require('../middlewares/authentication');
const { adminOnly } = require('../middlewares/authorization');

// Public
router.get('/', ItemController.getAll);
router.get('/:id', ItemController.getById);

// Admin only
router.post('/', authentication, adminOnly, ItemController.create);
router.put('/:id', authentication, adminOnly, ItemController.update);
router.delete('/:id', authentication, adminOnly, ItemController.delete);

module.exports = router;
