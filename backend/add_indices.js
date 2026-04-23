const db = require('./config/db');
async function run() {
    try {
        await db.query("CREATE INDEX idx_ngaynhap ON PhieuNhapKho(NgayNhap)");
        await db.query("CREATE INDEX idx_ngayxuat ON phieuxuatkho(NgayXuat)");
        console.log("Indices created successfully.");
    } catch (e) { console.error(e); }
    process.exit();
}
run();
