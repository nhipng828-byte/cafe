const mysql = require('mysql2/promise');

async function checkNV() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [rows] = await db.execute("SELECT * FROM nhanvien");
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkNV();
