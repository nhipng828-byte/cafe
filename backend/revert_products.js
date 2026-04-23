const db = require('./config/db');

const originalProducts = [
  { MaSP: 1, TenSP: 'Cà phê đen đá', DonGia: 50000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 2, TenSP: 'Cà phê đen nóng', DonGia: 50000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 3, TenSP: 'Cà phê nâu đá', DonGia: 55000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 4, TenSP: 'Cà phê nâu nóng', DonGia: 55000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 5, TenSP: 'Bạc xỉu đá', DonGia: 60000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 6, TenSP: 'Bạc xỉu nóng', DonGia: 60000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 7, TenSP: 'Cà phê cốt dừa', DonGia: 65000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 8, TenSP: 'Caramel trứng cà phê', DonGia: 75000, Nhom: 'Cà phê truyền thống' },
  { MaSP: 9, TenSP: 'Espresso đá', DonGia: 50000, Nhom: 'Cà phê máy' },
  { MaSP: 10, TenSP: 'Espresso nóng', DonGia: 50000, Nhom: 'Cà phê máy' },
  { MaSP: 11, TenSP: 'Americano đá', DonGia: 55000, Nhom: 'Cà phê máy' },
  { MaSP: 12, TenSP: 'Americano nóng', DonGia: 55000, Nhom: 'Cà phê máy' },
  { MaSP: 13, TenSP: 'Cappuccino đá', DonGia: 65000, Nhom: 'Cà phê máy' },
  { MaSP: 14, TenSP: 'Cappuccino nóng', DonGia: 65000, Nhom: 'Cà phê máy' },
  { MaSP: 15, TenSP: 'Latte đá', DonGia: 65000, Nhom: 'Cà phê máy' },
  { MaSP: 16, TenSP: 'Latte nóng', DonGia: 65000, Nhom: 'Cà phê máy' },
  { MaSP: 17, TenSP: 'Mocha đá', DonGia: 70000, Nhom: 'Cà phê máy' },
  { MaSP: 18, TenSP: 'Mocha nóng', DonGia: 70000, Nhom: 'Cà phê máy' },
  { MaSP: 19, TenSP: 'Salted Latte đá', DonGia: 75000, Nhom: 'Cà phê máy' },
  { MaSP: 20, TenSP: 'Salted Latte nóng', DonGia: 75000, Nhom: 'Cà phê máy' },
  { MaSP: 21, TenSP: 'Khoai lang tím coffee nut', DonGia: 80000, Nhom: 'Non-coffee' },
  { MaSP: 22, TenSP: 'Quýt nha đam', DonGia: 65000, Nhom: 'Nước ép & sinh tố' },
  { MaSP: 23, TenSP: 'Dừa hạt chia', DonGia: 60000, Nhom: 'Nước ép & sinh tố' },
  { MaSP: 24, TenSP: 'Củ dền chanh mật ong', DonGia: 60000, Nhom: 'Nước ép & sinh tố' },
  { MaSP: 25, TenSP: 'Dừa xoài hạt chia', DonGia: 70000, Nhom: 'Nước ép & sinh tố' },
  { MaSP: 26, TenSP: 'Sinh tố bơ xoài', DonGia: 75000, Nhom: 'Nước ép & sinh tố' },
  { MaSP: 27, TenSP: 'Sữa chua bơ hạt chia', DonGia: 70000, Nhom: 'Nước ép & sinh tố' },
  { MaSP: 28, TenSP: 'Trà đen macchiato', DonGia: 55000, Nhom: 'Trà lạnh' },
  { MaSP: 29, TenSP: 'Trà xoài macchiato', DonGia: 65000, Nhom: 'Trà lạnh' },
  { MaSP: 30, TenSP: 'Trà nhài ổi hồng', DonGia: 60000, Nhom: 'Trà lạnh' },
  { MaSP: 31, TenSP: 'Trà Olong vải phúc bồn tử', DonGia: 70000, Nhom: 'Trà lạnh' },
  { MaSP: 32, TenSP: 'Trà quýt nha đam hạt chia', DonGia: 70000, Nhom: 'Trà lạnh' },
  { MaSP: 33, TenSP: 'Trà xoài nóng', DonGia: 60000, Nhom: 'Trà nóng' },
  { MaSP: 34, TenSP: 'Trà hoa cúc túi lọc', DonGia: 50000, Nhom: 'Trà nóng' },
  { MaSP: 35, TenSP: 'Trà Earl Grey túi lọc', DonGia: 50000, Nhom: 'Trà nóng' },
  { MaSP: 36, TenSP: 'Chocolate nóng', DonGia: 60000, Nhom: 'Non-coffee' },
  { MaSP: 37, TenSP: 'Chocolate đá', DonGia: 60000, Nhom: 'Non-coffee' },
  { MaSP: 38, TenSP: 'Milkshake ổi hồng', DonGia: 75000, Nhom: 'Non-coffee' },
  { MaSP: 39, TenSP: 'Milkshake xoài', DonGia: 75000, Nhom: 'Non-coffee' },
  { MaSP: 40, TenSP: 'Milkshake phúc bồn tử', DonGia: 75000, Nhom: 'Non-coffee' },
  { MaSP: 41, TenSP: 'Kiều mạch cốt dừa khoai lang tím', DonGia: 80000, Nhom: 'Non-coffee' },
  { MaSP: 42, TenSP: 'Coldbrew', DonGia: 60000, Nhom: 'Coldbrew' },
  { MaSP: 43, TenSP: 'Coldbrew sữa tươi', DonGia: 65000, Nhom: 'Coldbrew' },
  { MaSP: 44, TenSP: 'Citrus Coldbrew', DonGia: 70000, Nhom: 'Coldbrew' }
];

async function revert() {
    try {
        for (const p of originalProducts) {
            await db.query('UPDATE SanPham SET TenSP = ?, MaCode = NULL WHERE MaSP = ?', [p.TenSP, p.MaSP]);
        }
        console.log('Reverted to accented names and removed MaCode');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

revert();
