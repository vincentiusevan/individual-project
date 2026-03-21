const router = require('express').Router();
const AuthController = require('../controllers/authController');
const authentication = require('../middlewares/authentication');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google-login', AuthController.googleLogin);

// Protected routes
router.get('/user/profile', authentication, AuthController.getProfile);

module.exports = router;
