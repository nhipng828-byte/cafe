const mysql = require('mysql2/promise');

async function migrate() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        console.log("Adding TrangThai to phieunhapkho...");
        await db.execute("ALTER TABLE phieunhapkho ADD COLUMN TrangThai VARCHAR(20) DEFAULT 'HoanThanh'");
        console.log("Adding TrangThai to phieuxuatkho...");
        await db.execute("ALTER TABLE phieuxuatkho ADD COLUMN TrangThai VARCHAR(20) DEFAULT 'HoanThanh'");
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed (maybe columns exist?):", err.message);
    } finally {
        await db.end();
    }
}

migrate();
