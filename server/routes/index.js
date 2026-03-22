const router = require('express').Router();
const authRoutes = require('./authRoutes');
const heroRoutes = require('./heroRoutes');
const itemRoutes = require('./itemRoutes');
const aiRoutes = require('./aiRoutes');
const strategyRoutes = require('./strategyRoutes');

router.use('/', authRoutes);
router.use('/heroes', heroRoutes);
router.use('/items', itemRoutes);
router.use('/ai', aiRoutes);
router.use('/strategies', strategyRoutes);

module.exports = router;
