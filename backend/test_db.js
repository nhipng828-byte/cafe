const db = require('./config/db');

async function test() {
    try {
        const [rows] = await db.query('SELECT * FROM SanPham');
        console.log('Products:', JSON.stringify(rows));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

test();
