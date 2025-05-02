async function initializeScoresTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      user_name VARCHAR(255) PRIMARY KEY,
      score INTEGER DEFAULT 0
    )
  `);
}

module.exports = { initializeScoresTable };