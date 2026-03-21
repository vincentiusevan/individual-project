const router = require('express').Router();
const AuthController = require('../controllers/authController');
const authentication = require('../middlewares/authentication');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google-login', AuthController.googleLogin);
router.get('/user/profile', authentication, AuthController.getProfile);

module.exports = router;
