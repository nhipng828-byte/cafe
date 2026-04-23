const mysql = require('mysql2/promise');
require('dotenv').config();

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'cafe_management'
  });

  try {
    // 1. Find the Test Supplier ID
    const [suppliers] = await connection.query("SELECT MaNCC FROM NhaCungCap WHERE TenNCC = 'Test Supplier'");
    if (suppliers.length === 0) {
      console.log('No Test Supplier found.');
    } else {
      const nccId = suppliers[0].MaNCC;
      console.log('Cleaning up data for Supplier ID:', nccId);

      // 2. Find receipts for this supplier
      const [receipts] = await connection.query("SELECT MaPN FROM PhieuNhapKho WHERE MaNCC = ?", [nccId]);
      const pnIds = receipts.map(r => r.MaPN);

      if (pnIds.length > 0) {
        // 3. Delete details
        await connection.query("DELETE FROM ChiTietPhieuNhap WHERE MaPN IN (?)", [pnIds]);
        console.log('Deleted details for PN:', pnIds);

        // 4. Delete receipts
        await connection.query("DELETE FROM PhieuNhapKho WHERE MaPN IN (?)", [pnIds]);
        console.log('Deleted receipts.');
      }

      // 5. Delete supplier
      await connection.query("DELETE FROM NhaCungCap WHERE MaNCC = ?", [nccId]);
      console.log('Deleted Test Supplier.');
    }

    // Also delete PN11, PN12 if they were tests (they have null DonViNhap)
    const [oldTests] = await connection.query("SELECT MaPN FROM ChiTietPhieuNhap WHERE DonViNhap IS NULL");
    const oldPnIds = [...new Set(oldTests.map(r => r.MaPN))];
    if (oldPnIds.length > 0) {
       await connection.query("DELETE FROM ChiTietPhieuNhap WHERE MaPN IN (?)", [oldPnIds]);
       await connection.query("DELETE FROM PhieuNhapKho WHERE MaPN IN (?)", [oldPnIds]);
       console.log('Deleted old test receipts:', oldPnIds);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

cleanup();
