const db = require('./config/db');

async function initAdmin() {
    try {
        await db.query("INSERT INTO NhanVien (TenNV, ChucVu, Username, Password) VALUES ('Admin', 'Admin', 'admin', 'admin123')");
        console.log('Admin user created');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

initAdmin();
