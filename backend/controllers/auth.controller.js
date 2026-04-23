const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM NhanVien WHERE Username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại' });
        }
        const user = rows[0];
        
        if (user.TrangThai !== 'Active') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu' });
        }

        const payload = {
            id: user.MaNV,
            role: user.ChucVu,
            name: user.TenNV
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.json({ token, user: { id: user.MaNV, name: user.TenNV, role: user.ChucVu } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
