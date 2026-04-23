const db = require('./config/db');

const categoriesMap = {
  'Cà phê đen đá': 'Cà phê truyền thống',
  'Cà phê đen nóng': 'Cà phê truyền thống',
  'Cà phê nâu đá': 'Cà phê truyền thống',
  'Cà phê nâu nóng': 'Cà phê truyền thống',
  'Bạc xỉu đá': 'Cà phê truyền thống',
  'Bạc xỉu nóng': 'Cà phê truyền thống',
  'Cà phê cốt dừa': 'Cà phê truyền thống',
  'Caramel trứng cà phê': 'Cà phê truyền thống',
  'Espresso đá': 'Cà phê máy',
  'Espresso nóng': 'Cà phê máy',
  'Americano đá': 'Cà phê máy',
  'Americano nóng': 'Cà phê máy',
  'Cappuccino đá': 'Cà phê máy',
  'Cappuccino nóng': 'Cà phê máy',
  'Latte đá': 'Cà phê máy',
  'Latte nóng': 'Cà phê máy',
  'Mocha đá': 'Cà phê máy',
  'Mocha nóng': 'Cà phê máy',
  'Salted Latte đá': 'Cà phê máy',
  'Salted Latte nóng': 'Cà phê máy',
  'Khoai lang tím coffee nut': 'Non-coffee',
  'Quýt nha đam': 'Nước ép & sinh tố',
  'Dừa hạt chia': 'Nước ép & sinh tố',
  'Củ dền chanh mật ong': 'Nước ép & sinh tố',
  'Dừa xoài hạt chia': 'Nước ép & sinh tố',
  'Sinh tố bơ xoài': 'Nước ép & sinh tố',
  'Sữa chua bơ hạt chia': 'Nước ép & sinh tố',
  'Trà đen macchiato': 'Trà lạnh',
  'Trà xoài macchiato': 'Trà lạnh',
  'Trà nhài ổi hồng': 'Trà lạnh',
  'Trà Olong vải phúc bồn tử': 'Trà lạnh',
  'Trà quýt nha đam hạt chia': 'Trà lạnh',
  'Trà xoài nóng': 'Trà nóng',
  'Trà hoa cúc túi lọc': 'Trà nóng',
  'Trà Earl Grey túi lọc': 'Trà nóng',
  'Chocolate nóng': 'Non-coffee',
  'Chocolate đá': 'Non-coffee',
  'Milkshake ổi hồng': 'Non-coffee',
  'Milkshake xoài': 'Non-coffee',
  'Milkshake phúc bồn tử': 'Non-coffee',
  'Kiều mạch cốt dừa khoai lang tím': 'Non-coffee',
  'Coldbrew': 'Coldbrew',
  'Coldbrew sữa tươi': 'Coldbrew',
  'Citrus Coldbrew': 'Coldbrew'
};

async function updateCategories() {
    try {
        for (const [name, category] of Object.entries(categoriesMap)) {
            await db.query('UPDATE SanPham SET Nhom = ? WHERE TenSP = ?', [category, name]);
        }
        console.log('Product categories updated');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateCategories();
