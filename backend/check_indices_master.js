const db = require('./config/db');
async function check() {
    try {
        const [indices] = await db.query("SHOW INDEX FROM PhieuNhapKho");
        console.log("PhieuNhapKho Indices:", indices.map(i => i.Column_name));
        const [indices2] = await db.query("SHOW INDEX FROM phieuxuatkho");
        console.log("phieuxuatkho Indices:", indices2.map(i => i.Column_name));
    } catch (e) { console.error(e); }
    process.exit();
}
check();
