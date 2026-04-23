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
        // 1. Reset stock of NVL #48 to 5
        await conn.query('UPDATE NguyenVatLieu SET SoLuongTon = 5 WHERE MaNVL = 48');
        console.log('Stock reset to 5.');

        // 2. Mock a request to api/inventory/export
        const chiTiet = [{ maNVL: 48, soLuong: 10 }];
        
        console.log('Attempting to export 10 units (Stock is 5)...');
        
        await conn.beginTransaction();
        try {
            for (let item of chiTiet) {
                const [nvl] = await conn.query(
                    'SELECT TenNVL, SoLuongTon FROM nguyenvatlieu WHERE MaNVL = ? FOR UPDATE',
                    [item.maNVL]
                );

                if (!nvl.length) throw new Error(`Không tìm thấy nguyên vật liệu ID #${item.maNVL}`);
                
                const currentStock = parseFloat(nvl[0].SoLuongTon);
                const exportQty = parseFloat(item.soLuong);

                console.log(`Current stock: ${currentStock}, Export qty: ${exportQty}`);

                if (currentStock < exportQty) {
                    throw new Error(`Không đủ hàng xuất: ${nvl[0].TenNVL} (Hiện có: ${currentStock}, Muốn xuất: ${exportQty})`);
                }

                await conn.query(
                    'UPDATE nguyenvatlieu SET SoLuongTon = SoLuongTon - ? WHERE MaNVL = ?',
                    [item.soLuong, item.maNVL]
                );
            }
            await conn.commit();
            console.log('SUCCESS (This should not happen!)');
        } catch (err) {
            await conn.rollback();
            console.log('EXPECTED ERROR:', err.message);
        }

        // 3. Check final stock
        const [rows] = await conn.query('SELECT SoLuongTon FROM NguyenVatLieu WHERE MaNVL = 48');
        console.log('Final stock of NVL #48:', rows[0].SoLuongTon);

    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
})();
