const mysql = require('mysql2/promise');

async function deleteTestSuppliers() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        const [result] = await db.execute("DELETE FROM NhaCungCap WHERE TenNCC LIKE 'Supplier Test%' OR TenNCC = 'Meo'");
        console.log(`Deleted ${result.affectedRows} test suppliers.`);
    } catch (err) {
        console.error(err);
    } finally {
        await db.end();
    }
}

deleteTestSuppliers();
