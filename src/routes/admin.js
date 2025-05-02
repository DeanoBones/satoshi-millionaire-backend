const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.post('/set-winner', async (req, res) => {
    const { winner, week, password } = req.body;
    // Password check only for login verification
    if (typeof password !== 'undefined' && password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!winner || !week) {
      return res.status(400).json({ error: 'Missing winner or week' });
    }
    try {
      const bets = await pool.query('SELECT user_name, trader FROM bets WHERE week = $1', [week]);
      const weekNumber = parseInt(week.split('-W')[1]);
      const multiplier = weekNumber >= 48 ? 3 : weekNumber >= 44 ? 2 : 1;

      for (const bet of bets.rows) {
        if (bet.trader === winner) {
          await pool.query(
            'UPDATE scores SET score = score + $1 WHERE user_name = $2',
            [multiplier, bet.user_name]
          );
        }
      }
      res.json({ message: 'Winner set and scores updated' });
    } catch (error) {
      console.error('Error setting winner:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};