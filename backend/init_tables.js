const db = require('./config/db');

async function initTables() {
    try {
        // Clear existing tables to avoid duplicates (optional, or use ON DUPLICATE KEY)
        // For simplicity, we just insert if not exists
        for (let i = 1; i <= 30; i++) {
            await db.query('INSERT INTO Ban (TenBan, LaBanMangVe, TrangThai) VALUES (?, FALSE, "Trong")', [`Bàn ${i}`]);
        }
        console.log('30 tables initialized');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

initTables();
