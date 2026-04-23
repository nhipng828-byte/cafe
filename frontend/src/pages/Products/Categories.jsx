import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, EyeOff, Eye, RefreshCw } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [showHidden]);

  const fetchCategories = async () => {
    try {
      const status = showHidden ? 'Inactive' : 'Active';
      const res = await fetch(`http://localhost:5000/api/categories?status=${status}`);
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return alert('Vui lòng nhập tên loại sản phẩm!');
    try {
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDM: newCategoryName })
      });
      if (res.ok) {
        setNewCategoryName('');
        setShowAddModal(false);
        fetchCategories();
      }
    } catch (error) {
      alert('Lỗi khi thêm danh mục');
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory.TenDM.trim()) return alert('Tên không được để trống!');
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${editingCategory.MaDM}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDM: editingCategory.TenDM, trangThai: 'Active' })
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      alert('Lỗi khi cập nhật');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn ẩn loại sản phẩm này?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      alert('Lỗi khi xóa');
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}/restore`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      alert('Lỗi khi khôi phục');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang nạp dữ liệu...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Quản lý Loại sản phẩm</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`btn ${showHidden ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setShowHidden(!showHidden)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {showHidden ? <Eye size={18} /> : <EyeOff size={18} />}
            {showHidden ? 'Xem loại đang dùng' : 'Xem loại đã ẩn'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Thêm loại mới
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>TÊN LOẠI SẢN PHẨM</th>
              <th style={{ width: '200px' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có danh mục nào.</td></tr>
            ) : categories.map(cat => (
              <tr key={cat.MaDM} style={{ opacity: showHidden ? 0.7 : 1 }}>
                <td style={{ color: 'var(--text-muted)' }}>#{cat.MaDM}</td>
                <td>
                  {editingCategory?.MaDM === cat.MaDM ? (
                    <input 
                      type="text" 
                      className="form-control"
                      value={editingCategory.TenDM}
                      onChange={(e) => setEditingCategory({ ...editingCategory, TenDM: e.target.value })}
                      autoFocus
                    />
                  ) : (
                    <span style={{ fontWeight: '600' }}>{cat.TenDM}</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {showHidden ? (
                      <button className="btn btn-outline" style={{ color: 'var(--primary-color)' }} onClick={() => handleRestore(cat.MaDM)}>
                        <RefreshCw size={16} /> Khôi phục
                      </button>
                    ) : (
                      editingCategory?.MaDM === cat.MaDM ? (
                        <>
                          <button className="btn btn-success" style={{ padding: '6px' }} onClick={handleUpdate}>
                            <Save size={16} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => setEditingCategory(null)}>
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => setEditingCategory(cat)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '6px', color: '#ff3232' }} onClick={() => handleDelete(cat.MaDM)}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(8px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div className="glass-panel" style={{ 
            width: '100%',
            maxWidth: '450px', 
            padding: '40px', 
            background: 'var(--darker-bg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--primary-color)' }}>Thêm loại sản phẩm mới</h2>
              <button className="btn" onClick={() => setShowAddModal(false)} style={{ padding: '5px', background: 'transparent' }}><X size={24}/></button>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>Tên loại sản phẩm</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="VD: Cà phê, Trà, Sinh tố..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
                style={{ fontSize: '16px', padding: '15px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn btn-outline" style={{ flex: 1, height: '48px' }} onClick={() => setShowAddModal(false)}>Hủy bỏ</button>
              <button className="btn btn-primary" style={{ flex: 1, height: '48px' }} onClick={handleAdd}>Lưu danh mục</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
