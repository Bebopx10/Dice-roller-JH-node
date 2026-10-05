const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all real API endpoints
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve static files (the required API test page lives in /static)
app.use(express.static(path.join(__dirname, 'static')));

// ========== REST APIs for the Dice Roller ==========

// Wake-up endpoint – called asynchronously by the static website
app.get('/api/wakeup', (req, res) => {
  res.json({
    status: 'awake',
    message: 'Node.js server is running',
    timestamp: new Date().toISOString()
  });
});

// Single random number
app.get('/api/random', (req, res) => {
  const min = parseInt(req.query.min, 10) || 1;
  const max = parseInt(req.query.max, 10) || 6;

  if (isNaN(min) || isNaN(max) || min > max) {
    return res.status(400).json({ error: 'Invalid min/max parameters' });
  }

  const value = Math.floor(Math.random() * (max - min + 1)) + min;
  res.json({ value, min, max });
});

// Roll a single die
app.get('/api/roll/:sides', (req, res) => {
  const sides = parseInt(req.params.sides, 10);
  if (isNaN(sides) || sides < 2) {
    return res.status(400).json({ error: 'sides must be an integer >= 2' });
  }
  const value = Math.floor(Math.random() * sides) + 1;
  res.json({ value, sides });
});

// Roll multiple dice
app.get('/api/roll-many', (req, res) => {
  const sides = parseInt(req.query.sides, 10) || 6;
  const count = Math.min(parseInt(req.query.count, 10) || 1, 20);

  if (isNaN(sides) || sides < 2) {
    return res.status(400).json({ error: 'sides must be >= 2' });
  }

  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }

  res.json({
    sides,
    count,
    rolls,
    total: rolls.reduce((a, b) => a + b, 0)
  });
});

// ========== Intentionally broken CORS endpoint (for demonstration) ==========
app.get('/api/no-cors-random', (req, res) => {
  // Deliberately do NOT set CORS headers
  const min = parseInt(req.query.min, 10) || 1;
  const max = parseInt(req.query.max, 10) || 6;
  const value = Math.floor(Math.random() * (max - min + 1)) + min;

  res.json({
    value,
    min,
    max,
    note: 'This endpoint intentionally has no CORS headers'
  });
});

// Health check / root also works as a wake-up
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback – serve the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dice API listening on port ${PORT}`);
});
