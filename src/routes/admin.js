const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Verify password for admin login
  router.post('/verify-password', async (req, res) => {
    const { password } = req.body;
    if (typeof password === 'undefined' || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    console.log('Password verified successfully');
    res.json({ message: 'Password verified' });
  });

  // Set winner, no password check if password omitted
  router.post('/set-winner', async (req, res) => {
    const { winner, week, password } = req.body;
    console.log(`set-winner called: winner=${winner}, week=${week}, password=${password}`);

    // Require password only if provided
    if (typeof password !== 'undefined' && password !== process.env.ADMIN_PASSWORD) {
      console.log('Unauthorized: Invalid password');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!winner || !week) {
      console.log('Bad request: Missing winner or week');
      return res.status(400).json({ error: 'Missing winner or week' });
    }

    try {
      const bets = await pool.query('SELECT user_name, trader FROM bets WHERE week = $1', [week]);
      const weekNumber = parseInt(week.split('-W')[1]);
      const multiplier = weekNumber >= 48 ? 3 : weekNumber >= 44 ? 2 : 1;
      console.log(`Processing bets: ${bets.rows.length} bets found, multiplier=${multiplier}`);

      for (const bet of bets.rows) {
        if (bet.trader === winner) {
          console.log(`Updating score for user=${bet.user_name}, trader=${bet.trader}, points=${multiplier}`);
          await pool.query(
            'UPDATE scores SET score = score + $1 WHERE user_name = $2',
            [multiplier, bet.user_name]
          );
        }
      }
      console.log('Winner set and scores updated');
      res.json({ message: 'Winner set and scores updated', updatedBets: bets.rows });
    } catch (error) {
      console.error('Error setting winner:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};