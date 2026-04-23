const mysql = require('mysql2/promise');

async function testQuery() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [rows] = await db.query("SELECT MaPX as MaPXK, NgayXuat as NgayLap, LyDo, MaNV FROM phieuxuatkho ORDER BY MaPX DESC");
        console.log("SUCCESS:", rows);
    } catch (err) {
        console.error("FAILED:", err);
    } finally {
        await db.end();
    }
}

testQuery();
