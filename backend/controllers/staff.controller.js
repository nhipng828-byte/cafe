const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT MaNV, TenNV, SDT, ChucVu FROM NhanVien WHERE TrangThai = 'Active'");
        res.json(rows);
    } catch (error) {
        console.error('Error in getAll staff:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

exports.create = async (req, res) => {
    const { TenNV, SDT, ChucVu } = req.body;
    try {
        await db.query(
            "INSERT INTO NhanVien (TenNV, SDT, ChucVu, TrangThai) VALUES (?, ?, ?, 'Active')",
            [TenNV, SDT, ChucVu]
        );
        res.status(201).json({ message: 'Thêm nhân viên thành công' });
    } catch (error) {
        console.error('Error in create staff:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { TenNV, SDT, ChucVu } = req.body;
    try {
        await db.query(
            "UPDATE NhanVien SET TenNV = ?, SDT = ?, ChucVu = ? WHERE MaNV = ?",
            [TenNV, SDT, ChucVu, id]
        );
        res.json({ message: 'Cập nhật nhân viên thành công' });
    } catch (error) {
        console.error('Error in update staff:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE NhanVien SET TrangThai = 'Inactive' WHERE MaNV = ?", [id]);
        res.json({ message: 'Xóa nhân viên thành công' });
    } catch (error) {
        console.error('Error in delete staff:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
