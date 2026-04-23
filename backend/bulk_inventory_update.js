require('dotenv').config();
const db = require('./config/db');

async function importAll() {
    try {
        // 1. Lấy danh sách NVL
        const [nvls] = await db.query('SELECT MaNVL, TenNVL FROM NguyenVatLieu');
        if (nvls.length === 0) {
            console.log('Không có nguyên vật liệu nào để cập nhật!');
            process.exit();
        }

        console.log(`Đang xử lý ${nvls.length} nguyên vật liệu...`);

        // 2. Tạo Phiếu Nhập Kho
        const [pResult] = await db.query(
            'INSERT INTO PhieuNhapKho (MaNV, NgayNhap, TongTien, TrangThai) VALUES (?, NOW(), ?, ?)',
            [3, 0, 'HoanThanh']
        );
        const maPN = pResult.insertId;

        // 3. Tạo Chi tiết phiếu nhập
        const detailsValues = nvls.map(n => [maPN, n.MaNVL, 3000, 0]);
        await db.query(
            'INSERT INTO ChiTietPhieuNhap (MaPN, MaNVL, SoLuong, DonGia) VALUES ?',
            [detailsValues]
        );

        // 4. Cập nhật số lượng trong bảng chính (Sửa thành SoLuongTon)
        await db.query('UPDATE NguyenVatLieu SET SoLuongTon = SoLuongTon + 3000');

        console.log('--- KẾT QUẢ ---');
        console.log(`- Đã tạo Phiếu nhập kho số: #${maPN}`);
        console.log(`- Đã cộng thêm 3000 vào ${nvls.length} loại nguyên vật liệu.`);
        console.log('Cập nhật kho thành công!');
        process.exit();
    } catch (err) {
        console.error('Lỗi khi cập nhật kho:', err);
        process.exit(1);
    }
}

importAll();
