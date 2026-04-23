import React, { useState } from 'react';
import { Plus, Eye, EyeOff, Edit, X, Archive } from 'lucide-react';
import { useTables } from '../../context/TableContext';
import axios from 'axios';

export default function Tables() {
  const { tables, setTables, loading } = useTables();
  const [showModal, setShowModal] = useState(false);
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ TenBan: '' });

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pos/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/pos/tables/${id}/visibility`, { HienThi: !currentStatus });
      fetchTables();
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái hiển thị');
    }
  };

  const handleEdit = (table) => {
    setFormData({ TenBan: table.TenBan });
    setEditingId(table.MaBan);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/pos/tables/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/pos/tables', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ TenBan: '' });
      fetchTables();
    } catch (error) {
      alert('Lỗi khi lưu thông tin bàn');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải sơ đồ...</div>;

  const visibleTables = tables.filter(t => t.HienThi && !t.LaBanMangVe && t.TenBan !== 'Mang về');
  const hiddenTables = tables.filter(t => !t.HienThi && !t.LaBanMangVe && t.TenBan !== 'Mang về');

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý sơ đồ bàn</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setShowHiddenModal(true)} style={{ color: 'var(--text-muted)' }}>
            <Archive size={20} /> Bàn đã ẩn ({hiddenTables.length})
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingId(null); setFormData({ TenBan: '' }); setShowModal(true); }}>
            <Plus size={20} /> Thêm bàn mới
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {visibleTables.map(t => (
            <div key={t.MaBan} className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{t.TenBan}</div>
              <div style={{ fontSize: '12px', marginBottom: '20px', color: 'var(--success)' }}>● Đang hiển thị</div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn btn-outline" style={{ padding: '8px' }} title="Ẩn bàn" onClick={() => toggleVisibility(t.MaBan, t.HienThi)}>
                  <EyeOff size={16} />
                </button>
                <button className="btn btn-outline" style={{ padding: '8px' }} title="Sửa tên bàn" onClick={() => handleEdit(t)}>
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))}
          {visibleTables.length === 0 && <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Chưa có bàn nào được hiển thị</div>}
        </div>
      </div>

      {/* Modal Bàn đã ẩn */}
      {showHiddenModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '600px', padding: '30px', background: 'var(--darker-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Danh sách bàn đã ẩn</h2>
              <button className="btn" onClick={() => setShowHiddenModal(false)} style={{ padding: '5px', background: 'none' }}><X size={24} /></button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              {hiddenTables.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có bàn nào đang ẩn</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {hiddenTables.map(t => (
                    <div key={t.MaBan} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600' }}>{t.TenBan}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ padding: '6px' }} title="Hiện lại" onClick={() => toggleVisibility(t.MaBan, t.HienThi)}>
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '6px' }} title="Sửa" onClick={() => handleEdit(t)}>
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setShowHiddenModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '400px', padding: '30px', background: 'var(--darker-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{editingId ? 'Chỉnh sửa tên bàn' : 'Thêm bàn mới'}</h2>
              <button className="btn" onClick={() => setShowModal(false)} style={{ padding: '5px', background: 'none' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Tên bàn</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ví dụ: Bàn 21, Bàn VIP..." 
                  value={formData.TenBan} 
                  onChange={e => setFormData({ TenBan: e.target.value })} 
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
