const mysql = require('mysql2/promise');

async function alterTable() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        await db.execute("ALTER TABLE phieuxuatkho MODIFY COLUMN LyDo VARCHAR(255)");
        console.log("Altered phieuxuatkho.LyDo to VARCHAR(255)");
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

alterTable();
