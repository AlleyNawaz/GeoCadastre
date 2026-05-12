const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

if (process.env.DATABASE_URL) {
  console.log('Connecting to database using DATABASE_URL');
} else {
  console.log(`Connecting to database using credentials (Host: ${process.env.DB_HOST}, DB: ${process.env.DB_NAME})`);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000, // 5 second timeout
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

module.exports = pool;