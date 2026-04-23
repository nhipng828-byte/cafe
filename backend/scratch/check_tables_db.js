const mysql = require('mysql2/promise');

async function checkTables() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [rows] = await db.execute("SELECT * FROM ban");
        console.log("TABLES IN DB:", rows.length);
        console.log("FIRST 5 TABLES:", rows.slice(0, 5));
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

checkTables();
