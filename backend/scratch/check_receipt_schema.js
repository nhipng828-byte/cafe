const mysql = require('mysql2/promise');

async function checkSchema() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [pNhap] = await db.execute("DESCRIBE phieunhapkho");
        console.log("PHIEU NHAP KHO SCHEMA:", pNhap.map(c => c.Field));
        const [pXuat] = await db.execute("DESCRIBE phieuxuatkho");
        console.log("PHIEU XUAT KHO SCHEMA:", pXuat.map(c => c.Field));
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkSchema();
