const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw { name: 'Unauthorized', message: 'Invalid token' };
    }

    const token = authorization.split(' ')[1];
    const payload = verifyToken(token);

    const user = await User.findByPk(payload.id);
    if (!user) {
      throw { name: 'Unauthorized', message: 'Invalid token' };
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authentication;
