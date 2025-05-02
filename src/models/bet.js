async function initializeBetsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bets (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      trader VARCHAR(255) NOT NULL,
      week VARCHAR(10) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_name, week)
    )
  `);
}

module.exports = { initializeBetsTable };