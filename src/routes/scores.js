const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT user_name, score FROM scores ORDER BY score DESC');
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
};