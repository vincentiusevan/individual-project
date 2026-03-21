function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Internal Server Error';

  switch (err.name) {
    case 'SequelizeValidationError':
    case 'SequelizeUniqueConstraintError':
      status = 400;
      message = err.errors.map((e) => e.message);
      break;
    case 'BadRequest':
      status = 400;
      message = err.message;
      break;
    case 'Unauthorized':
    case 'JsonWebTokenError':
      status = 401;
      message = err.message || 'Invalid token';
      break;
    case 'Forbidden':
      status = 403;
      message = err.message || 'Forbidden access';
      break;
    case 'NotFound':
      status = 404;
      message = err.message || 'Data not found';
      break;
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;
