const router = require('express').Router();
const AIController = require('../controllers/aiController');
const authentication = require('../middlewares/authentication');

router.post('/counter-strategy', authentication, AIController.getCounterStrategy);

module.exports = router;
