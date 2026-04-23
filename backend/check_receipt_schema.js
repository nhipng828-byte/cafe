const db = require('./config/db');
async function check() {
    try {
        const [p_in] = await db.query("SHOW COLUMNS FROM PhieuNhapKho");
        console.log("PhieuNhapKho Columns:", p_in.map(c => c.Field));
        const [p_out] = await db.query("SHOW COLUMNS FROM phieuxuatkho");
        console.log("phieuxuatkho Columns:", p_out.map(c => c.Field));
    } catch (e) { console.error(e); }
    process.exit();
}
check();
