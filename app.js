const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const animalRouter = require('./routes/animalRoutes');

const app = express();

// GLOBAL middleware //

// Security http headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit req from the same api
const limiter = rateLimit({
  max: 50,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests',
});
app.use('/api', limiter);

// Body parser, reading data from req.body
app.use(express.json({ limit: '10kb' }));
//Cookie parser
app.use(cookieParser());

// Data sanitization against noSQL & XSS
app.use(mongoSanitize()); //removes $ and .
app.use(xss()); // converts html tags

//Prevent parameter pollution: removes double values + whitelist some
app.use(
  hpp({
    whitelist: ['number'],
  })
);

// Test middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   // console.log(req.headers);
//   next();
// });

// Routes
app.use('/api/v1/animal', animalRouter);

// Catch all unhandlerd requests:
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on server. Please go to /api/v1/animal`,
      404
    )
  );
});

// Error handling
app.use(globalErrorHandler);
module.exports = app;
