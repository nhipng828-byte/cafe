const db = require('./config/db');

const userProducts = [
  { code: 'SP01', name: 'Ca phe den da' },
  { code: 'SP02', name: 'Ca phe den nong' },
  { code: 'SP03', name: 'Ca phe nau da' },
  { code: 'SP04', name: 'Ca phe nau nong' },
  { code: 'SP05', name: 'Bac siu da' },
  { code: 'SP06', name: 'Bac siu nong' },
  { code: 'SP07', name: 'Ca phe cot dua' },
  { code: 'SP08', name: 'Caramel trung ca phe' },
  { code: 'SP09', name: 'Espresso da' },
  { code: 'SP10', name: 'Espresso nong' },
  { code: 'SP11', name: 'Americano da' },
  { code: 'SP12', name: 'Americano nong' },
  { code: 'SP13', name: 'Cappuccino da' },
  { code: 'SP14', name: 'Cappuccino nong' },
  { code: 'SP15', name: 'Latte da' },
  { code: 'SP16', name: 'Latte nong' },
  { code: 'SP17', name: 'Mocha da' },
  { code: 'SP18', name: 'Mocha nong' },
  { code: 'SP19', name: 'Salted Latte da' },
  { code: 'SP20', name: 'Salted Latte nong' },
  { code: 'SP21', name: 'Khoai lang tim coffee nut' },
  { code: 'SP22', name: 'Quyt nha dam' },
  { code: 'SP23', name: 'Dua hat chia' },
  { code: 'SP24', name: 'Cu den chanh mat ong' },
  { code: 'SP25', name: 'Dua xoai hat chia' },
  { code: 'SP26', name: 'Sinh to bo xoai' },
  { code: 'SP27', name: 'Sua chua bo hat chia' },
  { code: 'SP28', name: 'Tra den macchiato' },
  { code: 'SP29', name: 'Tra xoai macchiato' },
  { code: 'SP30', name: 'Tra nhai oi hong' },
  { code: 'SP31', name: 'Tra Olong vai phuc bon tu' },
  { code: 'SP32', name: 'Tra quyt nha dam hat chia' },
  { code: 'SP33', name: 'Tra xoai nong' },
  { code: 'SP34', name: 'Tra hoa cuc tui loc' },
  { code: 'SP35', name: 'Tra Earl Grey tui loc' },
  { code: 'SP36', name: 'Chocolate nong' },
  { code: 'SP37', name: 'Chocolate da' },
  { code: 'SP38', name: 'Milkshake oi hong' },
  { code: 'SP39', name: 'Milkshake xoai' },
  { code: 'SP40', name: 'Milkshake phuc bon tu' },
  { code: 'SP41', name: 'Kieu mach cot dua khoai lang tim' },
  { code: 'SP42', name: 'Coldbrew' },
  { code: 'SP43', name: 'Coldbrew sua tuoi' },
  { code: 'SP44', name: 'Citrus Coldbrew' }
];

async function updateProducts() {
    try {
        for (let i = 0; i < userProducts.length; i++) {
            const p = userProducts[i];
            const maSP = i + 1; // Assuming IDs are 1-44
            await db.query('UPDATE SanPham SET MaCode = ?, TenSP = ? WHERE MaSP = ?', [p.code, p.name, maSP]);
        }
        console.log('Products updated with codes and names');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateProducts();
