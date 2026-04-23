const db = require('../config/db');

exports.getMaterials = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM NguyenVatLieu WHERE TrangThai = 'Active'");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.importStock = async (req, res) => {
    const { maNV, maNCC, chiTiet } = req.body; // maNCC ở đây là tên NCC (text)
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Tìm hoặc tạo mới NCC theo tên
        let nccId = null;
        if (maNCC && maNCC.trim()) {
            const [existing] = await connection.query('SELECT MaNCC FROM NhaCungCap WHERE TenNCC = ?', [maNCC.trim()]);
            if (existing.length > 0) {
                nccId = existing[0].MaNCC;
            } else {
                const [inserted] = await connection.query('INSERT INTO NhaCungCap (TenNCC) VALUES (?)', [maNCC.trim()]);
                nccId = inserted.insertId;
            }
        }

        // Tổng tiền = tổng (soLuong × donGia) theo ĐVN
        let tongTien = 0;
        chiTiet.forEach(item => { tongTien += item.soLuong * item.donGia; });

        const [pnResult] = await connection.query(
            'INSERT INTO PhieuNhapKho (MaNV, MaNCC, TongTien) VALUES (?, ?, ?)',
            [maNV, nccId, tongTien]
        );
        const maPN = pnResult.insertId;

        for (let item of chiTiet) {
            const quyDoi = parseFloat(item.quyDoi) || 1;
            const actualQty = parseFloat(item.soLuong) * quyDoi;
            const totalCost = parseFloat(item.soLuong) * parseFloat(item.donGia);

            await connection.query(
                'INSERT INTO ChiTietPhieuNhap (MaPN, MaNVL, SoLuong, DonGia, DonViNhap, QuyDoi) VALUES (?, ?, ?, ?, ?, ?)',
                [maPN, item.maNVL, item.soLuong, item.donGia, item.dvn, quyDoi]
            );

            const [nvl] = await connection.query('SELECT SoLuongTon, DonGiaTrungBinh FROM NguyenVatLieu WHERE MaNVL = ? FOR UPDATE', [item.maNVL]);
            if (nvl.length > 0) {
                const oldQty = parseFloat(nvl[0].SoLuongTon);
                const oldPrice = parseFloat(nvl[0].DonGiaTrungBinh);
                const oldValue = oldQty * oldPrice;
                const newTotalQty = Math.max(0, oldQty + actualQty);
                const newAvgPrice = newTotalQty > 0 ? (oldValue + totalCost) / newTotalQty : 0;

                await connection.query(
                    'UPDATE NguyenVatLieu SET SoLuongTon = ?, DonGiaTrungBinh = ? WHERE MaNVL = ?',
                    [newTotalQty, newAvgPrice, item.maNVL]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Nhập kho thành công', maPN });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi nhập kho: ' + error.message });
    } finally {
        connection.release();
    }
};

exports.exportStock = async (req, res) => {
    const { maNV, lyDo, chiTiet } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [pxResult] = await connection.query(
            'INSERT INTO phieuxuatkho (MaNV, LyDo) VALUES (?, ?)',
            [maNV, lyDo]
        );
        const maPX = pxResult.insertId;

        for (let item of chiTiet) {
            // 1. Kiểm tra tồn kho trước khi xuất
            const [nvl] = await connection.query(
                'SELECT TenNVL, SoLuongTon FROM nguyenvatlieu WHERE MaNVL = ? FOR UPDATE',
                [item.maNVL]
            );

            if (!nvl.length) throw new Error(`Không tìm thấy nguyên vật liệu ID #${item.maNVL}`);
            
            const currentStock = parseFloat(nvl[0].SoLuongTon);
            const exportQty = parseFloat(item.soLuong);

            console.log(`[EXPORT] NVL: ${nvl[0].TenNVL}, Stock: ${currentStock}, Qty: ${exportQty}`);

            if (currentStock < exportQty) {
                throw new Error(`Không đủ hàng xuất: ${nvl[0].TenNVL} (Hiện có: ${currentStock}, Muốn xuất: ${exportQty})`);
            }

            await connection.query(
                'INSERT INTO chitietphieuxuat (MaPX, MaNVL, SoLuong) VALUES (?, ?, ?)',
                [maPX, item.maNVL, item.soLuong]
            );

            await connection.query(
                'UPDATE nguyenvatlieu SET SoLuongTon = GREATEST(0, SoLuongTon - ?) WHERE MaNVL = ?',
                [item.soLuong, item.maNVL]
            );
        }

        await connection.commit();
        res.json({ message: 'Xuất kho thành công', maPX });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('EXPORT ERROR:', error);
        res.status(500).json({ message: 'Lỗi khi xuất kho: ' + error.message });
    } finally {
        if (connection) connection.release();
    }
};

