const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cafe_management'
  });

  try {
    const [rows] = await connection.query("SELECT * FROM ChiTietPhieuNhap ORDER BY MaPN DESC LIMIT 5");
    console.log('Last 5 Import Details:');
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

check();
