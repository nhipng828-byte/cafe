import React, { useState, useEffect } from 'react';
import { ShoppingCart, Grid, Coffee, Search, Plus, Minus, Trash2, CreditCard, X, Tag, Banknote, Landmark, RefreshCw } from 'lucide-react';
import { useTables } from '../../context/TableContext';

const categories = ['Tất cả danh mục', 'Cà phê truyền thống', 'Cà phê máy', 'Nước ép & sinh tố', 'Trà lạnh', 'Trà nóng', 'Non-coffee', 'Coldbrew'];

export default function POS() {
  const { tables, setTables } = useTables();
  const [selectedTable, setSelectedTable] = useState(null);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả danh mục');
  const [view, setView] = useState('tables');
  const [loading, setLoading] = useState(true);
  const [showPromoSelect, setShowPromoSelect] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [currentStaff, setCurrentStaff] = useState('');
  
  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [customerPaid, setCustomerPaid] = useState('');
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    fetchData();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/staff');
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.value || []);
      setStaffList(list);
      if (list.length > 0) setCurrentStaff(list[0].MaNV);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchData = async () => {
    try {
      const prodRes = await fetch('http://localhost:5000/api/products?status=Active');
      const promoRes = await fetch('http://localhost:5000/api/promotions');
      const prodData = await prodRes.json();
      const promoData = await promoRes.json();
      
      const now = new Date();
      const activePromos = promoData.filter(p => {
        const start = new Date(p.NgayBatDau);
        const end = new Date(p.NgayKetThuc);
        return now >= start && now <= end;
      });

      setProducts(prodData);
      setPromotions(activePromos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const currentTableData = tables.find(t => t.MaBan === selectedTable);
  const cart = currentTableData?.Cart || [];
  const selectedPromo = currentTableData?.SelectedPromo || null;

  const addToCart = (product) => {
    if (selectedTable === null) return alert('Vui lòng chọn bàn trước!');
    if (currentTableData?.DaThanhToan) return;
    const newTables = tables.map(t => {
      if (t.MaBan === selectedTable) {
        const existing = t.Cart.find(i => i.MaSP === product.MaSP);
        let newCart;
        if (existing) {
          newCart = t.Cart.map(i => i.MaSP === product.MaSP ? { ...i, SoLuong: i.SoLuong + 1 } : i);
        } else {
          newCart = [...t.Cart, { ...product, SoLuong: 1 }];
        }
        return { ...t, Cart: newCart, TrangThai: 'DangPhucVu' };
      }
      return t;
    });
    setTables(newTables);
  };

  const updateQuantity = (productId, delta) => {
    if (currentTableData?.DaThanhToan) return;
    const newTables = tables.map(t => {
      if (t.MaBan === selectedTable) {
        const newCart = t.Cart.map(i => {
          if (i.MaSP === productId) {
            const newQty = Math.max(1, i.SoLuong + delta);
            return { ...i, SoLuong: newQty };
          }
          return i;
        });
        return { ...t, Cart: newCart };
      }
      return t;
    });
    setTables(newTables);
  };

  const removeFromCart = (productId) => {
    if (currentTableData?.DaThanhToan) return;
    const newTables = tables.map(t => {
      if (t.MaBan === selectedTable) {
        const newCart = t.Cart.filter(i => i.MaSP !== productId);
        return { ...t, Cart: newCart, TrangThai: newCart.length === 0 ? 'Trong' : 'DangPhucVu' };
      }
      return t;
    });
    setTables(newTables);
  };

  const applyPromotion = (promo) => {
    const newTables = tables.map(t => {
      if (t.MaBan === selectedTable) {
        return { ...t, SelectedPromo: promo };
      }
      return t;
    });
    setTables(newTables);
    setShowPromoSelect(false);
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.DonGia) * item.SoLuong), 0);
  const discountAmount = selectedPromo ? (subtotal * selectedPromo.ChietKhau / 100) : 0;
  const total = subtotal - discountAmount;
  const changeAmount = customerPaid ? (parseFloat(customerPaid) - total) : 0;

  const filteredProducts = products.filter(p => {
    const matchSearch = p.TenSP.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Tất cả danh mục' || p.Nhom === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleOpenCheckout = () => {
    if (cart.length === 0) return alert('Giỏ hàng trống!');
    setCustomerPaid(total.toString());
    setShowCheckoutModal(true);
  };

  const handleFinalCheckout = async () => {
    if (!currentStaff) return alert('Vui lòng chọn nhân viên lập hóa đơn!');
    const checkoutData = {
      maNV: currentStaff,
      maBan: selectedTable === 0 ? null : selectedTable,
      maKM: selectedPromo ? selectedPromo.MaKM : null,
      tongTien: subtotal,
      tienGiam: discountAmount,
      tienKhachTra: parseFloat(customerPaid) || total,
      phuongThuc: paymentMethod,
      chiTiet: cart.map(item => ({
        maSP: item.MaSP,
        soLuong: item.SoLuong,
        donGia: parseFloat(item.DonGia)
      }))
    };

    try {
      const response = await fetch('http://localhost:5000/api/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutData)
      });

      if (response.ok) {
        const result = await response.json();
        setPrintData({
          maHD: result.maHD,
          thoiGian: new Date().toLocaleString('vi-VN'),
          tenBan: currentTableData.TenBan,
          nhanVien: `NV${staffList.findIndex(s => s.MaNV == currentStaff) + 1}`,
          cart: [...cart],
          subtotal,
          discountAmount,
          total,
          paymentMethod,
          customerPaid: parseFloat(customerPaid) || total,
          changeAmount: (parseFloat(customerPaid) || total) - total
        });

        if (currentTableData.LaBanMangVe) {
          setTables(tables.map(t => t.MaBan === selectedTable ? { ...t, Cart: [], TrangThai: 'Trong', SelectedPromo: null, DaThanhToan: false } : t));
          setView('tables');
          setSelectedTable(null);
        } else {
          setTables(tables.map(t => t.MaBan === selectedTable ? { ...t, DaThanhToan: true } : t));
        }
        setShowCheckoutModal(false);
        
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        const errorData = await response.json();
        alert('Thanh toán thất bại: ' + (errorData.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Lỗi kết nối máy chủ!');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;

  return (
    <>
    <div className="pos-container" style={{ userSelect: 'none' }}>
      <div className="pos-menu glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className={`btn ${view === 'tables' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, height: '50px' }} onClick={() => setView('tables')}>
            <Grid size={20} /> PHÒNG / BÀN
          </button>
          <button className={`btn ${view === 'products' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, height: '50px' }} onClick={() => setView('products')}>
            <Coffee size={20} /> THỰC ĐƠN
          </button>
        </div>

        {view === 'tables' ? (
          <>
            <h3 className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              Trạng thái: [{tables.filter(t => t.TrangThai === 'DangPhucVu').length}/{tables.length}] bàn đang dùng
            </h3>
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
              {tables.filter(t => t.HienThi).map(t => (
                <div 
                  key={t.MaBan}
                  className={`product-card glass-panel ${selectedTable === t.MaBan ? 'active' : ''}`}
                  style={{ 
                    background: t.DaThanhToan ? 'var(--secondary-color)' : (t.TrangThai === 'DangPhucVu' ? 'var(--primary-color)' : ''),
                    height: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: t.DaThanhToan ? '2px solid #fff' : ''
                  }}
                  onClick={() => {
                    setSelectedTable(t.MaBan);
                    setView('products');
                  }}
                >
                  <div style={{ fontSize: t.LaBanMangVe ? '16px' : '20px', fontWeight: 'bold', color: (t.TrangThai === 'DangPhucVu' || t.DaThanhToan) ? '#fff' : '' }}>{t.TenBan}</div>
                  <div style={{ fontSize: '11px', color: (t.TrangThai === 'DangPhucVu' || t.DaThanhToan) ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                    {t.DaThanhToan ? 'Đã thanh toán' : (t.TrangThai === 'DangPhucVu' ? 'Chưa thanh toán' : 'Trống')}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--primary-color)', minWidth: '150px' }}>
                {selectedTable !== null ? `Đang chọn: ${tables.find(t => t.MaBan === selectedTable)?.TenBan}` : 'Xem thực đơn'}
              </div>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Tìm món..." style={{ paddingLeft: '40px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select style={{ width: '180px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="product-grid">
              {filteredProducts.map(p => (
                <div 
                  key={p.MaSP} 
                  className={`product-card glass-panel ${(!p.isAvailable || currentTableData?.DaThanhToan) ? 'sold-out' : ''}`} 
                  onClick={() => p.isAvailable && !currentTableData?.DaThanhToan && addToCart(p)}
                  style={{ 
                    position: 'relative', 
                    opacity: (p.isAvailable && !currentTableData?.DaThanhToan) ? 1 : 0.6,
                    cursor: (p.isAvailable && !currentTableData?.DaThanhToan) ? 'pointer' : 'not-allowed'
                  }}
                >
                  {!p.isAvailable && (
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      zIndex: 2,
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: '12px'
                    }}>
                      <span style={{ 
                        background: 'var(--danger)', 
                        color: '#fff', 
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                      }}>
                        HẾT HÀNG
                      </span>
                    </div>
                  )}
                  <div style={{ height: '70px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coffee size={28} color={p.isAvailable ? "var(--primary-color)" : "var(--text-muted)"} opacity={0.8}/>
                  </div>
                  <h4 style={{ fontSize: '12px', marginBottom: '4px' }}>{p.TenSP}</h4>
                  <p className="text-primary" style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    {new Intl.NumberFormat('vi-VN').format(parseFloat(p.DonGia))} đ
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pos-cart glass-panel" style={{ padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>Nhân viên đang bán:</label>
          <select 
            className="form-select" 
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(121, 85, 72, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-main)', opacity: currentTableData?.DaThanhToan ? 0.6 : 1, cursor: currentTableData?.DaThanhToan ? 'not-allowed' : 'pointer' }}
            value={currentStaff}
            onChange={(e) => !currentTableData?.DaThanhToan && setCurrentStaff(e.target.value)}
            disabled={currentTableData?.DaThanhToan}
          >
            {staffList.map(s => (
              <option key={s.MaNV} value={s.MaNV} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>
                {s.TenNV} - {s.ChucVu}
              </option>
            ))}
          </select>
        </div>

        <h3 className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={20} /> Hóa Đơn {selectedTable !== null ? `- ${tables.find(t => t.MaBan === selectedTable)?.TenBan}` : ''}
        </h3>
        <div className="cart-items mb-3" style={{ flex: 1, overflowY: 'auto' }}>
          {selectedTable === null ? (
             <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '100px' }}>Vui lòng chọn bàn ở tab <br/> <b>PHÒNG / BÀN</b></div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '100px' }}>Chưa có món nào.</div>
          ) : (
            cart.map(item => (
              <div key={item.MaSP} className="cart-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.TenSP}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Intl.NumberFormat('vi-VN').format(parseFloat(item.DonGia))} đ</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button className="btn btn-outline" style={{ padding: '2px', borderRadius: '50%' }} onClick={() => updateQuantity(item.MaSP, -1)}><Minus size={12} /></button>
                    <span style={{ width: '15px', textAlign: 'center', fontSize: '13px' }}>{item.SoLuong}</span>
                    <button className="btn btn-outline" style={{ padding: '2px', borderRadius: '50%' }} onClick={() => updateQuantity(item.MaSP, 1)}><Plus size={12} /></button>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', minWidth: '70px', textAlign: 'right' }}>
                    {new Intl.NumberFormat('vi-VN').format(parseFloat(item.DonGia) * item.SoLuong)} đ
                  </div>
                  <button className="btn" style={{ color: 'var(--danger)', padding: '0', background: 'transparent' }} onClick={() => removeFromCart(item.MaSP)}><Trash2 size={20} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
              <span>{new Intl.NumberFormat('vi-VN').format(subtotal)} đ</span>
            </div>
            {selectedPromo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#4CAF50' }}>
                <span>Khuyến mại ({selectedPromo.TenKM}):</span>
                <span>-{new Intl.NumberFormat('vi-VN').format(discountAmount)} đ</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>Tổng cộng:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{new Intl.NumberFormat('vi-VN').format(total)} đ</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: '0 0 50px', height: '50px', position: 'relative' }} 
                onClick={() => !currentTableData.DaThanhToan && setShowPromoSelect(!showPromoSelect)}
                title="Khuyến mại"
                disabled={currentTableData.DaThanhToan}
              >
                <Tag size={24} color={selectedPromo ? '#4CAF50' : 'currentColor'} />
                {selectedPromo && <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', background: '#4CAF50', borderRadius: '50%' }}></div>}
              </button>
              
              {currentTableData.DaThanhToan ? (
                <button 
                  className="btn" 
                  style={{ flex: 1, height: '50px', fontSize: '16px', background: '#4CAF50', color: '#fff', fontWeight: 'bold' }} 
                  onClick={() => {
                    if(window.confirm('Khách đã về, bạn muốn trả bàn về trạng thái TRỐNG?')) {
                      setTables(tables.map(t => t.MaBan === selectedTable ? { ...t, Cart: [], TrangThai: 'Trong', SelectedPromo: null, DaThanhToan: false } : t));
                      setSelectedTable(null);
                      setView('tables');
                    }
                  }}
                >
                  <RefreshCw size={20} className="mr-2" /> TRẢ BÀN
                </button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1, height: '50px', fontSize: '16px' }} onClick={handleOpenCheckout}>
                  <CreditCard size={20} /> Thanh Toán
                </button>
              )}
            </div>
          </div>
        )}

        {/* Promo Selection Modal */}
        {showPromoSelect && (
          <div className="glass-panel" style={{ position: 'absolute', bottom: '80px', left: '20px', right: '20px', padding: '15px', zIndex: 10, background: 'var(--darker-bg)', border: '1px solid var(--primary-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Chọn khuyến mại</span>
              <button onClick={() => setShowPromoSelect(false)}><X size={18}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              <button 
                className="btn btn-outline" 
                style={{ justifyContent: 'flex-start', fontSize: '13px', borderColor: !selectedPromo ? 'var(--primary-color)' : '' }}
                onClick={() => applyPromotion(null)}
              >
                Không áp dụng
              </button>
              {promotions.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>Không có khuyến mại khả dụng</div>
              ) : promotions.map(p => (
                <button 
                  key={p.MaKM} 
                  className="btn btn-outline" 
                  style={{ justifyContent: 'space-between', fontSize: '13px', borderColor: p.MaKM === selectedPromo?.MaKM ? 'var(--primary-color)' : '' }}
                  onClick={() => applyPromotion(p)}
                >
                  <span>{p.TenKM}</span>
                  <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>-{p.ChietKhau}%</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Final Checkout Modal */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '30px', background: 'var(--darker-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 style={{ fontSize: '20px' }}>Xác nhận thanh toán</h2>
              <button className="btn" onClick={() => setShowCheckoutModal(false)}><X size={24}/></button>
            </div>

            <div className="mb-4">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bàn đang dùng:</span>
                  <span style={{ fontWeight: 'bold' }}>{tables.find(t => t.MaBan === selectedTable)?.TenBan}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{new Intl.NumberFormat('vi-VN').format(total)} đ</span>
               </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 d-block" style={{ fontSize: '14px' }}>Phương thức thanh toán</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  className={`btn ${paymentMethod === 'Tiền mặt' ? 'btn-primary' : 'btn-outline'}`} 
                  style={{ gap: '8px' }}
                  onClick={() => setPaymentMethod('Tiền mặt')}
                >
                  <Banknote size={18} /> Tiền mặt
                </button>
                <button 
                  className={`btn ${paymentMethod === 'Chuyển khoản' ? 'btn-primary' : 'btn-outline'}`} 
                  style={{ gap: '8px' }}
                  onClick={() => setPaymentMethod('Chuyển khoản')}
                >
                  <Landmark size={18} /> Chuyển khoản
                </button>
              </div>
            </div>

            {paymentMethod === 'Tiền mặt' && (
              <div className="mb-4">
                <label className="mb-2 d-block" style={{ fontSize: '14px' }}>Số tiền khách trả (VNĐ)</label>
                <input 
                  type="number" 
                  value={customerPaid} 
                  onChange={(e) => setCustomerPaid(e.target.value)}
                  style={{ width: '100%', fontSize: '20px', fontWeight: 'bold', height: '50px' }}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tiền thừa trả khách:</span>
                  <span style={{ fontWeight: 'bold', color: changeAmount >= 0 ? '#4CAF50' : 'var(--danger)' }}>
                    {new Intl.NumberFormat('vi-VN').format(changeAmount)} đ
                  </span>
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', height: '60px', fontSize: '18px', marginTop: '10px' }}
              onClick={handleFinalCheckout}
              disabled={paymentMethod === 'Tiền mặt' && changeAmount < 0}
            >
              Xác nhận & In hóa đơn
            </button>
          </div>
        </div>
      )}
    </div>

    {/* MẪU HÓA ĐƠN IN (CHỈ HIỆN KHI IN) - ĐƯA RA NGOÀI CONTAINER CHÍNH */}
    {printData && (
      <div className="print-invoice">
        <div className="header">
          <h3 style={{ margin: 0, textTransform: 'uppercase' }}>CAFE INN</h3>
          <p style={{ margin: '4px 0', fontSize: '11px' }}>Địa chỉ: 19A Công Nữ Ngọc Hoa, phường Minh An, Hội An, Quảng Nam</p>
          <div className="dotted-line"></div>
          <h2 style={{ margin: '10px 0', fontSize: '18px' }}>HOÁ ĐƠN THANH TOÁN</h2>
        </div>
        
        <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mã HĐ: {printData.maHD}</span>
            <span>{printData.tenBan === 'Mang về' ? 'Mang về' : `Số bàn: ${printData.tenBan}`}</span>
          </div>
          <div>Thời gian: {printData.thoiGian}</div>
          <div style={{ textAlign: 'right', marginTop: '5px' }}>NV: {printData.nhanVien}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: '10%' }}>STT</th>
              <th style={{ width: '40%' }}>Tên sản phẩm</th>
              <th style={{ width: '15%' }}>Đơn giá</th>
              <th style={{ width: '10%' }}>SL</th>
              <th style={{ width: '25%' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {printData.cart.map((item, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>{item.TenSP}</td>
                <td style={{ textAlign: 'right' }}>{Math.round(item.DonGia).toLocaleString('vi-VN')}</td>
                <td style={{ textAlign: 'center' }}>{item.SoLuong}</td>
                <td style={{ textAlign: 'right' }}>{Math.round(item.DonGia * item.SoLuong).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tổng thành tiền:</span>
            <span style={{ textAlign: 'right' }}>{Math.round(printData.subtotal).toLocaleString('vi-VN')} đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Khuyến mại:</span>
            <span style={{ textAlign: 'right' }}>-{Math.round(printData.discountAmount).toLocaleString('vi-VN')} đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontWeight: 'bold' }}>
            <span>Tổng cộng:</span>
            <span style={{ textAlign: 'right' }}>{Math.round(printData.total).toLocaleString('vi-VN')} đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Phương thức thanh toán:</span>
            <span style={{ textAlign: 'right' }}>{printData.paymentMethod}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Tiền khách trả:</span>
            <span style={{ textAlign: 'right' }}>{Math.round(printData.customerPaid).toLocaleString('vi-VN')} đ</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Tiền thừa:</span>
            <span style={{ textAlign: 'right' }}>{Math.round(printData.changeAmount).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', fontStyle: 'italic' }}>
          Cảm ơn Quý khách. Hẹn gặp lại!
        </div>
      </div>
    )}
    </>
  );
}
