require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const sequelize = require('./src/config/db');
require('./src/models'); // registers associations
const apiRoutes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);

app.use('/api', apiRoutes);

app.get('/', (req, res) => res.json({ message: 'Task Management Platform API' }));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    await sequelize.sync(); // creates/updates tables to match models
    console.log('Models synced.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}

module.exports = app;