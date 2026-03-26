const { User } = require('../models');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const user = await User.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw { name: 'BadRequest', message: 'Email and password are required' };
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: 'Unauthorized', message: 'Invalid email or password' };
      }

      const isValid = comparePassword(password, user.password);
      if (!isValid) {
        throw { name: 'Unauthorized', message: 'Invalid email or password' };
      }

      const token = signToken({ id: user.id });

      res.status(200).json({
        access_token: token,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      next(err);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        throw { name: 'BadRequest', message: 'Google token is required' };
      }

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const [user, created] = await User.findOrCreate({
        where: { email: payload.email },
        defaults: {
          username: payload.name,
          email: payload.email,
          password: hashPassword(String(Math.random())),
          role: 'user',
          googleId: payload.sub,
          avatarUrl: payload.picture,
        },
        hooks: false,
      });

      const token = signToken({ id: user.id });

      res.status(created ? 201 : 200).json({
        access_token: token,
        username: user.username,
        email: user.email,
        role: user.role,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw { name: 'NotFound', message: 'User not found' };
      }

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
