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
        // 1. Reset stock of NVL #48 to 0
        await conn.query('UPDATE NguyenVatLieu SET SoLuongTon = 0 WHERE MaNVL = 48');
        console.log('Stock reset to 0.');

        // 2. Perform an export of 1 unit
        console.log('Performing export of 1 unit...');
        const [result] = await conn.query(
            'UPDATE NguyenVatLieu SET SoLuongTon = GREATEST(0, SoLuongTon - ?) WHERE MaNVL = ?',
            [1, 48]
        );
        console.log('Update result:', result.info);

        // 3. Check final stock
        const [rows] = await conn.query('SELECT SoLuongTon FROM NguyenVatLieu WHERE MaNVL = 48');
        console.log('Final stock of NVL #48:', rows[0].SoLuongTon);

    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
})();
