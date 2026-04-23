const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const status = req.query.status || 'Active';
        const [rows] = await db.query(`
            SELECT sp.*, dm.TenDM,
            (
                SELECT MIN(CASE WHEN ct.DinhLuong = 0 THEN 1 ELSE nvl.SoLuongTon / ct.DinhLuong END)
                FROM CongThuc ct
                JOIN NguyenVatLieu nvl ON ct.MaNVL = nvl.MaNVL
                WHERE ct.MaSP = sp.MaSP
            ) as KhaNangPhucVu
            FROM SanPham sp 
            LEFT JOIN DanhMuc dm ON sp.MaDM = dm.MaDM
            WHERE sp.TrangThai = ?
        `, [status]);

        const products = rows.map(p => {
            const khaNang = p.KhaNangPhucVu === null ? null : parseFloat(p.KhaNangPhucVu);
            const isAvailable = khaNang === null || khaNang >= 1;
            
            // Log for debugging specific items reported by user
            if (p.MaSP >= 28 && p.MaSP <= 38) {
                console.log(`[DEBUG] Product: ${p.TenSP}, ID: ${p.MaSP}, KhaNang: ${khaNang}, isAvailable: ${isAvailable}`);
            }

            return {
                ...p,
                isAvailable
            };
        });

        res.json(products);
    } catch (error) {
        console.error('ERROR in getAll products:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.restore = async (req, res) => {
    try {
        await db.query("UPDATE SanPham SET TrangThai = 'Active' WHERE MaSP = ?", [req.params.id]);
        res.json({ message: 'Đã khôi phục sản phẩm' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.create = async (req, res) => {
    const { tenSP, donGia, maDM } = req.body;
    try {
        const [result] = await db.query('INSERT INTO SanPham (TenSP, DonGia, MaDM) VALUES (?, ?, ?)', [tenSP, donGia, maDM]);
        res.json({ message: 'Thêm sản phẩm thành công', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.update = async (req, res) => {
    const { tenSP, donGia, maDM } = req.body;
    try {
        await db.query('UPDATE SanPham SET TenSP = ?, DonGia = ?, MaDM = ? WHERE MaSP = ?', [tenSP, donGia, maDM, req.params.id]);
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.hide = async (req, res) => {
    try {
        // Chỉ ẩn, không xóa (Yêu cầu đề bài)
        await db.query("UPDATE SanPham SET TrangThai = 'Inactive' WHERE MaSP = ?", [req.params.id]);
        res.json({ message: 'Ẩn sản phẩm thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getRecipe = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT ct.*, nvl.TenNVL, nvl.DonViTinh, nvl.DonGiaTrungBinh
            FROM CongThuc ct
            JOIN NguyenVatLieu nvl ON ct.MaNVL = nvl.MaNVL
            WHERE ct.MaSP = ?
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateRecipe = async (req, res) => {
    const { ingredients } = req.body; // [{ maNVL, dinhLuong }]
    const maSP = req.params.id;
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Xóa công thức cũ
        await connection.query('DELETE FROM CongThuc WHERE MaSP = ?', [maSP]);

        // Thêm công thức mới
        for (let item of ingredients) {
            await connection.query(
                'INSERT INTO CongThuc (MaSP, MaNVL, DinhLuong) VALUES (?, ?, ?)',
                [maSP, item.maNVL, item.dinhLuong]
            );
        }

        await connection.commit();
        res.json({ message: 'Cập nhật công thức thành công' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật công thức' });
    } finally {
        connection.release();
    }
};
