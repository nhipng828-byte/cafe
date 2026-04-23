const db = require('./config/db');
async function check() {
    try {
        const [rows] = await db.query("SELECT * FROM NguyenVatLieu LIMIT 1");
        console.log("Sample Material:", rows[0]);
        const [columns] = await db.query("SHOW COLUMNS FROM NguyenVatLieu");
        console.log("Columns:", columns.map(c => c.Field));
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
check();
