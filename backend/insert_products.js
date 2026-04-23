const mysql = require('mysql2/promise');
require('dotenv').config();

const products = [
  { MaSP: 'SP01', TenSP: 'Ca phe den da', DonGia: 50000 },
  { MaSP: 'SP02', TenSP: 'Ca phe den nong', DonGia: 50000 },
  { MaSP: 'SP03', TenSP: 'Ca phe nau da', DonGia: 55000 },
  { MaSP: 'SP04', TenSP: 'Ca phe nau nong', DonGia: 55000 },
  { MaSP: 'SP05', TenSP: 'Bac siu da', DonGia: 60000 },
  { MaSP: 'SP06', TenSP: 'Bac siu nong', DonGia: 60000 },
  { MaSP: 'SP07', TenSP: 'Ca phe cot dua', DonGia: 65000 },
  { MaSP: 'SP08', TenSP: 'Caramel trung ca phe', DonGia: 75000 },
  { MaSP: 'SP09', TenSP: 'Espresso da', DonGia: 50000 },
  { MaSP: 'SP10', TenSP: 'Espresso nong', DonGia: 50000 },
  { MaSP: 'SP11', TenSP: 'Americano da', DonGia: 55000 },
  { MaSP: 'SP12', TenSP: 'Americano nong', DonGia: 55000 },
  { MaSP: 'SP13', TenSP: 'Cappuccino da', DonGia: 65000 },
  { MaSP: 'SP14', TenSP: 'Cappuccino nong', DonGia: 65000 },
  { MaSP: 'SP15', TenSP: 'Latte da', DonGia: 65000 },
  { MaSP: 'SP16', TenSP: 'Latte nong', DonGia: 65000 },
  { MaSP: 'SP17', TenSP: 'Mocha da', DonGia: 70000 },
  { MaSP: 'SP18', TenSP: 'Mocha nong', DonGia: 70000 },
  { MaSP: 'SP19', TenSP: 'Salted Latte da', DonGia: 75000 },
  { MaSP: 'SP20', TenSP: 'Salted Latte nong', DonGia: 75000 },
  { MaSP: 'SP21', TenSP: 'Khoai lang tim coffee nut', DonGia: 80000 },
  { MaSP: 'SP22', TenSP: 'Quyt nha dam', DonGia: 65000 },
  { MaSP: 'SP23', TenSP: 'Dua hat chia', DonGia: 60000 },
  { MaSP: 'SP24', TenSP: 'Cu den chanh mat ong', DonGia: 60000 },
  { MaSP: 'SP25', TenSP: 'Dua xoai hat chia', DonGia: 70000 },
  { MaSP: 'SP26', TenSP: 'Sinh to bo xoai', DonGia: 75000 },
  { MaSP: 'SP27', TenSP: 'Sua chua bo hat chia', DonGia: 70000 },
  { MaSP: 'SP28', TenSP: 'Tra den macchiato', DonGia: 55000 },
  { MaSP: 'SP29', TenSP: 'Tra xoai macchiato', DonGia: 65000 },
  { MaSP: 'SP30', TenSP: 'Tra nhai oi hong', DonGia: 60000 },
  { MaSP: 'SP31', TenSP: 'Tra Olong vai phuc bon tu', DonGia: 70000 },
  { MaSP: 'SP32', TenSP: 'Tra quyt nha dam hat chia', DonGia: 70000 },
  { MaSP: 'SP33', TenSP: 'Tra xoai nong', DonGia: 60000 },
  { MaSP: 'SP34', TenSP: 'Tra hoa cuc tui loc', DonGia: 50000 },
  { MaSP: 'SP35', TenSP: 'Tra Earl Grey tui loc', DonGia: 50000 },
  { MaSP: 'SP36', TenSP: 'Chocolate nong', DonGia: 60000 },
  { MaSP: 'SP37', TenSP: 'Chocolate da', DonGia: 60000 },
  { MaSP: 'SP38', TenSP: 'Milkshake oi hong', DonGia: 75000 },
  { MaSP: 'SP39', TenSP: 'Milkshake xoai', DonGia: 75000 },
  { MaSP: 'SP40', TenSP: 'Milkshake phuc bon tu', DonGia: 75000 },
  { MaSP: 'SP41', TenSP: 'Kieu mach cot dua khoai lang tim', DonGia: 80000 },
  { MaSP: 'SP42', TenSP: 'Coldbrew', DonGia: 60000 },
  { MaSP: 'SP43', TenSP: 'Coldbrew sua tuoi', DonGia: 65000 },
  { MaSP: 'SP44', TenSP: 'Citrus Coldbrew', DonGia: 70000 }
];

async function insertProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Inserting products...');

  for (const p of products) {
    await connection.query('INSERT INTO SanPham (TenSP, DonGia) VALUES (?, ?)', [p.TenSP, p.DonGia]);
  }

  console.log('Done!');
  await connection.end();
}

insertProducts().catch(console.error);
