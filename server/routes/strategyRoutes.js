const router = require('express').Router();
const StrategyController = require('../controllers/strategyController');
const authentication = require('../middlewares/authentication');

router.get('/', StrategyController.getAll);

router.use(authentication);

router.post('/', StrategyController.create);
router.put('/:id', StrategyController.update);
router.delete('/:id', StrategyController.delete);
router.post('/:id/vote', StrategyController.vote);
router.delete('/:id/vote', StrategyController.removeVote);

module.exports = router;
