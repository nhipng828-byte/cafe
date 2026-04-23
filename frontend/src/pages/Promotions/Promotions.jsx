import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Calendar, Percent, Save, X } from 'lucide-react';

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [formData, setFormData] = useState({
    tenKM: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    chietKhau: 0
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/promotions');
      const data = await response.json();
      setPromotions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const url = selectedPromo 
      ? `http://localhost:5000/api/promotions/${selectedPromo.MaKM}` 
      : 'http://localhost:5000/api/promotions';
    const method = selectedPromo ? 'PUT' : 'POST';

    // Auto-calculate status for backend (though we'll display it dynamically)
    const dataToSend = { ...formData, trangThai: 'Active' };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      if (response.ok) {
        alert(selectedPromo ? 'Cập nhật thành công!' : 'Thêm khuyến mại thành công!');
        setShowModal(false);
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa chương trình khuyến mại này?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/promotions/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Đã xóa thành công!');
        fetchPromotions();
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const openAdd = () => {
    setSelectedPromo(null);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 7);
    
    setFormData({
      tenKM: '',
      ngayBatDau: now.toISOString().slice(0, 16),
      ngayKetThuc: tomorrow.toISOString().slice(0, 16),
      chietKhau: 10
    });
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setSelectedPromo(promo);
    setFormData({
      tenKM: promo.TenKM,
      ngayBatDau: new Date(promo.NgayBatDau).toISOString().slice(0, 16),
      ngayKetThuc: new Date(promo.NgayKetThuc).toISOString().slice(0, 16),
      chietKhau: promo.ChietKhau
    });
    setShowModal(true);
  };

  const getStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now < startDate) return { text: 'Sắp diễn ra', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' };
    if (now > endDate) return { text: 'Đã kết thúc', color: '#F44336', bg: 'rgba(244, 67, 54, 0.1)' };
    return { text: 'Đang hoạt động', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)' };
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang nạp dữ liệu...</div>;

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý Khuyến mại</h1>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={20} /> Thêm chương trình mới
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Mã KM</th>
              <th>Tên chương trình</th>
              <th>Thời gian áp dụng</th>
              <th>Chiết khấu (%)</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có chương trình khuyến mại nào.</td></tr>
            ) : promotions.map(p => {
              const status = getStatus(p.NgayBatDau, p.NgayKetThuc);
              return (
                <tr key={p.MaKM}>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>KM{p.MaKM}</td>
                  <td style={{ fontWeight: '600' }}>{p.TenKM}</td>
                  <td style={{ fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} className="text-muted" />
                      {new Date(p.NgayBatDau).toLocaleString('vi-VN')} - {new Date(p.NgayKetThuc).toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td className="text-primary" style={{ fontWeight: '700', fontSize: '16px' }}>{p.ChietKhau}%</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: status.bg,
                      color: status.color
                    }}>
                      {status.text}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-outline" style={{ padding: '8px' }} onClick={() => openEdit(p)}><Edit size={18} /></button>
                      <button className="btn btn-outline text-danger" style={{ padding: '8px' }} onClick={() => handleDelete(p.MaKM)}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '500px', padding: '30px', background: 'var(--darker-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px' }}>{selectedPromo ? 'Chỉnh sửa khuyến mại' : 'Thêm khuyến mại mới'}</h2>
              <button className="btn" onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="mb-1 d-block" style={{ fontSize: '14px' }}>Tên chương trình</label>
                <input type="text" value={formData.tenKM} onChange={e => setFormData({...formData, tenKM: e.target.value})} required style={{ width: '100%' }} placeholder="Ví dụ: Giảm giá khai trương" />
              </div>
              <div className="grid-2 mb-3">
                <div>
                  <label className="mb-1 d-block" style={{ fontSize: '14px' }}>Từ ngày</label>
                  <input type="datetime-local" value={formData.ngayBatDau} onChange={e => setFormData({...formData, ngayBatDau: e.target.value})} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label className="mb-1 d-block" style={{ fontSize: '14px' }}>Đến ngày</label>
                  <input type="datetime-local" value={formData.ngayKetThuc} onChange={e => setFormData({...formData, ngayKetThuc: e.target.value})} required style={{ width: '100%' }} />
                </div>
              </div>
              <div className="mb-4">
                <label className="mb-1 d-block" style={{ fontSize: '14px' }}>Phần trăm chiết khấu (%)</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" max="100" value={formData.chietKhau} onChange={e => setFormData({...formData, chietKhau: e.target.value})} required style={{ width: '100%', paddingRight: '40px' }} />
                  <Percent size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary"><Save size={18} /> Lưu chương trình</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
