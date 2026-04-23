const db = require('./config/db');

async function superImport() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Cập nhật giá nguyên liệu (Chuẩn hóa từ danh sách cost cũ)
        const materialPrices = [
            { name: 'Cà phê phin pha sẵn', price: 56.25 },
            { name: 'Đường', price: 14.4 },
            { name: 'Đường que', price: 600 },
            { name: 'Sữa đặc', price: 58 },
            { name: 'Sữa tươi', price: 29 },
            { name: 'Richs', price: 55.08 },
            { name: 'Cốt dừa', price: 62.5 },
            { name: 'Trứng', price: 3000 },
            { name: 'Sauce Caramel', price: 180 },
            { name: 'Mật ong', price: 58.3 },
            { name: 'Cà phê máy', price: 2025 },
            { name: 'Nước lọc', price: 0 },
            { name: 'Nước sôi', price: 0 },
            { name: 'Sauce Chocolate', price: 180 },
            { name: 'Salted foam', price: 40.12 },
            { name: 'Bột khoai lang tím', price: 560 },
            { name: 'Shott Hazelnut', price: 260 },
            { name: 'Quýt', price: 40 },
            { name: 'Thạch nha đam', price: 58 },
            { name: 'Cam sấy khô', price: 300 },
            { name: 'Lá húng', price: 50 },
            { name: 'Dứa', price: 46.67 },
            { name: 'Hạt chia', price: 21 },
            { name: 'Dứa sấy khô', price: 300 },
            { name: 'Củ dền', price: 42.85 },
            { name: 'Chanh', price: 60 },
            { name: 'Xoài', price: 50 },
            { name: 'Shott xoài', price: 216.65 },
            { name: 'Xoài decor', price: 50 },
            { name: 'Sữa chua', price: 50 },
            { name: 'Trà đen', price: 7.26 },
            { name: 'Trân châu trắng', price: 78.5 },
            { name: 'Foam', price: 40.12 },
            { name: 'Trà alishan', price: 37.5 },
            { name: 'Trà nhài', price: 19.45 },
            { name: 'Shott ổi hồng', price: 260 },
            { name: 'Shott tahitian', price: 260 },
            { name: 'Andros phúc bồn tử', price: 196 },
            { name: 'Vải lon', price: 186.96 },
            { name: 'Nha đam', price: 58 },
            { name: 'Trà hoa cúc', price: 2750 },
            { name: 'Trà Earl Grey', price: 2100 },
            { name: 'Bột cacao', price: 148 },
            { name: 'Coldbrew', price: 27.78 },
            { name: 'Thạch xoài', price: 34.83 },
            { name: 'Shott vải', price: 260 }
        ];

        for (const mp of materialPrices) {
            await connection.query('UPDATE NguyenVatLieu SET DonGiaTrungBinh = ? WHERE TenNVL = ?', [mp.price, mp.name]);
        }

        // 2. Xóa công thức cũ
        await connection.query('DELETE FROM CongThuc');

        // 3. Lấy bản đồ MaNVL
        const [mats] = await connection.query('SELECT MaNVL, TenNVL FROM NguyenVatLieu');
        const matMap = {};
        mats.forEach(m => matMap[m.TenNVL] = m.MaNVL);

        // 4. Định nghĩa công thức từ danh sách mới
        const recipesData = [
            { id: 1, items: [['Cà phê phin pha sẵn', 100], ['Đường', 40]] },
            { id: 2, items: [['Cà phê phin pha sẵn', 70], ['Đường que', 1]] },
            { id: 3, items: [['Cà phê phin pha sẵn', 40], ['Sữa đặc', 10]] },
            { id: 4, items: [['Cà phê phin pha sẵn', 80], ['Sữa đặc', 30]] },
            { id: 5, items: [['Cà phê phin pha sẵn', 40], ['Sữa đặc', 30], ['Sữa tươi', 10], ['Richs', 25]] },
            { id: 6, items: [['Cà phê phin pha sẵn', 40], ['Sữa đặc', 30], ['Sữa tươi', 10], ['Richs', 25]] },
            { id: 7, items: [['Cà phê phin pha sẵn', 30], ['Cốt dừa', 60], ['Sữa đặc', 20], ['Đường', 30], ['Richs', 10]] },
            { id: 8, items: [['Trứng', 2], ['Sauce Caramel', 10], ['Mật ong', 10], ['Cà phê phin pha sẵn', 40]] },
            { id: 9, items: [['Cà phê máy', 2], ['Đường', 25]] },
            { id: 10, items: [['Cà phê máy', 1], ['Đường que', 1]] },
            { id: 11, items: [['Cà phê máy', 2], ['Nước lọc', 80], ['Đường', 50]] },
            { id: 12, items: [['Cà phê máy', 1.5], ['Nước sôi', 120], ['Đường que', 1]] },
            { id: 13, items: [['Cà phê máy', 2], ['Sữa tươi', 150], ['Đường', 40]] },
            { id: 14, items: [['Cà phê máy', 1], ['Sữa tươi', 150], ['Đường que', 1]] },
            { id: 15, items: [['Cà phê máy', 1.5], ['Sữa tươi', 120], ['Đường', 20]] },
            { id: 16, items: [['Cà phê máy', 1], ['Sữa tươi', 150], ['Đường que', 1]] },
            { id: 17, items: [['Cà phê máy', 2], ['Sữa tươi', 150], ['Sauce Chocolate', 35], ['Đường', 20]] },
            { id: 18, items: [['Cà phê máy', 1], ['Sữa tươi', 170], ['Sauce Chocolate', 25], ['Đường que', 1]] },
            { id: 19, items: [['Cà phê máy', 1], ['Sữa tươi', 70], ['Salted foam', 150], ['Đường', 30]] },
            { id: 20, items: [['Cà phê máy', 1], ['Sữa tươi', 110], ['Salted foam', 90], ['Đường que', 1]] },
            { id: 21, items: [['Cà phê máy', 1], ['Sữa tươi', 140], ['Bột khoai lang tím', 5], ['Nước sôi', 30], ['Shott Hazelnut', 10], ['Đường que', 1]] },
            { id: 22, items: [['Quýt', 170], ['Thạch nha đam', 15], ['Nước lọc', 30], ['Đường', 50], ['Cam sấy khô', 3], ['Lá húng', 1]] },
            { id: 23, items: [['Dứa', 130], ['Hạt chia', 10], ['Nước lọc', 80], ['Đường', 50], ['Dứa sấy khô', 3], ['Lá húng', 1]] },
            { id: 24, items: [['Củ dền', 140], ['Chanh', 10], ['Mật ong', 25], ['Nước lọc', 30], ['Cam sấy khô', 3]] },
            { id: 25, items: [['Dứa', 130], ['Xoài', 10], ['Hạt chia', 30], ['Nước lọc', 30], ['Đường', 20], ['Xoài decor', 10], ['Lá húng', 1]] },
            { id: 26, items: [['Bơ', 40], ['Xoài', 50], ['Sữa đặc', 40], ['Sữa tươi', 30], ['Cốt dừa', 20], ['Đường', 10], ['Xoài decor', 10]] },
            { id: 27, items: [['Bơ', 30], ['Sữa chua', 50], ['Sữa đặc', 20], ['Sữa tươi', 50], ['Cốt dừa', 10], ['Đường', 20], ['Hạt chia', 20]] },
            { id: 28, items: [['Trà đen', 170], ['Đường', 30], ['Trân châu trắng', 30], ['Foam', 40]] },
            { id: 29, items: [['Trà alishan', 70], ['Nước lọc', 30], ['Xoài', 40], ['Shott xoài', 20], ['Thạch xoài', 60], ['Foam', 50], ['Đường', 30]] },
            { id: 30, items: [['Trà nhài', 150], ['Shott ổi hồng', 25], ['Shott tahitian', 5], ['Chanh', 5], ['Đường', 10], ['Cam sấy khô', 3], ['Lá húng', 1]] },
            { id: 31, items: [['Trà alishan', 40], ['Nước lọc', 60], ['Shott vải', 10], ['Andros phúc bồn tử', 15], ['Chanh', 5], ['Đường', 10], ['Vải lon', 30], ['Lá húng', 1]] },
            { id: 32, items: [['Trà nhài', 80], ['Quýt', 50], ['Nha đam', 30], ['Hạt chia', 10], ['Đường', 10], ['Cam sấy khô', 3]] },
            { id: 33, items: [['Trà alishan', 100], ['Nước sôi', 120], ['Shott xoài', 20], ['Đường', 10], ['Xoài', 20]] },
            { id: 34, items: [['Trà hoa cúc', 1], ['Nước sôi', 200], ['Mật ong', 50]] },
            { id: 35, items: [['Trà Earl Grey', 1], ['Nước sôi', 180], ['Sữa tươi', 70]] },
            { id: 36, items: [['Bột cacao', 10], ['Sauce Chocolate', 15], ['Sữa tươi', 80], ['Sữa đặc', 30], ['Richs', 20]] },
            { id: 37, items: [['Bột cacao', 10], ['Sauce Chocolate', 15], ['Sữa tươi', 60], ['Sữa đặc', 30], ['Richs', 10]] },
            { id: 38, items: [['Shott ổi hồng', 15], ['Sữa chua', 40], ['Sữa tươi', 30], ['Đường', 20]] },
            { id: 39, items: [['Shott xoài', 15], ['Sữa chua', 40], ['Sữa tươi', 40], ['Đường', 10]] },
            { id: 40, items: [['Andros phúc bồn tử', 20], ['Sữa chua', 40], ['Sữa tươi', 40], ['Đường', 10]] },
            { id: 41, items: [['Bột khoai lang tím', 10], ['Cốt dừa', 30], ['Sữa đặc', 30], ['Richs', 50], ['Đường', 20]] },
            { id: 42, items: [['Coldbrew', 150], ['Đường', 30]] },
            { id: 43, items: [['Coldbrew', 80], ['Sữa tươi', 60], ['Đường', 20]] },
            { id: 44, items: [['Coldbrew', 80], ['Shott tahitian', 5], ['Chanh', 5], ['Đường', 15], ['Cam sấy khô', 3]] },
        ];

        for (const r of recipesData) {
            for (const [matName, amount] of r.items) {
                const matId = matMap[matName];
                if (matId) {
                    await connection.query('INSERT INTO CongThuc (MaSP, MaNVL, DinhLuong) VALUES (?, ?, ?)', [r.id, matId, amount]);
                } else {
                    console.warn(`Material not found: ${matName}`);
                }
            }
        }

        await connection.commit();
        console.log('Super Import Done!');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

superImport();
