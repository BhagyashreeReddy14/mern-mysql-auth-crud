const mysql2 = require('mysql2');

// Create a connection pool for better performance
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Promisify pool for async/await usage
const promisePool = pool.promise();

// Test the connection on startup
const testConnection = async () => {
  try {
    const conn = await promisePool.getConnection();
    console.log('✅ MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { promisePool, testConnection };
