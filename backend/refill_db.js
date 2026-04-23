const db = require('./config/db');

const products = [
  { code: 'SP01', name: 'Ca phe den da', price: 50000, category: 'Cà phê truyền thống' },
  { code: 'SP02', name: 'Ca phe den nong', price: 50000, category: 'Cà phê truyền thống' },
  { code: 'SP03', name: 'Ca phe nau da', price: 55000, category: 'Cà phê truyền thống' },
  { code: 'SP04', name: 'Ca phe nau nong', price: 55000, category: 'Cà phê truyền thống' },
  { code: 'SP05', name: 'Bac siu da', price: 60000, category: 'Cà phê truyền thống' },
  { code: 'SP06', name: 'Bac siu nong', price: 60000, category: 'Cà phê truyền thống' },
  { code: 'SP07', name: 'Ca phe cot dua', price: 65000, category: 'Cà phê truyền thống' },
  { code: 'SP08', name: 'Caramel trung ca phe', price: 75000, category: 'Cà phê truyền thống' },
  { code: 'SP09', name: 'Espresso da', price: 50000, category: 'Cà phê máy' },
  { code: 'SP10', name: 'Espresso nong', price: 50000, category: 'Cà phê máy' },
  { code: 'SP11', name: 'Americano da', price: 55000, category: 'Cà phê máy' },
  { code: 'SP12', name: 'Americano nong', price: 55000, category: 'Cà phê máy' },
  { code: 'SP13', name: 'Cappuccino da', price: 65000, category: 'Cà phê máy' },
  { code: 'SP14', name: 'Cappuccino nong', price: 65000, category: 'Cà phê máy' },
  { code: 'SP15', name: 'Latte da', price: 65000, category: 'Cà phê máy' },
  { code: 'SP16', name: 'Latte nong', price: 65000, category: 'Cà phê máy' },
  { code: 'SP17', name: 'Mocha da', price: 70000, category: 'Cà phê máy' },
  { code: 'SP18', name: 'Mocha nong', price: 70000, category: 'Cà phê máy' },
  { code: 'SP19', name: 'Salted Latte da', price: 75000, category: 'Cà phê máy' },
  { code: 'SP20', name: 'Salted Latte nong', price: 75000, category: 'Cà phê máy' },
  { code: 'SP21', name: 'Khoai lang tim coffee nut', price: 80000, category: 'Non-coffee' },
  { code: 'SP22', name: 'Quyt nha dam', price: 65000, category: 'Nước ép & sinh tố' },
  { code: 'SP23', name: 'Dua hat chia', price: 60000, category: 'Nước ép & sinh tố' },
  { code: 'SP24', name: 'Cu den chanh mat ong', price: 60000, category: 'Nước ép & sinh tố' },
  { code: 'SP25', name: 'Dua xoai hat chia', price: 70000, category: 'Nước ép & sinh tố' },
  { code: 'SP26', name: 'Sinh to bo xoai', price: 75000, category: 'Nước ép & sinh tố' },
  { code: 'SP27', name: 'Sua chua bo hat chia', price: 70000, category: 'Nước ép & sinh tố' },
  { code: 'SP28', name: 'Tra den macchiato', price: 55000, category: 'Trà lạnh' },
  { code: 'SP29', name: 'Tra xoai macchiato', price: 65000, category: 'Trà lạnh' },
  { code: 'SP30', name: 'Tra nhai oi hong', price: 60000, category: 'Trà lạnh' },
  { code: 'SP31', name: 'Tra Olong vai phuc bon tu', price: 70000, category: 'Trà lạnh' },
  { code: 'SP32', name: 'Tra quyt nha dam hat chia', price: 70000, category: 'Trà lạnh' },
  { code: 'SP33', name: 'Tra xoai nong', price: 60000, category: 'Trà nóng' },
  { code: 'SP34', name: 'Tra hoa cuc tui loc', price: 50000, category: 'Trà nóng' },
  { code: 'SP35', name: 'Tra Earl Grey tui loc', price: 50000, category: 'Trà nóng' },
  { code: 'SP36', name: 'Chocolate nong', price: 60000, category: 'Non-coffee' },
  { code: 'SP37', name: 'Chocolate da', price: 60000, category: 'Non-coffee' },
  { code: 'SP38', name: 'Milkshake oi hong', price: 75000, category: 'Non-coffee' },
  { code: 'SP39', name: 'Milkshake xoai', price: 75000, category: 'Non-coffee' },
  { code: 'SP40', name: 'Milkshake phuc bon tu', price: 75000, category: 'Non-coffee' },
  { code: 'SP41', name: 'Kieu mach cot dua khoai lang tim', price: 80000, category: 'Non-coffee' },
  { code: 'SP42', name: 'Coldbrew', price: 60000, category: 'Coldbrew' },
  { code: 'SP43', name: 'Coldbrew sua tuoi', price: 65000, category: 'Coldbrew' },
  { code: 'SP44', name: 'Citrus Coldbrew', price: 70000, category: 'Coldbrew' }
];

async function reloadData() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Disable foreign key checks temporarily to truncate
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE CongThuc');
        await connection.query('TRUNCATE TABLE ChiTietHoaDon');
        await connection.query('TRUNCATE TABLE SanPham');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        for (const p of products) {
            await connection.query(
                'INSERT INTO SanPham (MaCode, TenSP, DonGia, Nhom, TrangThai) VALUES (?, ?, ?, ?, "Active")',
                [p.code, p.name, p.price, p.category]
            );
        }

        await connection.commit();
        console.log('Database refilled with 44 products');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

reloadData();
