require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const rateLimit = require('express-rate-limit');
const betRoutes = require('./routes/bets');
const scoreRoutes = require('./routes/scores');
const adminRoutes = require('./routes/admin');
const { initializeBetsTable } = require('./models/bet');
const { initializeScoresTable } = require('./models/score');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  await initializeBetsTable(pool);
  await initializeScoresTable(pool);
}
initializeDatabase();

app.use(cors());
app.use(express.json());

app.use('/api/bets', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per IP
}));

app.use('/api/bets', betRoutes(pool));
app.use('/api/scores', scoreRoutes(pool));
app.use('/api/admin', adminRoutes(pool));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});