const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_5j2FntCwxbuO@ep-restless-brook-aq3f65g2-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('Connected successfully');
    return client.query('SELECT 1');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });
