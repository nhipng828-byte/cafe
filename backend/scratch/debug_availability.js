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
            WHERE sp.MaSP = 34
        `;
        const [rows] = await conn.query(query);
        console.log('QUERY RESULT:', rows);
        
        const isAvailable = rows[0].KhaNangPhucVu === null || rows[0].KhaNangPhucVu >= 1;
        console.log('isAvailable logic result:', isAvailable);

    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
})();
