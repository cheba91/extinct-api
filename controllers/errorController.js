const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field value: ${value[0]} Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

// If in development enviroment
const sendErrorDev = (err, req, res) => {
  // on API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // It's not API, render err on page
  console.error('ERROR', err);
  return res.status(err.statusCode).json({
    title: 'Something went wrong',
    msg: err.message,
  });
};

// If in production enviroment
const sendErrorProd = (err, req, res) => {
  // on API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // Programming or other unknown error: don't leak error details
    // Log error // can notify admin here
    console.error('ERROR', err);
    // Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Please try again later.',
    });
  }
  // It's not API, render err on page
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unknown error: don't leak error details
  //Log error // can notify admin here
  console.error('ERROR', err);

  // Send generic message
  return res.status(err.statusCode).json({
    status: err.status,
    message: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  // Default vals
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // Send res
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }
  if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
