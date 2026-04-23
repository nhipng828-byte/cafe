require('dotenv').config();
const db = require('./config/db');

async function seedFakeData() {
    try {
        const [products] = await db.query('SELECT MaSP, TenSP, DonGia FROM SanPham WHERE TrangThai = "Active"');
        if (products.length === 0) {
            console.log('Không có sản phẩm nào để tạo dữ liệu!');
            process.exit();
        }

        console.log(`Đang tạo dữ liệu cho ${products.length} sản phẩm...`);

        // Xóa hóa đơn cũ để làm sạch (nếu cần)
        // await db.query('DELETE FROM ChiTietHoaDon');
        // await db.query('DELETE FROM HoaDon');

        const numInvoices = 50; 
        const staffIds = [3, 4, 5, 6]; 

        for (let i = 0; i < numInvoices; i++) {
            // Ép ngày về múi giờ địa phương Việt Nam
            const randomDaysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - randomDaysAgo);
            
            // Định dạng YYYY-MM-DD HH:mm:ss cho MySQL
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            const ss = String(date.getSeconds()).padStart(2, '0');
            const thoiGian = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

            const maNV = staffIds[Math.floor(Math.random() * staffIds.length)];
            const phuongThuc = Math.random() > 0.3 ? 'Tiền mặt' : 'Chuyển khoản';
            
            const [hResult] = await db.query(
                'INSERT INTO HoaDon (ThoiGian, MaNV, TongTien, TienGiam, TienKhachTra, TrangThai, PhuongThuc) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [thoiGian, maNV, 0, 0, 0, 'DaThanhToan', phuongThuc]
            );
            const maHD = hResult.insertId;

            const shuffled = [...products].sort(() => 0.5 - Math.random());
            const numItems = Math.floor(Math.random() * 4) + 1;
            const itemsToBuy = shuffled.slice(0, numItems);

            let tongTien = 0;

            for (const product of itemsToBuy) {
                const soLuong = Math.floor(Math.random() * 3) + 1;
                const thanhTien = product.DonGia * soLuong;
                
                await db.query(
                    'INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong, DonGia) VALUES (?, ?, ?, ?)',
                    [maHD, product.MaSP, soLuong, product.DonGia]
                );
                
                tongTien += thanhTien;
            }

            await db.query(
                'UPDATE HoaDon SET TongTien = ?, TienKhachTra = ? WHERE MaHD = ?',
                [tongTien, tongTien, maHD]
            );
        }

        console.log(`--- HOÀN TẤT ---`);
        console.log(`- Đã tạo thành công 50 hóa đơn ảo.`);
        process.exit();
    } catch (err) {
        console.error('Lỗi khi tạo dữ liệu ảo:', err);
        process.exit(1);
    }
}

seedFakeData();
