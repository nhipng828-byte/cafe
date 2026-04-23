const mysql = require('mysql2/promise');

async function deleteProduct() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'cafe_management'
    });

    try {
        // Delete recipe first
        await db.execute("DELETE FROM congthuc WHERE MaSP = 45");
        // Delete product
        await db.execute("DELETE FROM sanpham WHERE MaSP = 45");
        console.log("SUCCESS: Deleted product 45 and its recipe.");
    } catch (err) {
        console.error("FAILED:", err);
    } finally {
        await db.end();
    }
}

deleteProduct();
