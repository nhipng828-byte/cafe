const mysql = require('mysql2/promise');

async function checkColumns() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [rows] = await db.execute("DESCRIBE chitietphieuxuat");
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkColumns();
