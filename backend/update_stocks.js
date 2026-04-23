const mysql = require('mysql2/promise');
require('dotenv').config();

const materials = [
  { MaNVL: 1, TenNVL: 'Cà phê máy', SoLuongTon: 1000, DonGiaTrungBinh: 225 },
  { MaNVL: 2, TenNVL: 'Cà phê Coldbrew', SoLuongTon: 1000, DonGiaTrungBinh: 250 },
  { MaNVL: 3, TenNVL: 'Cà phê phin', SoLuongTon: 1000, DonGiaTrungBinh: 150 },
  { MaNVL: 4, TenNVL: 'Trà nhài', SoLuongTon: 600, DonGiaTrungBinh: 500 },
  { MaNVL: 5, TenNVL: 'Trà alishan', SoLuongTon: 50, DonGiaTrungBinh: 9000 },
  { MaNVL: 6, TenNVL: 'Trà đen hoa trân', SoLuongTon: 600, DonGiaTrungBinh: 102 },
  { MaNVL: 7, TenNVL: 'Trà Earl Grey', SoLuongTon: 20, DonGiaTrungBinh: 2100 },
  { MaNVL: 8, TenNVL: 'Trà hoa cúc', SoLuongTon: 20, DonGiaTrungBinh: 2750 },
  { MaNVL: 9, TenNVL: 'Shott xoài', SoLuongTon: 1500, DonGiaTrungBinh: 217 },
  { MaNVL: 10, TenNVL: 'Shott tahitian', SoLuongTon: 1000, DonGiaTrungBinh: 260 },
  { MaNVL: 11, TenNVL: 'Shott bưởi hồng', SoLuongTon: 1000, DonGiaTrungBinh: 260 },
  { MaNVL: 12, TenNVL: 'Shott ổi hồng', SoLuongTon: 1000, DonGiaTrungBinh: 260 },
  { MaNVL: 13, TenNVL: 'Shott vải', SoLuongTon: 1000, DonGiaTrungBinh: 260 },
  { MaNVL: 14, TenNVL: 'Shott hazelnut', SoLuongTon: 1000, DonGiaTrungBinh: 260 },
  { MaNVL: 15, TenNVL: 'Hạt chia', SoLuongTon: 500, DonGiaTrungBinh: 210 },
  { MaNVL: 16, TenNVL: 'Bột kiều mạch khoai lang tím', SoLuongTon: 500, DonGiaTrungBinh: 560 },
  { MaNVL: 17, TenNVL: 'Andros phúc bồn tử', SoLuongTon: 1000, DonGiaTrungBinh: 196 },
  { MaNVL: 18, TenNVL: 'Sauce Chocolate Davinci', SoLuongTon: 2000, DonGiaTrungBinh: 180 },
  { MaNVL: 19, TenNVL: 'Sauce Caramel Davinci', SoLuongTon: 2000, DonGiaTrungBinh: 180 },
  { MaNVL: 20, TenNVL: 'Bột cacao', SoLuongTon: 500, DonGiaTrungBinh: 148 },
  { MaNVL: 21, TenNVL: 'Richs', SoLuongTon: 454, DonGiaTrungBinh: 55 },
  { MaNVL: 22, TenNVL: 'Base', SoLuongTon: 907, DonGiaTrungBinh: 67 },
  { MaNVL: 23, TenNVL: 'Sữa tươi Auspride', SoLuongTon: 1000, DonGiaTrungBinh: 29 },
  { MaNVL: 24, TenNVL: 'Vải lon', SoLuongTon: 230, DonGiaTrungBinh: 187 },
  { MaNVL: 25, TenNVL: 'Bột cheese luave', SoLuongTon: 500, DonGiaTrungBinh: 210 },
  { MaNVL: 26, TenNVL: 'Quýt', SoLuongTon: 1000, DonGiaTrungBinh: 40 },
  { MaNVL: 27, TenNVL: 'Dứa', SoLuongTon: 1, DonGiaTrungBinh: 14000 },
  { MaNVL: 28, TenNVL: 'Củ dền', SoLuongTon: 1000, DonGiaTrungBinh: 30 },
  { MaNVL: 29, TenNVL: 'Chanh', SoLuongTon: 1000, DonGiaTrungBinh: 30 },
  { MaNVL: 30, TenNVL: 'Xoài', SoLuongTon: 1000, DonGiaTrungBinh: 50 },
  { MaNVL: 31, TenNVL: 'Bơ', SoLuongTon: 1000, DonGiaTrungBinh: 80 },
  { MaNVL: 32, TenNVL: 'Lá húng', SoLuongTon: 100, DonGiaTrungBinh: 50 },
  { MaNVL: 33, TenNVL: 'Sữa đặc', SoLuongTon: 1284, DonGiaTrungBinh: 45 },
  { MaNVL: 34, TenNVL: 'Sữa chua', SoLuongTon: 100, DonGiaTrungBinh: 50 },
  { MaNVL: 35, TenNVL: 'Đường', SoLuongTon: 1000, DonGiaTrungBinh: 18 },
  { MaNVL: 36, TenNVL: 'Đường que', SoLuongTon: 50, DonGiaTrungBinh: 600 },
  { MaNVL: 37, TenNVL: 'Cốt dừa', SoLuongTon: 400, DonGiaTrungBinh: 63 },
  { MaNVL: 38, TenNVL: 'Mật ong', SoLuongTon: 600, DonGiaTrungBinh: 58 },
  { MaNVL: 39, TenNVL: 'Bột jelly con cá', SoLuongTon: 10, DonGiaTrungBinh: 600 },
  { MaNVL: 40, TenNVL: 'Nha đam', SoLuongTon: 1000, DonGiaTrungBinh: 58 },
  { MaNVL: 41, TenNVL: 'Trân châu trắng', SoLuongTon: 2000, DonGiaTrungBinh: 79 },
  { MaNVL: 42, TenNVL: 'Cam sấy khô', SoLuongTon: 1000, DonGiaTrungBinh: 300 },
  { MaNVL: 43, TenNVL: 'Dứa sấy khô', SoLuongTon: 1000, DonGiaTrungBinh: 300 },
  { MaNVL: 44, TenNVL: 'Trứng gà', SoLuongTon: 10, DonGiaTrungBinh: 3000 },
  { MaNVL: 45, TenNVL: 'Muối', SoLuongTon: 100, DonGiaTrungBinh: 50 },
  { MaNVL: 46, TenNVL: 'Khô heo', SoLuongTon: 1000, DonGiaTrungBinh: 185 },
  { MaNVL: 47, TenNVL: 'Khô gà', SoLuongTon: 1000, DonGiaTrungBinh: 170 }
];

async function updateStocks() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Updating material stocks...');

  for (const m of materials) {
    await connection.query('UPDATE NguyenVatLieu SET SoLuongTon = ? WHERE TenNVL = ?', [m.SoLuongTon, m.TenNVL]);
  }

  console.log('Done!');
  await connection.end();
}

updateStocks().catch(console.error);
