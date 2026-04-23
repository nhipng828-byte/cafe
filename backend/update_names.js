const mysql = require('mysql2/promise');
require('dotenv').config();

const products = [
  { Old: 'Ca phe den da', New: 'Cà phê đen đá' },
  { Old: 'Ca phe den nong', New: 'Cà phê đen nóng' },
  { Old: 'Ca phe nau da', New: 'Cà phê nâu đá' },
  { Old: 'Ca phe nau nong', New: 'Cà phê nâu nóng' },
  { Old: 'Bac siu da', New: 'Bạc xỉu đá' },
  { Old: 'Bac siu nong', New: 'Bạc xỉu nóng' },
  { Old: 'Ca phe cot dua', New: 'Cà phê cốt dừa' },
  { Old: 'Caramel trung ca phe', New: 'Caramel trứng cà phê' },
  { Old: 'Espresso da', New: 'Espresso đá' },
  { Old: 'Espresso nong', New: 'Espresso nóng' },
  { Old: 'Americano da', New: 'Americano đá' },
  { Old: 'Americano nong', New: 'Americano nóng' },
  { Old: 'Cappuccino da', New: 'Cappuccino đá' },
  { Old: 'Cappuccino nong', New: 'Cappuccino nóng' },
  { Old: 'Latte da', New: 'Latte đá' },
  { Old: 'Latte nong', New: 'Latte nóng' },
  { Old: 'Mocha da', New: 'Mocha đá' },
  { Old: 'Mocha nong', New: 'Mocha nóng' },
  { Old: 'Salted Latte da', New: 'Salted Latte đá' },
  { Old: 'Salted Latte nong', New: 'Salted Latte nóng' },
  { Old: 'Khoai lang tim coffee nut', New: 'Khoai lang tím coffee nut' },
  { Old: 'Quyt nha dam', New: 'Quýt nha đam' },
  { Old: 'Dua hat chia', New: 'Dừa hạt chia' },
  { Old: 'Cu den chanh mat ong', New: 'Củ dền chanh mật ong' },
  { Old: 'Dua xoai hat chia', New: 'Dừa xoài hạt chia' },
  { Old: 'Sinh to bo xoai', New: 'Sinh tố bơ xoài' },
  { Old: 'Sua chua bo hat chia', New: 'Sữa chua bơ hạt chia' },
  { Old: 'Tra den macchiato', New: 'Trà đen macchiato' },
  { Old: 'Tra xoai macchiato', New: 'Trà xoài macchiato' },
  { Old: 'Tra nhai oi hong', New: 'Trà nhài ổi hồng' },
  { Old: 'Tra Olong vai phuc bon tu', New: 'Trà Olong vải phúc bồn tử' },
  { Old: 'Tra quyt nha dam hat chia', New: 'Trà quýt nha đam hạt chia' },
  { Old: 'Tra xoai nong', New: 'Trà xoài nóng' },
  { Old: 'Tra hoa cuc tui loc', New: 'Trà hoa cúc túi lọc' },
  { Old: 'Tra Earl Grey tui loc', New: 'Trà Earl Grey túi lọc' },
  { Old: 'Chocolate nong', New: 'Chocolate nóng' },
  { Old: 'Chocolate da', New: 'Chocolate đá' },
  { Old: 'Milkshake oi hong', New: 'Milkshake ổi hồng' },
  { Old: 'Milkshake xoai', New: 'Milkshake xoài' },
  { Old: 'Milkshake phuc bon tu', New: 'Milkshake phúc bồn tử' },
  { Old: 'Kieu mach cot dua khoai lang tim', New: 'Kiều mạch cốt dừa khoai lang tím' },
  { Old: 'Coldbrew', New: 'Coldbrew' },
  { Old: 'Coldbrew sua tuoi', New: 'Coldbrew sữa tươi' },
  { Old: 'Citrus Coldbrew', New: 'Citrus Coldbrew' }
];

async function updateNames() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Updating product names...');

  for (const p of products) {
    await connection.query('UPDATE SanPham SET TenSP = ? WHERE TenSP = ?', [p.New, p.Old]);
  }

  console.log('Done!');
  await connection.end();
}

updateNames().catch(console.error);
