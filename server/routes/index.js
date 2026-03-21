const router = require('express').Router();
const authRoutes = require('./authRoutes');
const heroRoutes = require('./heroRoutes');
const itemRoutes = require('./itemRoutes');

router.use('/', authRoutes);
router.use('/heroes', heroRoutes);
router.use('/items', itemRoutes);

module.exports = router;
