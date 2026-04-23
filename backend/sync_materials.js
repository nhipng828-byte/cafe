const db = require('./config/db');

async function syncMaterials() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lấy danh sách NVL hiện tại
        const [mats] = await connection.query('SELECT * FROM NguyenVatLieu');
        
        // Tạo bản đồ để gộp các tên trùng lặp (ưu tiên đơn vị gr cho các loại bột/hạt, ml cho chất lỏng)
        const nameMap = {}; // name -> MaNVL (cái giữ lại)
        const toDelete = [];
        
        for (const m of mats) {
            const name = m.TenNVL.trim();
            if (!nameMap[name]) {
                nameMap[name] = m.MaNVL;
            } else {
                // Trùng tên, cập nhật công thức trỏ về MaNVL cũ
                await connection.query('UPDATE CongThuc SET MaNVL = ? WHERE MaNVL = ?', [nameMap[name], m.MaNVL]);
                toDelete.push(m.MaNVL);
            }
        }

        // 2. Xóa các bản ghi trùng lặp
        if (toDelete.length > 0) {
            await connection.query('DELETE FROM NguyenVatLieu WHERE MaNVL IN (?)', [toDelete]);
        }

        // 3. Cập nhật đơn vị tính theo yêu cầu người dùng
        const unitFixes = [
            { name: 'Trân châu trắng', unit: 'gr' },
            { name: 'Sữa đặc', unit: 'ml' },
            { name: 'Đường', unit: 'ml' },
            { name: 'Richs', unit: 'ml' },
            { name: 'Xoài', unit: 'gr' },
            { name: 'Bột khoai lang tím', unit: 'gr' }
        ];

        for (const fix of unitFixes) {
            await connection.query('UPDATE NguyenVatLieu SET DonViTinh = ? WHERE TenNVL = ?', [fix.unit, fix.name]);
        }

        await connection.commit();
        console.log('Materials synchronized and duplicates merged.');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

syncMaterials();
