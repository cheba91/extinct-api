const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception: ', err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASS);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log('Error connecting to DB: ', err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('App running on', port.toString());
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection: ', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
