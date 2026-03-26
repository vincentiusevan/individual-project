const router = require('express').Router();
const HeroController = require('../controllers/heroController');
const authentication = require('../middlewares/authentication');
const { adminOnly } = require('../middlewares/authorization');

// Public
router.get('/', HeroController.getAll);

// Admin only (harus sebelum /:id)
router.post('/sync', authentication, adminOnly, HeroController.syncFromAPI);

// Public detail & counters
router.get('/:id', HeroController.getById);
router.get('/:id/counters', HeroController.getCounters);

// Admin CRUD
router.post('/', authentication, adminOnly, HeroController.create);
router.put('/:id', authentication, adminOnly, HeroController.update);
router.delete('/:id', authentication, adminOnly, HeroController.delete);

module.exports = router;
