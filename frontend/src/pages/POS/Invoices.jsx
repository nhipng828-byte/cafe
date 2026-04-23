import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Calendar, User, Layout, CreditCard, Banknote, Landmark, Tag, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/invoices');
      console.log('Fetched invoices:', res.data);
      if (Array.isArray(res.data)) {
        setInvoices(res.data);
        setError(null);
      } else {
        setError('Dữ liệu trả về không đúng định dạng');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Không thể kết nối đến máy chủ: ' + error.message);
      setLoading(false);
    }
  };

  const fetchDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/invoices/${id}/details`);
      setInvoiceDetails(res.data);
      setShowDetails(true);
    } catch (error) {
      alert('Lỗi khi tải chi tiết hóa đơn');
    }
  };

  const handleShowDetails = (inv) => {
    setSelectedInvoice(inv);
    fetchDetails(inv.MaHD);
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.MaHD.toString().includes(searchTerm) || 
    (inv.TenBan && inv.TenBan.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (inv.TenNV && inv.TenNV.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPaymentIcon = (method) => {
    if (method === 'Chuyển khoản') return <Landmark size={14} style={{ marginRight: '5px' }} />;
    return <Banknote size={14} style={{ marginRight: '5px' }} />;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Lịch sử hóa đơn</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Tìm theo Mã HD, Bàn, Nhân viên..." 
              style={{ paddingLeft: '40px' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {error && (
          <div style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--primary-color)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--primary-color)' }}>
            ⚠️ {error}
          </div>
        )}
        
        <div style={{ marginBottom: '15px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Hiển thị <b>{filteredInvoices.length}</b> hóa đơn
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Mã HD</th>
              <th>Thời gian</th>
              <th>Bàn</th>
              <th>Tổng tiền</th>
              <th>Khách trả</th>
              <th>Phương thức</th>
              <th>Nhân viên</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && invoices.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy hóa đơn nào</td></tr>
            ) : filteredInvoices.map(inv => (
              <tr key={inv.MaHD}>
                <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>#{inv.MaHD}</td>
                <td style={{ fontSize: '13px' }}>{new Date(inv.ThoiGian).toLocaleString('vi-VN')}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '11px',
                    background: inv.MaBan ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                    color: inv.MaBan ? 'var(--secondary-color)' : 'var(--primary-color)'
                  }}>
                    {inv.TenBan || 'Mang về'}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold' }}>{new Intl.NumberFormat('vi-VN').format(inv.TongTien - inv.TienGiam)} đ</td>
                <td>{new Intl.NumberFormat('vi-VN').format(inv.TienKhachTra)} đ</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
                    {getPaymentIcon(inv.PhuongThuc)}
                    {inv.PhuongThuc || 'Tiền mặt'}
                  </div>
                </td>
                <td>{inv.TenNV || '---'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleShowDetails(inv)}>
                    <Eye size={14} style={{ marginRight: '6px' }} /> Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '500px', padding: '30px', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Chi tiết hóa đơn #{selectedInvoice.MaHD}</h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>{new Date(selectedInvoice.ThoiGian).toLocaleString('vi-VN')}</div>
              </div>
              <button className="btn" onClick={() => setShowDetails(false)} style={{ padding: '5px', background: 'none' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Layout size={14} color="var(--secondary-color)" /> <b>Vị trí:</b> {selectedInvoice.TenBan || 'Mang về'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={14} color="var(--secondary-color)" /> <b>NV bán:</b> {selectedInvoice.TenNV || '---'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={14} color="var(--primary-color)" /> <b>Thanh toán:</b> {selectedInvoice.PhuongThuc || 'Tiền mặt'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={14} color="var(--primary-color)" /> <b>Khuyến mại:</b> {selectedInvoice.TenKM || 'Không'}</div>
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ background: 'rgba(121, 85, 72, 0.05)', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px' }}>Món</th>
                    <th style={{ textAlign: 'center', padding: '10px' }}>SL</th>
                    <th style={{ textAlign: 'right', padding: '10px' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceDetails.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px' }}>{item.TenSP}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{item.SoLuong}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: '500' }}>{new Intl.NumberFormat('vi-VN').format(item.SoLuong * item.DonGia)} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: 'rgba(121, 85, 72, 0.03)', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                <span>Thực thu:</span>
                <span style={{ color: 'var(--primary-color)' }}>{new Intl.NumberFormat('vi-VN').format(selectedInvoice.TongTien - selectedInvoice.TienGiam)} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách đã trả:</span>
                <span>{new Intl.NumberFormat('vi-VN').format(selectedInvoice.TienKhachTra)} đ</span>
              </div>
            </div>

            <div style={{ marginTop: '25px', textAlign: 'right' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowDetails(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
