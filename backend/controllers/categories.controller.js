const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const status = req.query.status || 'Active';
        const [rows] = await db.query("SELECT * FROM DanhMuc WHERE TrangThai = ?", [status]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.create = async (req, res) => {
    const { tenDM } = req.body;
    try {
        await db.query("INSERT INTO DanhMuc (TenDM) VALUES (?)", [tenDM]);
        res.status(201).json({ message: 'Tạo danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { tenDM, trangThai } = req.body;
    try {
        await db.query("UPDATE DanhMuc SET TenDM = ?, TrangThai = ? WHERE MaDM = ?", [tenDM, trangThai, id]);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete
        await db.query("UPDATE DanhMuc SET TrangThai = 'Inactive' WHERE MaDM = ?", [id]);
        res.json({ message: 'Xóa danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.restore = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE DanhMuc SET TrangThai = 'Active' WHERE MaDM = ?", [id]);
        res.json({ message: 'Khôi phục danh mục thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
