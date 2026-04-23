const mysql = require('mysql2/promise');
require('dotenv').config();

const materials = [
  { MaNVL: 1, TenNVL: 'Cà phê máy', DonViTinh: 'gr', DonGiaTrungBinh: 225 },
  { MaNVL: 2, TenNVL: 'Cà phê Coldbrew', DonViTinh: 'gr', DonGiaTrungBinh: 250 },
  { MaNVL: 3, TenNVL: 'Cà phê phin', DonViTinh: 'gr', DonGiaTrungBinh: 150 },
  { MaNVL: 4, TenNVL: 'Trà nhài', DonViTinh: 'gr', DonGiaTrungBinh: 500 },
  { MaNVL: 5, TenNVL: 'Trà alishan', DonViTinh: 'túi', DonGiaTrungBinh: 9000 },
  { MaNVL: 6, TenNVL: 'Trà đen hoa trân', DonViTinh: 'gr', DonGiaTrungBinh: 102 },
  { MaNVL: 7, TenNVL: 'Trà Earl Grey', DonViTinh: 'túi', DonGiaTrungBinh: 2100 },
  { MaNVL: 8, TenNVL: 'Trà hoa cúc', DonViTinh: 'túi', DonGiaTrungBinh: 2750 },
  { MaNVL: 9, TenNVL: 'Shott xoài', DonViTinh: 'ml', DonGiaTrungBinh: 217 },
  { MaNVL: 10, TenNVL: 'Shott tahitian', DonViTinh: 'ml', DonGiaTrungBinh: 260 },
  { MaNVL: 11, TenNVL: 'Shott bưởi hồng', DonViTinh: 'ml', DonGiaTrungBinh: 260 },
  { MaNVL: 12, TenNVL: 'Shott ổi hồng', DonViTinh: 'ml', DonGiaTrungBinh: 260 },
  { MaNVL: 13, TenNVL: 'Shott vải', DonViTinh: 'ml', DonGiaTrungBinh: 260 },
  { MaNVL: 14, TenNVL: 'Shott hazelnut', DonViTinh: 'ml', DonGiaTrungBinh: 260 },
  { MaNVL: 15, TenNVL: 'Hạt chia', DonViTinh: 'gr', DonGiaTrungBinh: 210 },
  { MaNVL: 16, TenNVL: 'Bột kiều mạch khoai lang tím', DonViTinh: 'gr', DonGiaTrungBinh: 560 },
  { MaNVL: 17, TenNVL: 'Andros phúc bồn tử', DonViTinh: 'gr', DonGiaTrungBinh: 196 },
  { MaNVL: 18, TenNVL: 'Sauce Chocolate Davinci', DonViTinh: 'ml', DonGiaTrungBinh: 180 },
  { MaNVL: 19, TenNVL: 'Sauce Caramel Davinci', DonViTinh: 'ml', DonGiaTrungBinh: 180 },
  { MaNVL: 20, TenNVL: 'Bột cacao', DonViTinh: 'gr', DonGiaTrungBinh: 148 },
  { MaNVL: 21, TenNVL: 'Richs', DonViTinh: 'gr', DonGiaTrungBinh: 55 },
  { MaNVL: 22, TenNVL: 'Base', DonViTinh: 'gr', DonGiaTrungBinh: 67 },
  { MaNVL: 23, TenNVL: 'Sữa tươi Auspride', DonViTinh: 'ml', DonGiaTrungBinh: 29 },
  { MaNVL: 24, TenNVL: 'Vải lon', DonViTinh: 'gr', DonGiaTrungBinh: 187 },
  { MaNVL: 25, TenNVL: 'Bột cheese luave', DonViTinh: 'gr', DonGiaTrungBinh: 210 },
  { MaNVL: 26, TenNVL: 'Quýt', DonViTinh: 'gr', DonGiaTrungBinh: 40 },
  { MaNVL: 27, TenNVL: 'Dứa', DonViTinh: 'quả', DonGiaTrungBinh: 14000 },
  { MaNVL: 28, TenNVL: 'Củ dền', DonViTinh: 'gr', DonGiaTrungBinh: 30 },
  { MaNVL: 29, TenNVL: 'Chanh', DonViTinh: 'gr', DonGiaTrungBinh: 30 },
  { MaNVL: 30, TenNVL: 'Xoài', DonViTinh: 'gr', DonGiaTrungBinh: 50 },
  { MaNVL: 31, TenNVL: 'Bơ', DonViTinh: 'gr', DonGiaTrungBinh: 80 },
  { MaNVL: 32, TenNVL: 'Lá húng', DonViTinh: 'gr', DonGiaTrungBinh: 50 },
  { MaNVL: 33, TenNVL: 'Sữa đặc', DonViTinh: 'gr', DonGiaTrungBinh: 45 },
  { MaNVL: 34, TenNVL: 'Sữa chua', DonViTinh: 'ml', DonGiaTrungBinh: 50 },
  { MaNVL: 35, TenNVL: 'Đường', DonViTinh: 'gr', DonGiaTrungBinh: 18 },
  { MaNVL: 36, TenNVL: 'Đường que', DonViTinh: 'que', DonGiaTrungBinh: 600 },
  { MaNVL: 37, TenNVL: 'Cốt dừa', DonViTinh: 'ml', DonGiaTrungBinh: 63 },
  { MaNVL: 38, TenNVL: 'Mật ong', DonViTinh: 'ml', DonGiaTrungBinh: 58 },
  { MaNVL: 39, TenNVL: 'Bột jelly con cá', DonViTinh: 'gr', DonGiaTrungBinh: 600 },
  { MaNVL: 40, TenNVL: 'Nha đam', DonViTinh: 'gr', DonGiaTrungBinh: 58 },
  { MaNVL: 41, TenNVL: 'Trân châu trắng', DonViTinh: 'gr', DonGiaTrungBinh: 79 },
  { MaNVL: 42, TenNVL: 'Cam sấy khô', DonViTinh: 'gr', DonGiaTrungBinh: 300 },
  { MaNVL: 43, TenNVL: 'Dứa sấy khô', DonViTinh: 'gr', DonGiaTrungBinh: 300 },
  { MaNVL: 44, TenNVL: 'Trứng gà', DonViTinh: 'quả', DonGiaTrungBinh: 3000 },
  { MaNVL: 45, TenNVL: 'Muối', DonViTinh: 'gr', DonGiaTrungBinh: 50 },
  { MaNVL: 46, TenNVL: 'Khô heo', DonViTinh: 'gr', DonGiaTrungBinh: 185 },
  { MaNVL: 47, TenNVL: 'Khô gà', DonViTinh: 'gr', DonGiaTrungBinh: 170 }
];

async function insertMaterials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('Inserting materials...');

  for (const m of materials) {
    await connection.query('INSERT INTO NguyenVatLieu (TenNVL, DonViTinh, SoLuongTon, DonGiaTrungBinh) VALUES (?, ?, ?, ?)', [m.TenNVL, m.DonViTinh, 0, m.DonGiaTrungBinh]);
  }

  console.log('Done!');
  await connection.end();
}

insertMaterials().catch(console.error);
