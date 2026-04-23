const db = require('./config/db');
async function test() {
    const fromDate = '2026-04-01';
    const toDate = '2026-04-30';
    const startDate = fromDate + ' 00:00:00';
    const endDate = toDate + ' 23:59:59';
    try {
        const [rows] = await db.query(`
            SELECT 
                nvl.MaNVL, 
                nvl.TenNVL, 
                nvl.DonViTinh, 
                nvl.DonGiaTrungBinh, 
                nvl.SoLuongTon as CurrentStock,
                IFNULL(period_in.Qty, 0) as NhapTrongKy,
                IFNULL(period_out.Qty, 0) as XuatTrongKy,
                IFNULL(after_in.Qty, 0) as NhapSauKy,
                IFNULL(after_out.Qty, 0) as XuatSauKy
            FROM NguyenVatLieu nvl
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong * ct.QuyDoi) as Qty
                FROM ChiTietPhieuNhap ct
                JOIN PhieuNhapKho p ON ct.MaPN = p.MaPN
                WHERE p.NgayNhap >= ? AND p.NgayNhap <= ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) period_in ON nvl.MaNVL = period_in.MaNVL
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong) as Qty
                FROM ChiTietPhieuXuat ct
                JOIN phieuxuatkho p ON ct.MaPX = p.MaPX
                WHERE p.NgayXuat >= ? AND p.NgayXuat <= ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) period_out ON nvl.MaNVL = period_out.MaNVL
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong * ct.QuyDoi) as Qty
                FROM ChiTietPhieuNhap ct
                JOIN PhieuNhapKho p ON ct.MaPN = p.MaPN
                WHERE p.NgayNhap > ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) after_in ON nvl.MaNVL = after_in.MaNVL
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong) as Qty
                FROM ChiTietPhieuXuat ct
                JOIN phieuxuatkho p ON ct.MaPX = p.MaPX
                WHERE p.NgayXuat > ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) after_out ON nvl.MaNVL = after_out.MaNVL
            WHERE nvl.TrangThai = 'Active'
        `, [startDate, endDate, startDate, endDate, endDate, endDate]);
        console.log("Rows Count:", rows.length);
        console.log("First Row:", rows[0]);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}
test();
