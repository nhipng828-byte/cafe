const mysql = require('mysql2/promise');

async function checkNVLColumns() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [rows] = await db.execute("DESCRIBE nguyenvatlieu");
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkNVLColumns();
