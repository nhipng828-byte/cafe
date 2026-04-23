const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        // Thử nghiệm câu lệnh đơn giản nhất trước
        const [rows] = await db.query(`
            SELECT hd.*, b.TenBan, n.TenNV, k.TenKM 
            FROM HoaDon hd
            LEFT JOIN Ban b ON hd.MaBan = b.MaBan
            LEFT JOIN NhanVien n ON hd.MaNV = n.MaNV
            LEFT JOIN KhuyenMai k ON hd.MaKM = k.MaKM
            ORDER BY hd.MaHD DESC
        `);
        console.log('API Invoices - So luong tra ve:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('Loi tai API Invoices:', error);
        res.status(500).json({ message: 'Lỗi server', details: error.message });
    }
};

exports.getDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT cthd.*, s.TenSP
            FROM ChiTietHoaDon cthd
            JOIN SanPham s ON cthd.MaSP = s.MaSP
            WHERE cthd.MaHD = ?
        `, [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
