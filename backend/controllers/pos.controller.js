const db = require('../config/db');

exports.getTables = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Ban');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.checkout = async (req, res) => {
    const { maNV, maBan, maKM, tongTien, tienGiam, tienKhachTra, chiTiet } = req.body;
    // chiTiet = [{ maSP, soLuong, donGia }]
    
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Kiểm tra tồn kho NVL cho toàn bộ đơn hàng trước khi thực hiện
        for (let item of chiTiet) {
            const [congThuc] = await connection.query(
                'SELECT ct.MaNVL, ct.DinhLuong, nv.TenNVL, nv.SoLuongTon, nv.DonViTinh \
                 FROM CongThuc ct \
                 JOIN NguyenVatLieu nv ON ct.MaNVL = nv.MaNVL \
                 WHERE ct.MaSP = ?', [item.maSP]
            );
            
            for (let ct of congThuc) {
                const soLuongCan = ct.DinhLuong * item.soLuong;
                if (parseFloat(ct.SoLuongTon) < soLuongCan) {
                    throw new Error(`Không đủ nguyên liệu: ${ct.TenNVL} (Thiếu ${soLuongCan - parseFloat(ct.SoLuongTon)} ${ct.DonViTinh})`);
                }
            }
        }

        // 2. Tạo hóa đơn
        const [hdResult] = await connection.query(
            'INSERT INTO HoaDon (MaNV, MaBan, MaKM, TongTien, TienGiam, TienKhachTra, PhuongThuc) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [maNV, maBan, maKM || null, tongTien, tienGiam, tienKhachTra, req.body.phuongThuc || 'Tiền mặt']
        );
        const maHD = hdResult.insertId;

        // 3. Chi tiết hóa đơn và trừ kho NVL
        for (let item of chiTiet) {
            await connection.query(
                'INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong, DonGia) VALUES (?, ?, ?, ?)',
                [maHD, item.maSP, item.soLuong, item.donGia]
            );

            const [congThuc] = await connection.query('SELECT MaNVL, DinhLuong FROM CongThuc WHERE MaSP = ?', [item.maSP]);
            for (let ct of congThuc) {
                const soLuongTru = ct.DinhLuong * item.soLuong;
                await connection.query(
                    'UPDATE NguyenVatLieu SET SoLuongTon = GREATEST(0, SoLuongTon - ?) WHERE MaNVL = ?',
                    [soLuongTru, ct.MaNVL]
                );
            }
        }

        // 3. Cập nhật trạng thái bàn
        if (maBan) {
            // Note: có thể cập nhật trạng thái nếu cần
        }

        await connection.commit();
        res.json({ message: 'Thanh toán thành công', maHD });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error in checkout controller:', error);
        res.status(500).json({ message: 'Lỗi khi thanh toán: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
}
exports.createTable = async (req, res) => {
    const { TenBan } = req.body;
    try {
        await db.query('INSERT INTO Ban (TenBan, HienThi, TrangThai) VALUES (?, 1, "Trong")', [TenBan]);
        res.status(201).json({ message: 'Thêm bàn thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateTable = async (req, res) => {
    const { id } = req.params;
    const { TenBan } = req.body;
    try {
        await db.query('UPDATE Ban SET TenBan = ? WHERE MaBan = ?', [TenBan, id]);
        res.json({ message: 'Cập nhật bàn thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.toggleTableVisibility = async (req, res) => {
    const { id } = req.params;
    const { HienThi } = req.body;
    try {
        await db.query('UPDATE Ban SET HienThi = ? WHERE MaBan = ?', [HienThi ? 1 : 0, id]);
        res.json({ message: 'Cập nhật trạng thái hiển thị thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
