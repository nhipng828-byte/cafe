const db = require('./config/db');

async function importRecipes() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Thu thập tất cả NVL từ dữ liệu người dùng
        const materialsData = [
            { name: 'Cà phê phin pha sẵn', unit: 'ml', costPerUnit: 56.25 }, // 5.625 / 100 * 1000? No, let's look at numbers.
            // Wait, 100ml -> 5.625. If unit is ml, price is 0.05625. 
            // If I store in decimals, let's use the absolute value from user.
            { name: 'Đường', unit: 'ml', price: 14.4 }, // 576 / 40
            { name: 'Đường que', unit: 'que', price: 600 },
            { name: 'Sữa đặc', unit: 'ml', price: 58 }, // 580 / 10
            { name: 'Sữa tươi', unit: 'ml', price: 29 }, // 290 / 10
            { name: 'Richs', unit: 'ml', price: 55.08 }, // 1377 / 25
            { name: 'Cốt dừa', unit: 'ml', price: 62.5 }, // 3750 / 60
            { name: 'Trứng', unit: 'quả', price: 3000 },
            { name: 'Sauce Caramel', unit: 'ml', price: 180 },
            { name: 'Mật ong', unit: 'ml', price: 58.34 }, // 583 / 10
            { name: 'Cà phê máy', unit: 'shot', price: 2025 }, // 4050 / 2
            { name: 'Nước lọc', unit: 'ml', price: 0 },
            { name: 'Nước sôi', unit: 'ml', price: 0 },
            { name: 'Sauce Chocolate', unit: 'ml', price: 180 },
            { name: 'Salted foam', unit: 'ml', price: 40.12 }, // 6019 / 150
            { name: 'Bột khoai lang tím', unit: 'gr', price: 560 }, // 2800 / 5
            { name: 'Shott Hazelnut', unit: 'ml', price: 260 },
            { name: 'Quýt', unit: 'ml', price: 40 }, // 6800 / 170
            { name: 'Thạch nha đam', unit: 'gr', price: 58 }, // 870 / 15
            { name: 'Cam sấy khô', unit: 'gr', price: 300 }, // 900 / 3
            { name: 'Lá húng', unit: 'gr', price: 50 },
            { name: 'Dứa', unit: 'ml', price: 46.67 }, // 6067 / 130
            { name: 'Hạt chia', unit: 'gr', price: 21 }, // 210 / 10
            { name: 'Dứa sấy khô', unit: 'gr', price: 300 },
            { name: 'Củ dền', unit: 'ml', price: 42.86 }, // 6000 / 140
            { name: 'Chanh', unit: 'ml', price: 60 },
            { name: 'Xoài', unit: 'gr', price: 50 }, // 1000 / 20 or 2500 / 50 -> 50
            { name: 'Shott xoài', unit: 'ml', price: 216.65 }, // 4333 / 20
            { name: 'Xoài decor', unit: 'gr', price: 50 },
            { name: 'Sữa chua', unit: 'ml', price: 50 }, // 2500 / 50
            { name: 'Trà đen', unit: 'ml', price: 7.26 }, // 1235 / 170
            { name: 'Trân châu trắng', unit: 'ml', price: 78.5 }, // 2355 / 30
            { name: 'Foam', unit: 'ml', price: 40.12 }, // 1605 / 40
            { name: 'Trà alishan', unit: 'ml', price: 37.5 }, // 2625 / 70
            { name: 'Shott vải', unit: 'ml', price: 260 },
            { name: 'Thạch xoài', unit: 'gr', price: 34.83 }, // 2090 / 60
            { name: 'Trà nhài', unit: 'ml', price: 19.45 }, // 2917 / 150
            { name: 'Shott ổi hồng', unit: 'ml', price: 260 }, // 6500 / 25
            { name: 'Shott tahitian', unit: 'ml', price: 260 },
            { name: 'Andros phúc bồn tử', unit: 'gr', price: 196 }, // 2940 / 15
            { name: 'Vải lon', unit: 'gr', price: 186.97 }, // 5609 / 30
            { name: 'Nha đam', unit: 'gr', price: 58 },
            { name: 'Trà hoa cúc', unit: 'túi', price: 2750 },
            { name: 'Trà Earl Grey', unit: 'túi', price: 2100 },
            { name: 'Bột cacao', unit: 'gr', price: 148 },
            { name: 'Coldbrew', unit: 'ml', price: 27.78 }, // 4167 / 150
        ];

        // Thêm NVL vào bảng
        const matMap = {}; // name -> id
        for (const m of materialsData) {
            const [result] = await connection.query(
                'INSERT INTO NguyenVatLieu (TenNVL, DonViTinh, DonGiaTrungBinh, SoLuongTon) VALUES (?, ?, ?, 1000) ON DUPLICATE KEY UPDATE TenNVL=TenNVL',
                [m.name, m.unit, m.price]
            );
            // Lấy ID (nếu insert mới hoặc đã có)
            const [rows] = await connection.query('SELECT MaNVL FROM NguyenVatLieu WHERE TenNVL = ?', [m.name]);
            matMap[m.name] = rows[0].MaNVL;
        }

        const recipes = [
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

        // Xóa công thức cũ
        await connection.query('DELETE FROM CongThuc');

        // Thêm công thức mới
        for (const r of recipes) {
            for (const [matName, amount] of r.items) {
                const matId = matMap[matName];
                if (matId) {
                    await connection.query(
                        'INSERT INTO CongThuc (MaSP, MaNVL, DinhLuong) VALUES (?, ?, ?)',
                        [r.id, matId, amount]
                    );
                }
            }
        }

        await connection.commit();
        console.log('Successfully imported all recipes and materials!');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('Error during import:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

importRecipes();
