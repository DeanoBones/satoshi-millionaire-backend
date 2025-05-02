const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.post('/', async (req, res) => {
    const { user_name, trader, week } = req.body;
    if (!user_name || !trader || !week) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      await pool.query(
        'INSERT INTO bets (user_name, trader, week) VALUES ($1, $2, $3) ON CONFLICT (user_name, week) DO UPDATE SET trader = $2',
        [user_name, trader, week]
      );
      await pool.query(
        'INSERT INTO scores (user_name, score) VALUES ($1, 0) ON CONFLICT (user_name) DO NOTHING',
        [user_name]
      );
      res.status(201).json({ message: 'Bet placed successfully' });
    } catch (error) {
      console.error('Error submitting bet:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};