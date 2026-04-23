import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    TenNV: '',
    SDT: '',
    ChucVu: 'Phục vụ'
  });

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaff(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resetForm = () => {
    setFormData({
      TenNV: '',
      SDT: '',
      ChucVu: 'Phục vụ'
    });
    setEditingId(null);
  };

  const handleEdit = (s) => {
    setFormData({
      TenNV: s.TenNV,
      SDT: s.SDT || '',
      ChucVu: s.ChucVu
    });
    setEditingId(s.MaNV);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/staff/${id}`);
        fetchStaff();
      } catch (error) {
        alert('Lỗi khi xóa nhân viên');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/staff/${editingId}`, formData);
        alert('Cập nhật nhân viên thành công!');
      } else {
        await axios.post('http://localhost:5000/api/staff', formData);
        alert('Thêm nhân viên mới thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      alert('Lỗi khi lưu thông tin nhân viên');
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Quản lý': return { bg: 'rgba(78, 205, 196, 0.2)', color: 'var(--secondary-color)' };
      case 'Thu ngân': return { bg: 'rgba(255, 107, 107, 0.2)', color: 'var(--primary-color)' };
      case 'Pha chế': return { bg: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f' };
      default: return { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý nhân viên</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <UserPlus size={20} /> Thêm nhân viên
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Mã NV</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Chức vụ</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu nhân viên</td></tr>
            ) : staff.map((s, index) => {
              const badge = getRoleBadgeStyle(s.ChucVu);
              return (
                <tr key={s.MaNV}>
                  <td style={{ fontWeight: '600', color: 'var(--primary-color)' }}>NV{index + 1}</td>
                  <td style={{ fontWeight: '500' }}>{s.TenNV}</td>
                  <td>{s.SDT || '---'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      background: badge.bg,
                      color: badge.color
                    }}>
                      {s.ChucVu}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => handleEdit(s)}><Edit size={16} /></button>
                      <button className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)' }} onClick={() => handleDelete(s.MaNV)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '30px', background: 'var(--darker-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h2>
              <button className="btn" onClick={() => setShowModal(false)} style={{ padding: '5px', background: 'none' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Họ và tên</label>
                <input type="text" required placeholder="Nhập tên nhân viên..." value={formData.TenNV} onChange={e => setFormData({...formData, TenNV: e.target.value})} />
              </div>
              <div className="mb-2">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Số điện thoại</label>
                <input type="text" placeholder="Nhập số điện thoại..." value={formData.SDT} onChange={e => setFormData({...formData, SDT: e.target.value})} />
              </div>
              <div className="mb-3">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Chức vụ</label>
                <select value={formData.ChucVu} onChange={e => setFormData({...formData, ChucVu: e.target.value})}>
                  <option value="Quản lý">Quản lý</option>
                  <option value="Thu ngân">Thu ngân</option>
                  <option value="Pha chế">Pha chế</option>
                  <option value="Phục vụ">Phục vụ</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu nhân viên</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
