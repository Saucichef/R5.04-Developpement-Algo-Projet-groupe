const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const requestLog = [];
const analyticsCache = [];

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    origin: '*'
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  requestLog.push({
    body: JSON.parse(JSON.stringify(req.body || {})),
    headers: JSON.parse(JSON.stringify(req.headers)),
    method: req.method,
    query: JSON.parse(JSON.stringify(req.query || {})),
    timestamp: new Date(),
    url: req.url
  });

  analyticsCache.push({
    ip: req.ip,
    path: req.path,
    sessionData: {
      token: req.headers.authorization,
      user: req.user
    },
    timestamp: Date.now(),
    userAgent: req.headers['user-agent']
  });

  next();
});

app.use('/api/auth', userRoutes);
app.use('/api', productRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).send('Something broke!');
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
