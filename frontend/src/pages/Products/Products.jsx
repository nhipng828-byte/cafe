import React, { useState, useEffect } from 'react';
import { Coffee, Plus, Edit, Trash2, BookOpen, Save, X, EyeOff, Eye, RefreshCw } from 'lucide-react';

// Helper to format numbers cleanly (remove trailing .000)
const formatNumber = (num) => {
  if (num === null || num === undefined) return '';
  return parseFloat(num).toString();
};

const formatCurrency = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(Math.round(num));
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipe, setRecipe] = useState([]);
  const [showHidden, setShowHidden] = useState(false);

  // Form state for adding/editing product
  const [newProduct, setNewProduct] = useState({ TenSP: '', DonGia: '', MaDM: '' });

  useEffect(() => {
    fetchData();
  }, [showHidden]);

  const fetchData = async () => {
    try {
      const status = showHidden ? 'Inactive' : 'Active';
      const url = `http://localhost:5000/api/products?status=${status}`;
      const prodRes = await fetch(url);
      const matRes = await fetch('http://localhost:5000/api/inventory/materials');
      const catRes = await fetch('http://localhost:5000/api/categories');
      const prodData = await prodRes.json();
      const matData = await matRes.json();
      const catData = await catRes.json();
      setProducts(prodData);
      setMaterials(matData);
      setCategories(catData);
      if (!newProduct.MaDM && catData.length > 0) {
        setNewProduct(prev => ({ ...prev, MaDM: catData[0].MaDM }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.TenSP || !newProduct.DonGia) return alert('Vui lòng nhập đầy đủ tên và giá!');
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenSP: newProduct.TenSP,
          donGia: parseFloat(newProduct.DonGia),
          nhom: newProduct.Nhom
        })
      });
      if (response.ok) {
        alert('Thêm sản phẩm thành công!');
        setShowAddModal(false);
        setNewProduct({ TenSP: '', DonGia: '', MaDM: categories[0]?.MaDM || '' });
        fetchData();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const hideProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn ẩn sản phẩm này khỏi thực đơn?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Đã ẩn sản phẩm!');
        fetchData();
      }
    } catch (error) {
      console.error('Error hiding product:', error);
    }
  };

  const restoreProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/restore`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert('Đã khôi phục sản phẩm!');
        fetchData();
      }
    } catch (error) {
      console.error('Error restoring product:', error);
    }
  };

  const openEdit = async (p) => {
    setSelectedProduct(p);
    setNewProduct({ TenSP: p.TenSP, DonGia: p.DonGia, MaDM: p.MaDM || '' });
    setRecipe([]); 
    try {
      const res = await fetch(`http://localhost:5000/api/products/${p.MaSP}/recipe`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data);
      }
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setShowEditModal(true);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const prodRes = await fetch(`http://localhost:5000/api/products/${selectedProduct.MaSP}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenSP: newProduct.TenSP,
          donGia: parseFloat(newProduct.DonGia),
          maDM: newProduct.MaDM
        })
      });

      const recipeRes = await fetch(`http://localhost:5000/api/products/${selectedProduct.MaSP}/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: recipe.map(r => ({ maNVL: r.MaNVL, dinhLuong: parseFloat(r.DinhLuong) }))
        })
      });

      if (prodRes.ok && recipeRes.ok) {
        alert('Cập nhật thành công!');
        setShowEditModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Lỗi khi lưu dữ liệu!');
    }
  };

  const addIngredient = () => {
    if (materials.length === 0) return;
    setRecipe([...recipe, { 
      MaNVL: materials[0].MaNVL, 
      DinhLuong: 0, 
      TenNVL: materials[0].TenNVL, 
      DonViTinh: materials[0].DonViTinh,
      DonGiaTrungBinh: materials[0].DonGiaTrungBinh 
    }]);
  };

  const updateIngredient = (index, field, value) => {
    const newRecipe = [...recipe];
    if (field === 'MaNVL') {
      const mat = materials.find(m => m.MaNVL === parseInt(value));
      newRecipe[index] = { 
        ...newRecipe[index], 
        MaNVL: mat.MaNVL, 
        TenNVL: mat.TenNVL, 
        DonViTinh: mat.DonViTinh,
        DonGiaTrungBinh: mat.DonGiaTrungBinh
      };
    } else {
      newRecipe[index][field] = value;
    }
    setRecipe(newRecipe);
  };

  const removeIngredient = (index) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return recipe.reduce((sum, item) => sum + (parseFloat(item.DinhLuong || 0) * parseFloat(item.DonGiaTrungBinh || 0)), 0);
  };

  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const filteredProducts = products.filter(p => 
    selectedCategory === 'Tất cả' || p.MaDM === parseInt(selectedCategory)
  );

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang nạp dữ liệu...</div>;

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Sản phẩm & Công thức</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ 
              padding: '8px 15px', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              marginRight: '10px'
            }}
          >
            <option value="Tất cả" style={{ background: 'var(--darker-bg)' }}>Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.MaDM} value={cat.MaDM} style={{ background: 'var(--darker-bg)' }}>{cat.TenDM}</option>
            ))}
          </select>
          <button 
            className={`btn ${showHidden ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setShowHidden(!showHidden)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', height: '40px' }}
          >
            {showHidden ? <Eye size={18} /> : <EyeOff size={18} />}
            {showHidden ? 'Xem món đã ẩn' : 'Xem món đã ẩn'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', height: '40px' }}>
            <Plus size={20} /> Thêm sản phẩm mới
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>TÊN SẢN PHẨM</th>
              <th>DANH MỤC</th>
              <th style={{ width: '130px' }}>TRẠNG THÁI</th>
              <th style={{ width: '150px' }}>ĐƠN GIÁ</th>
              <th style={{ width: '120px' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{showHidden ? 'Không có món nào bị ẩn.' : 'Chưa có sản phẩm nào trong danh mục này.'}</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p.MaSP} style={{ opacity: showHidden ? 0.7 : 1 }}>
                <td style={{ color: 'var(--text-muted)' }}>#{p.MaSP}</td>
                <td style={{ fontWeight: '600' }}>{p.TenSP}</td>
                <td>{p.TenDM || '---'}</td>
                <td>
                  {p.isAvailable ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(76,175,80,0.1)', color: '#4CAF50', fontSize: '12px', fontWeight: 'bold' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4CAF50' }}></div> Còn hàng
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', background: 'rgba(244,67,54,0.1)', color: '#f44336', fontSize: '12px', fontWeight: 'bold' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f44336' }}></div> Hết hàng
                    </span>
                  )}
                </td>
                <td className="text-primary" style={{ fontWeight: '700' }}>
                  {formatCurrency(p.DonGia)} đ
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!showHidden ? (
                      <>
                        <button className="btn btn-outline" style={{ padding: '8px' }} title="Chỉnh sửa" onClick={() => openEdit(p)}>
                          <Edit size={18} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '8px', color: 'var(--danger)' }} title="Ẩn món" onClick={() => hideProduct(p.MaSP)}>
                          <EyeOff size={18} />
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-outline" style={{ padding: '8px', color: 'var(--primary-color)' }} title="Khôi phục" onClick={() => restoreProduct(p.MaSP)}>
                        <RefreshCw size={18} /> Khôi phục
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm sản phẩm */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '30px', background: 'var(--darker-bg)' }}>
            <h2 className="mb-3">Thêm sản phẩm mới</h2>
            <div className="mb-3">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tên sản phẩm</label>
              <input type="text" value={newProduct.TenSP} onChange={(e) => setNewProduct({...newProduct, TenSP: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div className="mb-3">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Đơn giá (VNĐ)</label>
              <input type="number" value={newProduct.DonGia} onChange={(e) => setNewProduct({...newProduct, DonGia: e.target.value})} style={{ width: '100%' }} />
            </div>
            <div className="mb-4">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Danh mục</label>
              <select value={newProduct.MaDM} onChange={(e) => setNewProduct({...newProduct, MaDM: e.target.value})} style={{ width: '100%' }}>
                {categories.map(c => <option key={c.MaDM} value={c.MaDM}>{c.TenDM}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleAddProduct}>Lưu sản phẩm</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa & Công thức */}
      {showEditModal && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '900px', padding: '30px', background: 'var(--darker-bg)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 className="mb-1">Chỉnh sửa: <span className="text-primary">{selectedProduct.TenSP}</span></h2>
              <button className="btn" onClick={() => setShowEditModal(false)}><X size={24}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tên sản phẩm</label>
                <input type="text" value={newProduct.TenSP} onChange={(e) => setNewProduct({...newProduct, TenSP: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Đơn giá (VNĐ)</label>
                <input type="number" value={formatNumber(newProduct.DonGia)} onChange={(e) => setNewProduct({...newProduct, DonGia: e.target.value})} style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Danh mục</label>
                <select value={newProduct.MaDM} onChange={(e) => setNewProduct({...newProduct, MaDM: e.target.value})} style={{ width: '100%' }}>
                  {categories.map(c => <option key={c.MaDM} value={c.MaDM}>{c.TenDM}</option>)}
                </select>
              </div>
            </div>

            <h3 className="mb-3" style={{ fontSize: '18px' }}>Định lượng nguyên liệu (Công thức)</h3>
            <table className="data-table mb-3">
              <thead>
                <tr>
                  <th>Nguyên vật liệu</th>
                  <th style={{ width: '120px' }}>Định lượng</th>
                  <th style={{ width: '80px' }}>ĐVT</th>
                  <th style={{ width: '120px' }}>Giá cost</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {recipe.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có công thức.</td></tr>
                ) : recipe.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select value={item.MaNVL} onChange={(e) => updateIngredient(index, 'MaNVL', e.target.value)} style={{ width: '100%' }}>
                        {materials.map(m => <option key={m.MaNVL} value={m.MaNVL}>{m.TenNVL}</option>)}
                      </select>
                    </td>
                    <td>
                      <input type="number" step="0.001" value={formatNumber(item.DinhLuong)} onChange={(e) => updateIngredient(index, 'DinhLuong', e.target.value)} style={{ width: '100%' }} />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.DonViTinh}</td>
                    <td className="text-success" style={{ fontWeight: '600' }}>
                      {formatCurrency(item.DinhLuong * item.DonGiaTrungBinh)} đ
                    </td>
                    <td><button className="btn text-danger" onClick={() => removeIngredient(index)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                  <td colSpan="3" style={{ textAlign: 'right' }}>TỔNG GIÁ COST:</td>
                  <td className="text-primary" style={{ fontSize: '16px' }}>{formatCurrency(calculateTotalCost())} đ</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={addIngredient}><Plus size={16} /> Thêm nguyên liệu</button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSaveProduct}><Save size={16} /> Lưu thay đổi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
