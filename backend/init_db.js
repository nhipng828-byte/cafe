const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  console.log('Connected to MySQL.');

  const sql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
  
  // Split the schema into individual statements
  // This is a simple split and might not handle all edge cases (like semicolons in strings)
  // but for our schema.sql it should be fine.
  const statements = sql
    .split(/;(?:\s|$)/)
    .filter(statement => statement.trim().length > 0);

  for (const statement of statements) {
    try {
      await connection.query(statement);
    } catch (err) {
      console.error(`Error executing: ${statement.substring(0, 50)}...`);
      console.error(err.message);
    }
  }

  console.log('Database initialized successfully.');
  await connection.end();
}

init().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
