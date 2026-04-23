const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM KhuyenMai ORDER BY NgayBatDau DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.create = async (req, res) => {
    const { tenKM, ngayBatDau, ngayKetThuc, chietKhau } = req.body;
    try {
        await db.query(
            "INSERT INTO KhuyenMai (TenKM, NgayBatDau, NgayKetThuc, ChietKhau) VALUES (?, ?, ?, ?)",
            [tenKM, ngayBatDau, ngayKetThuc, chietKhau]
        );
        res.status(201).json({ message: 'Tạo khuyến mại thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { tenKM, ngayBatDau, ngayKetThuc, chietKhau, trangThai } = req.body;
    try {
        await db.query(
            "UPDATE KhuyenMai SET TenKM = ?, NgayBatDau = ?, NgayKetThuc = ?, ChietKhau = ?, TrangThai = ? WHERE MaKM = ?",
            [tenKM, ngayBatDau, ngayKetThuc, chietKhau, trangThai, id]
        );
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM KhuyenMai WHERE MaKM = ?", [id]);
        res.json({ message: 'Xóa khuyến mại thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
