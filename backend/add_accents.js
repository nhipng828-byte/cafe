const db = require('./config/db');

const accentedNames = {
    1: 'Cà phê đen đá',
    2: 'Cà phê đen nóng',
    3: 'Cà phê nâu đá',
    4: 'Cà phê nâu nóng',
    5: 'Bạc sỉu đá',
    6: 'Bạc sỉu nóng',
    7: 'Cà phê cốt dừa',
    8: 'Caramel trứng cà phê',
    9: 'Espresso đá',
    10: 'Espresso nóng',
    11: 'Americano đá',
    12: 'Americano nóng',
    13: 'Cappuccino đá',
    14: 'Cappuccino nóng',
    15: 'Latte đá',
    16: 'Latte nóng',
    17: 'Mocha đá',
    18: 'Mocha nóng',
    19: 'Salted Latte đá',
    20: 'Salted Latte nóng',
    21: 'Khoai lang tím coffee nut',
    22: 'Quýt nha đam',
    23: 'Dứa hạt chia',
    24: 'Củ dền chanh mật ong',
    25: 'Dừa xoài hạt chia',
    26: 'Sinh tố bơ xoài',
    27: 'Sữa chua bơ hạt chia',
    28: 'Trà đen macchiato',
    29: 'Trà xoài macchiato',
    30: 'Trà nhài ổi hồng',
    31: 'Trà Olong vải phúc bồn tử',
    32: 'Trà quýt nha đam hạt chia',
    33: 'Trà xoài nóng',
    34: 'Trà hoa cúc túi lọc',
    35: 'Trà Earl Grey túi lọc',
    36: 'Chocolate nóng',
    37: 'Chocolate đá',
    38: 'Milkshake ổi hồng',
    39: 'Milkshake xoài',
    40: 'Milkshake phúc bồn tử',
    41: 'Kiều mạch cốt dừa khoai lang tím',
    42: 'Coldbrew',
    43: 'Coldbrew sữa tươi',
    44: 'Citrus Coldbrew'
};

async function addAccents() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        for (const [id, name] of Object.entries(accentedNames)) {
            await connection.query('UPDATE SanPham SET TenSP = ? WHERE MaSP = ?', [name, id]);
        }
        await connection.commit();
        console.log('Accents added successfully!');
        process.exit(0);
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

addAccents();