exports.getImports = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.MaPN, p.NgayNhap as NgayLap, p.TongTien, p.MaNV, p.TrangThai,
                   COALESCE(n.TenNCC, 'Không rõ') as MaNCC
            FROM PhieuNhapKho p
            LEFT JOIN NhaCungCap n ON p.MaNCC = n.MaNCC
            ORDER BY p.NgayNhap DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getImportDetail = async (req, res) => {
    const { maPN } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT ct.MaNVL, nv.TenNVL, nv.DonViTinh, ct.SoLuong, ct.DonGia,
                   ct.DonViNhap, ct.QuyDoi,
                   ct.SoLuong * ct.DonGia as ThanhTien
            FROM ChiTietPhieuNhap ct
            JOIN NguyenVatLieu nv ON ct.MaNVL = nv.MaNVL
            WHERE ct.MaPN = ?
        `, [maPN]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getExports = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT MaPX as MaPXK, NgayXuat as NgayLap, LyDo, MaNV, TrangThai FROM phieuxuatkho ORDER BY MaPX DESC");
        res.json(rows);
    } catch (error) {
        console.error('CRITICAL Error in getExports:', error);
        res.status(500).json([]); // Trả về mảng rỗng để tránh crash frontend
    }
};

exports.getExportDetail = async (req, res) => {
    const { maPX } = req.params;
    console.log('Fetching details for MaPX:', maPX);
    try {
        const [rows] = await db.query(`
            SELECT ct.MaNVL, nv.TenNVL, nv.DonViTinh, ct.SoLuong
            FROM chitietphieuxuat ct
            JOIN nguyenvatlieu nv ON ct.MaNVL = nv.MaNVL
            WHERE ct.MaPX = ?
        `, [maPX]);
        console.log('Details found:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error in getExportDetail:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM NhaCungCap ORDER BY MaNCC DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateSupplier = async (req, res) => {
    const { maNCC } = req.params;
    const { TenNCC, SDT, DiaChi, TrangThai } = req.body;
    try {
        await db.query(
            "UPDATE NhaCungCap SET TenNCC = ?, SDT = ?, DiaChi = ?, TrangThai = ? WHERE MaNCC = ?",
            [TenNCC, SDT, DiaChi, TrangThai, maNCC]
        );
        res.json({ message: 'Cập nhật nhà cung cấp thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật nhà cung cấp' });
    }
};

exports.createSupplier = async (req, res) => {
    const { TenNCC, SDT, DiaChi } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO NhaCungCap (TenNCC, SDT, DiaChi, TrangThai) VALUES (?, ?, ?, 'Active')",
            [TenNCC, SDT, DiaChi]
        );
        res.json({ message: 'Tạo nhà cung cấp thành công', maNCC: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo nhà cung cấp' });
    }
};
exports.createMaterial = async (req, res) => {
    const { tenNVL, donViTinh, soLuongTon, donGiaTrungBinh } = req.body;
    try {
        const [result] = await db.query(
            "INSERT INTO nguyenvatlieu (TenNVL, DonViTinh, SoLuongTon, DonGiaTrungBinh) VALUES (?, ?, ?, ?)",
            [tenNVL, donViTinh, Math.max(0, soLuongTon || 0), Math.max(0, donGiaTrungBinh || 0)]
        );
        res.json({ message: 'Thêm nguyên vật liệu thành công', maNVL: result.insertId });
    } catch (error) {
        console.error('Error in createMaterial:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateMaterial = async (req, res) => {
    const { maNVL } = req.params;
    const { tenNVL, donViTinh, soLuongTon, donGiaTrungBinh } = req.body;
    try {
        await db.query(
            "UPDATE nguyenvatlieu SET TenNVL = ?, DonViTinh = ?, SoLuongTon = ?, DonGiaTrungBinh = ? WHERE MaNVL = ?",
            [tenNVL, donViTinh, Math.max(0, soLuongTon || 0), Math.max(0, donGiaTrungBinh || 0), maNVL]
        );
        res.json({ message: 'Cập nhật nguyên vật liệu thành công' });
    } catch (error) {
        console.error('Error in updateMaterial:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.cancelImport = async (req, res) => {
    const { maPN } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [p] = await connection.query("SELECT TrangThai FROM PhieuNhapKho WHERE MaPN = ? FOR UPDATE", [maPN]);
        if (!p.length || p[0].TrangThai === 'DaHuy') throw new Error('Phiếu không hợp lệ hoặc đã hủy');

        const [details] = await connection.query("SELECT MaNVL, SoLuong, DonGia, QuyDoi FROM ChiTietPhieuNhap WHERE MaPN = ?", [maPN]);
        
        for (let d of details) {
            const [nvl] = await connection.query("SELECT SoLuongTon, DonGiaTrungBinh FROM NguyenVatLieu WHERE MaNVL = ? FOR UPDATE", [d.MaNVL]);
            if (nvl.length) {
                const quyDoi = parseFloat(d.QuyDoi) || 1;
                const actualQty = parseFloat(d.SoLuong) * quyDoi;
                const totalCost = parseFloat(d.SoLuong) * parseFloat(d.DonGia);

                const currentQty = parseFloat(nvl[0].SoLuongTon);
                const currentPrice = parseFloat(nvl[0].DonGiaTrungBinh);
                const currentValue = currentQty * currentPrice;

                const newQty = Math.max(0, currentQty - actualQty);
                const newPrice = newQty > 0 ? Math.max(0, (currentValue - totalCost) / newQty) : currentPrice;

                await connection.query("UPDATE NguyenVatLieu SET SoLuongTon = ?, DonGiaTrungBinh = ? WHERE MaNVL = ?", [newQty, newPrice, d.MaNVL]);
            }
        }

        await connection.query("UPDATE PhieuNhapKho SET TrangThai = 'DaHuy' WHERE MaPN = ?", [maPN]);
        await connection.commit();
        res.json({ message: 'Hủy phiếu nhập thành công' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        if (connection) connection.release();
    }
};

exports.cancelExport = async (req, res) => {
    const { maPX } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [p] = await connection.query("SELECT TrangThai FROM phieuxuatkho WHERE MaPX = ? FOR UPDATE", [maPX]);
        if (!p.length || p[0].TrangThai === 'DaHuy') throw new Error('Phiếu không hợp lệ hoặc đã hủy');

        const [details] = await connection.query("SELECT MaNVL, SoLuong FROM chitietphieuxuat WHERE MaPX = ?", [maPX]);
        
        for (let d of details) {
            await connection.query("UPDATE NguyenVatLieu SET SoLuongTon = SoLuongTon + ? WHERE MaNVL = ?", [d.SoLuong, d.MaNVL]);
        }

        await connection.query("UPDATE phieuxuatkho SET TrangThai = 'DaHuy' WHERE MaPX = ?", [maPX]);
        await connection.commit();
        res.json({ message: 'Hủy phiếu xuất thành công' });
    } catch (err) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: err.message });
    } finally {
        if (connection) connection.release();
    }
};
