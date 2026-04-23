const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cafe_management'
  });

  try {
    console.log('Adding columns to ChiTietPhieuNhap...');
    await connection.query("ALTER TABLE ChiTietPhieuNhap ADD COLUMN DonViNhap VARCHAR(50)");
    await connection.query("ALTER TABLE ChiTietPhieuNhap ADD COLUMN QuyDoi DECIMAL(15,3) DEFAULT 1.000");
    console.log('Done.');
  } catch (err) {
    console.error(err.message);
  } finally {
    await connection.end();
  }
}

run();
