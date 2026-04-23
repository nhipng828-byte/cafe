const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'cafe_management'
    });

    try {
        const query = `
            SELECT sp.MaSP, sp.TenSP, 
            (
                SELECT MIN(CASE WHEN ct.DinhLuong = 0 THEN 1 ELSE nvl.SoLuongTon / ct.DinhLuong END)
                FROM CongThuc ct
                JOIN NguyenVatLieu nvl ON ct.MaNVL = nvl.MaNVL
                WHERE ct.MaSP = sp.MaSP
            ) as KhaNangPhucVu
            FROM SanPham sp
        `;
        const [rows] = await conn.query(query);
        const products = rows.map(p => ({
            MaSP: p.MaSP,
            TenSP: p.TenSP,
            KhaNang: p.KhaNangPhucVu,
            isAvailable: p.KhaNangPhucVu === null || p.KhaNangPhucVu >= 1
        }));
        console.log(JSON.stringify(products.filter(p => p.MaSP >= 28 && p.MaSP <= 38), null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
})();
