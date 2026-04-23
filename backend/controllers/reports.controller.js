const db = require('../config/db');

exports.getDashboard = async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        const startDate = fromDate || new Date().toISOString().split('T')[0];
        const endDate = toDate || startDate;

        // Doanh thu trong khoảng
        const [dtRows] = await db.query(
            "SELECT SUM(TongTien - TienGiam) as DoanhThu, COUNT(MaHD) as SoHoaDon FROM HoaDon WHERE DATE(ThoiGian) >= ? AND DATE(ThoiGian) <= ? AND TrangThai = 'DaThanhToan'",
            [startDate, endDate]
        );
        const doanhThu = dtRows[0].DoanhThu || 0;
        const soHoaDon = dtRows[0].SoHoaDon || 0;

        // Giá vốn hôm nay: tổng (số lượng bán * số lượng nvl trong công thức * đơn giá trung bình)
        // Đây là cách tính gần đúng ngay lập tức, cách chuẩn hơn là lưu giá vốn vào hóa đơn tại thời điểm bán.
        // Để query đơn giản và khớp yêu cầu, ta join ChiTietHoaDon -> CongThuc -> NguyenVatLieu
        const [gvRows] = await db.query(`
            SELECT SUM(cthd.SoLuong * ct.DinhLuong * nvl.DonGiaTrungBinh) as GiaVon
            FROM HoaDon hd
            JOIN ChiTietHoaDon cthd ON hd.MaHD = cthd.MaHD
            JOIN CongThuc ct ON cthd.MaSP = ct.MaSP
            JOIN NguyenVatLieu nvl ON ct.MaNVL = nvl.MaNVL
            WHERE DATE(hd.ThoiGian) >= ? AND DATE(hd.ThoiGian) <= ? AND hd.TrangThai = 'DaThanhToan'
        `, [startDate, endDate]);
        const giaVon = gvRows[0].GiaVon || 0;

        // Hao hụt trong khoảng
        const [hhRows] = await db.query(`
            SELECT SUM(ctpx.SoLuong * nvl.DonGiaTrungBinh) as HaoHut
            FROM PhieuXuatKho px
            JOIN ChiTietPhieuXuat ctpx ON px.MaPX = ctpx.MaPX
            JOIN NguyenVatLieu nvl ON ctpx.MaNVL = nvl.MaNVL
            WHERE DATE(px.NgayXuat) >= ? AND DATE(px.NgayXuat) <= ? AND px.LyDo = 'HaoHut'
        `, [startDate, endDate]);
        const haoHut = hhRows[0].HaoHut || 0;

        const loiNhuan = Number(doanhThu || 0) - Number(giaVon || 0);

        // Sản phẩm bán chạy trong khoảng
        const [spRows] = await db.query(`
            SELECT sp.TenSP, SUM(cthd.SoLuong) as TongSoLuong
            FROM HoaDon hd
            JOIN ChiTietHoaDon cthd ON hd.MaHD = cthd.MaHD
            JOIN SanPham sp ON cthd.MaSP = sp.MaSP
            WHERE DATE(hd.ThoiGian) >= ? AND DATE(hd.ThoiGian) <= ? AND hd.TrangThai = 'DaThanhToan'
            GROUP BY sp.MaSP
            ORDER BY TongSoLuong DESC
            LIMIT 5
        `, [startDate, endDate]);

        res.json({
            doanhThu,
            soHoaDon,
            loiNhuan,
            giaVon,
            haoHut,
            sanPhamBanChay: spRows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getReportDetails = async (req, res) => {
    const { fromDate, toDate, groupBy = 'day' } = req.query;
    try {
        let dateGroupFormat = '%d/%m/%Y';
        let sqlGroupBy = 'DATE(ThoiGian)';
        
        if (groupBy === 'month') {
            dateGroupFormat = '%m/%Y';
            sqlGroupBy = 'DATE_FORMAT(ThoiGian, "%Y-%m")';
        } else if (groupBy === 'year') {
            dateGroupFormat = '%Y';
            sqlGroupBy = 'YEAR(ThoiGian)';
        }

        const [rows] = await db.query(`
            SELECT 
                DATE_FORMAT(hd.ThoiGian, ?) as Ngay,
                SUM(hd.TongTien - hd.TienGiam) as DoanhThu,
                IFNULL(SUM(gv.GiaVonDon), 0) as GiaVon
            FROM HoaDon hd
            LEFT JOIN (
                SELECT hd2.MaHD, SUM(ct2.SoLuong * c2.DinhLuong * nvl2.DonGiaTrungBinh) as GiaVonDon
                FROM HoaDon hd2
                JOIN ChiTietHoaDon ct2 ON hd2.MaHD = ct2.MaHD
                JOIN CongThuc c2 ON ct2.MaSP = c2.MaSP
                JOIN NguyenVatLieu nvl2 ON c2.MaNVL = nvl2.MaNVL
                WHERE hd2.TrangThai = 'DaThanhToan'
                GROUP BY hd2.MaHD
            ) gv ON hd.MaHD = gv.MaHD
            WHERE DATE(hd.ThoiGian) >= ? AND DATE(hd.ThoiGian) <= ? AND hd.TrangThai = 'DaThanhToan'
            GROUP BY DATE_FORMAT(hd.ThoiGian, ?)
            ORDER BY MIN(hd.ThoiGian) ASC
        `, [dateGroupFormat, fromDate, toDate, dateGroupFormat]);

        const result = rows.map(r => ({
            ...r,
            LoiNhuan: Number(r.DoanhThu || 0) - Number(r.GiaVon || 0)
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getTopProducts = async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT 
                sp.MaSP, 
                sp.TenSP, 
                c.TenDM as DonViTinh, 
                IFNULL(SUM(cthd.SoLuong), 0) as TongSoLuong, 
                IFNULL(SUM(cthd.SoLuong * cthd.DonGia), 0) as TongDoanhThu
            FROM SanPham sp
            LEFT JOIN ChiTietHoaDon cthd ON sp.MaSP = cthd.MaSP
            LEFT JOIN HoaDon hd ON cthd.MaHD = hd.MaHD AND DATE(hd.ThoiGian) >= ? AND DATE(hd.ThoiGian) <= ? AND hd.TrangThai = 'DaThanhToan'
            LEFT JOIN DanhMuc c ON sp.MaDM = c.MaDM
            GROUP BY sp.MaSP
            ORDER BY TongSoLuong DESC
        `, [fromDate, toDate]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getInventoryReport = async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
        const startDate = fromDate + ' 00:00:00';
        const endDate = toDate + ' 23:59:59';
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

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
            -- Nhập trong kỳ
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong * ct.QuyDoi) as Qty
                FROM ChiTietPhieuNhap ct
                JOIN PhieuNhapKho p ON ct.MaPN = p.MaPN
                WHERE p.NgayNhap >= ? AND p.NgayNhap <= ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) period_in ON nvl.MaNVL = period_in.MaNVL
            -- Xuất trong kỳ
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong) as Qty
                FROM ChiTietPhieuXuat ct
                JOIN PhieuXuatKho p ON ct.MaPX = p.MaPX
                WHERE p.NgayXuat >= ? AND p.NgayXuat <= ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) period_out ON nvl.MaNVL = period_out.MaNVL
            -- Nhập SAU kỳ (đến hiện tại)
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong * ct.QuyDoi) as Qty
                FROM ChiTietPhieuNhap ct
                JOIN PhieuNhapKho p ON ct.MaPN = p.MaPN
                WHERE p.NgayNhap > ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) after_in ON nvl.MaNVL = after_in.MaNVL
            -- Xuất SAU kỳ (đến hiện tại)
            LEFT JOIN (
                SELECT ct.MaNVL, SUM(ct.SoLuong) as Qty
                FROM ChiTietPhieuXuat ct
                JOIN PhieuXuatKho p ON ct.MaPX = p.MaPX
                WHERE p.NgayXuat > ? AND (p.TrangThai = 'HoanThanh' OR p.TrangThai IS NULL)
                GROUP BY ct.MaNVL
            ) after_out ON nvl.MaNVL = after_out.MaNVL
            WHERE nvl.TrangThai = 'Active'
        `, [startDate, endDate, startDate, endDate, endDate, endDate]);

        const report = rows.map(r => {
            // Tồn cuối kỳ = Tồn hiện tại - Nhập sau kỳ + Xuất sau kỳ
            const tonCuoiKy = r.CurrentStock - r.NhapSauKy + r.XuatSauKy;
            // Tồn đầu kỳ = Tồn cuối kỳ - Nhập trong kỳ + Xuất trong kỳ
            const tonDauKy = tonCuoiKy - r.NhapTrongKy + r.XuatTrongKy;
            
            return {
                MaNVL: r.MaNVL,
                TenNVL: r.TenNVL,
                DonViTinh: r.DonViTinh,
                DonGia: r.DonGiaTrungBinh,
                TonDauKy: tonDauKy,
                NhapTrongKy: r.NhapTrongKy,
                XuatTrongKy: r.XuatTrongKy,
                TonCuoiKy: tonCuoiKy,
                GiaTriTon: tonCuoiKy * r.DonGiaTrungBinh
            };
        });

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
