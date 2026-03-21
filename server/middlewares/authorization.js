function adminOnly(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      throw { name: 'Forbidden', message: 'Admin access required' };
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { adminOnly };
