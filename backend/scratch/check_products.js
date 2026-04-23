const mysql = require('mysql2/promise');

async function checkProducts() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [rows] = await db.execute("SHOW TABLES");
        console.log("TABLES:", rows);
        const [productRows] = await db.execute("SELECT * FROM sanpham WHERE MaSP = 45");
        console.log("PRODUCT 45:", productRows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkProducts();
