import React, { useState, useEffect, useRef } from 'react';
import { Package, ArrowDownCircle, ArrowUpCircle, X, Plus, Trash2, Search, Truck, Edit2, Eye, EyeOff } from 'lucide-react';

// ===================== SEARCHABLE SELECT =====================
function SearchableSelect({ options, value, onChange, placeholder = 'Tìm hoặc chọn...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (opt) => {
    onChange(opt.value);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
          background: 'var(--input-bg, rgba(255,255,255,0.06))',
          border: '1px solid var(--border-color)',
          color: selected ? 'var(--text-color)' : 'var(--text-muted)',
          fontSize: '14px', userSelect: 'none'
        }}
      >
        <span>{selected ? selected.label : (value || placeholder)}</span>
        <span style={{ opacity: 0.5, fontSize: '10px' }}>▼</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 9999,
          background: 'var(--darker-bg, #1a1a2e)', border: '1px solid var(--border-color)',
          borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              autoFocus
              type="text"
              placeholder="Nhập để tìm..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'inherit', fontSize: '13px', padding: 0 }}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Không tìm thấy</div>
              : filtered.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer', fontSize: '14px',
                    background: String(opt.value) === String(value) ? 'rgba(255,107,107,0.15)' : 'transparent',
                    color: String(opt.value) === String(value) ? 'var(--primary-color)' : 'inherit',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = String(opt.value) === String(value) ? 'rgba(255,107,107,0.15)' : 'transparent'}
                >
                  {opt.label}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}


const formatCurrency = (num) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' đ';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN');
};

// ===================== MODAL XEM CHI TIẾT NHẬP KHO =====================
function ImportDetailModal({ receipt, onClose }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/inventory/imports/${receipt.MaPN}/details`)
      .then(r => r.json())
      .then(data => { setDetails(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [receipt.MaPN]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div className="glass-panel" style={{ width: '800px', padding: '30px', background: 'var(--darker-bg)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px' }}>Chi tiết phiếu nhập – PN{receipt.MaPN}</h2>
          <button className="btn" onClick={onClose}><X size={22} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mã phiếu:</span><div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>PN{receipt.MaPN}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Thời gian:</span><div style={{ fontWeight: '500' }}>{formatDate(receipt.NgayLap)}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Tên nhà cung cấp:</span><div style={{ fontWeight: '500' }}>{receipt.MaNCC || '---'}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mã nhân viên:</span><div style={{ fontWeight: '500' }}>NV{receipt.MaNV}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Tổng tiền:</span><div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--primary-color)' }}>{formatCurrency(receipt.TongTien)}</div></div>
        </div>

        <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Danh sách hàng nhập</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Đang tải chi tiết...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã NVL</th>
                <th>Tên NVL</th>
                <th>S.Lượng</th>
                <th>Đơn giá</th>
                <th>ĐVN</th>
                <th>Quy đổi</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {details.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Không có dữ liệu chi tiết</td></tr>
              ) : details.map((d, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>#{d.MaNVL}</td>
                  <td style={{ fontWeight: '500' }}>{d.TenNVL}</td>
                  <td style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{parseFloat(d.SoLuong).toString()}</td>
                  <td style={{ color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>{formatCurrency(d.DonGia)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{d.DonViNhap || '---'}</td>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{parseFloat(d.QuyDoi || 1).toString()}</td>
                  <td style={{ fontWeight: '600', color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>{formatCurrency(d.ThanhTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ===================== MODAL CHỈNH SỬA NHÀ CUNG CẤP =====================
function EditSupplierModal({ supplier, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    TenNCC: supplier.TenNCC,
    SDT: supplier.SDT || '',
    DiaChi: supplier.DiaChi || '',
    TrangThai: supplier.TrangThai
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/suppliers/${supplier.MaNCC}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Cập nhật thành công!');
        onSuccess();
      } else {
        alert('Lỗi khi cập nhật!');
      }
    } catch {
      alert('Không thể kết nối server!');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div className="glass-panel" style={{ width: '450px', padding: '30px', background: 'var(--darker-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px' }}>Chỉnh sửa Nhà cung cấp</h2>
          <button className="btn" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Tên nhà cung cấp</label>
            <input 
              type="text" 
              required
              value={formData.TenNCC} 
              onChange={e => setFormData({...formData, TenNCC: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Số điện thoại</label>
            <input 
              type="text" 
              value={formData.SDT} 
              onChange={e => setFormData({...formData, SDT: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Địa chỉ</label>
            <textarea 
              rows="3"
              value={formData.DiaChi} 
              onChange={e => setFormData({...formData, DiaChi: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Lưu thay đổi</button>
        </form>
      </div>
    </div>
  );
}

// ===================== MODAL TẠO PHIẾU NHẬP =====================
// ===================== MODAL TẠO PHIẾU NHẬP =====================
const UNIT_OPTIONS = [
  { value: 'thùng', label: 'thùng' },
  { value: 'can', label: 'can' },
  { value: 'chai', label: 'chai' },
  { value: 'lon', label: 'lon' },
  { value: 'túi', label: 'túi' },
  { value: 'gói', label: 'gói' },
  { value: 'hộp', label: 'hộp' },
  { value: 'kg', label: 'kg' },
  { value: 'lít', label: 'lít' },
  { value: 'gr', label: 'gr' },
  { value: 'ml', label: 'ml' },
];

function CreateImportModal({ materials, suppliers = [], onClose, onSuccess }) {
  const [supplier, setSupplier] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [rows, setRows] = useState([{ maNVL: '', soLuong: 1, donGia: 0 }]);
  const [showQuickSupplier, setShowQuickSupplier] = useState(false);
  const [newSupData, setNewSupData] = useState({ TenNCC: '', SDT: '', DiaChi: '' });
  const [lastCreatedSup, setLastCreatedSup] = useState(null);
  const [showQuickMaterial, setShowQuickMaterial] = useState(false);

  const total = rows.reduce((sum, r) => sum + (parseFloat(r.soLuong) || 0) * (parseFloat(r.donGia) || 0), 0);

  const addRow = () => setRows([...rows, { maNVL: '', soLuong: 1, donGia: 0 }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    const updated = [...rows];
    updated[i][field] = val;
    setRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Kiểm tra nhà cung cấp
    if (!supplier) return alert('Vui lòng chọn Nhà cung cấp!');

    // 2. Kiểm tra tính hợp lệ của từng dòng
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.maNVL) return alert(`Dòng #${i + 1}: Vui lòng chọn Nguyên vật liệu!`);
      if (!r.soLuong || parseFloat(r.soLuong) <= 0) return alert(`Dòng #${i + 1}: Số lượng phải lớn hơn 0!`);
      if (!r.donGia || parseFloat(r.donGia) < 0) return alert(`Dòng #${i + 1}: Đơn giá không được để trống!`);
    }

    try {
      const res = await fetch('http://localhost:5000/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maNV: 1,
          maNCC: supplier,
          chiTiet: rows.map(r => {
            const mat = materials.find(m => m.MaNVL === parseInt(r.maNVL));
            return {
              maNVL: parseInt(r.maNVL),
              soLuong: parseFloat(r.soLuong),
              donGia: parseFloat(r.donGia),
              dvn: r.dvn || (mat ? mat.DonViTinh : ''),
              quyDoi: parseFloat(r.quyDoi) || 1
            };
          })
        })
      });
      if (res.ok) {
        alert('Tạo phiếu nhập thành công! Tồn kho đã được cập nhật.');
        onSuccess();
      } else {
        alert('Lỗi khi tạo phiếu nhập!');
      }
    } catch {
      alert('Không thể kết nối server!');
    }
  };

  const handleQuickCreate = async (e) => {
    if (e) e.preventDefault();
    if (!newSupData.TenNCC) return alert('Vui lòng nhập tên nhà cung cấp!');
    try {
      const res = await fetch('http://localhost:5000/api/inventory/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupData)
      });
      if (res.ok) {
        const resData = await res.json();
        const justCreated = { ...newSupData, MaNCC: resData.maNCC };
        setLastCreatedSup(justCreated);
        setSupplier(newSupData.TenNCC);
        setSupplierPhone(newSupData.SDT);
        setShowQuickSupplier(false);
        setNewSupData({ TenNCC: '', SDT: '', DiaChi: '' });
        onSuccess(true); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedSup = suppliers.find(s => s.TenNCC === supplier && supplier !== '') || 
                    suppliers.find(s => s.SDT === supplierPhone && supplierPhone !== '');
  
  const displaySup = selectedSup || (lastCreatedSup && (lastCreatedSup.TenNCC === supplier || lastCreatedSup.SDT === supplierPhone) ? lastCreatedSup : null);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div className="glass-panel" style={{ width: '1050px', padding: '0', background: 'var(--darker-bg)', maxHeight: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Tạo phiếu nhập kho</h2>
          <button className="btn" onClick={onClose} style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
            
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <button type="button" className="btn btn-primary" style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 12px', fontSize: '11px', minWidth: 'auto', borderRadius: '6px', zIndex: 1 }} onClick={() => setShowQuickSupplier(true)}>
                <Plus size={14} style={{ marginRight: '4px' }} /> Thêm mới
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr 1.2fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Tên nhà cung cấp</label>
                  <SearchableSelect 
                    options={suppliers.map(s => ({ value: s.TenNCC, label: s.TenNCC }))}
                    value={supplier}
                    onChange={(val) => {
                      setSupplier(val);
                      const s = suppliers.find(x => x.TenNCC === val);
                      if (s) setSupplierPhone(s.SDT || '');
                    }}
                    placeholder="Tìm theo tên..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Số điện thoại</label>
                  <SearchableSelect 
                    options={suppliers.filter(s => s.SDT).map(s => ({ value: s.SDT, label: s.SDT }))}
                    value={supplierPhone}
                    onChange={(val) => {
                      setSupplierPhone(val);
                      const s = suppliers.find(x => x.SDT === val);
                      if (s) setSupplier(s.TenNCC);
                    }}
                    placeholder="Tìm theo SĐT..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                  <label style={{ fontSize: '11px', visibility: 'hidden', marginBottom: '8px' }}>LABEL</label>
                  {displaySup ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', height: '42px', background: 'rgba(255,255,255,0.03)', padding: '0 12px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <div style={{ whiteSpace: 'nowrap' }}><span style={{ color: 'var(--text-muted)' }}>Mã:</span> <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>NCC{displaySup.MaNCC}</span></div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{ color: 'var(--text-muted)' }}>Địa chỉ:</span> <span style={{ color: '#fff' }}>{displaySup.DiaChi || '---'}</span></div>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px', height: '42px', display: 'flex', alignItems: 'center' }}>Chưa chọn NCC</div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Danh sách hàng nhập ({rows.length})</h3>
              <button type="button" className="btn btn-primary" onClick={() => setShowQuickMaterial(true)} style={{ padding: '2px 10px', fontSize: '10px', minHeight: 'auto', borderRadius: '4px' }}>+ Thêm mới NVL</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rows.map((row, i) => {
                const mat = materials.find(m => m.MaNVL === parseInt(row.maNVL));
                return (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '0', left: '0', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '10px', padding: '2px 6px', borderBottomRightRadius: '8px' }}>#{i + 1}</div>
                    <div style={{ width: '120px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mã NVL</label>
                      <SearchableSelect
                        options={materials.map(m => ({ value: m.MaNVL, label: `NVL${m.MaNVL}` }))}
                        value={row.maNVL}
                        onChange={val => updateRow(i, 'maNVL', val)}
                        placeholder="Tìm mã..."
                      />
                    </div>
                    <div style={{ flex: '1', minWidth: '180px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tên nguyên vật liệu</label>
                      <SearchableSelect
                        options={materials.map(m => ({ value: m.MaNVL, label: m.TenNVL }))}
                        value={row.maNVL}
                        onChange={val => updateRow(i, 'maNVL', val)}
                        placeholder="Tìm tên..."
                      />
                    </div>
                    <div style={{ width: '90px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>S.Lượng</label>
                      <input type="number" min="0.001" step="0.001" value={row.soLuong} onChange={e => updateRow(i, 'soLuong', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ width: '130px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Đơn giá (VNĐ)</label>
                      <input type="number" min="0" value={row.donGia} onChange={e => updateRow(i, 'donGia', e.target.value)} style={{ width: '100%', padding: '8px' }} />
                    </div>
                    <div style={{ width: '100px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ĐVN</label>
                      <SearchableSelect
                        options={UNIT_OPTIONS}
                        value={row.dvn || ''}
                        onChange={val => updateRow(i, 'dvn', val)}
                        placeholder="thùng..."
                      />
                    </div>
                    <div style={{ width: '100px' }}>
                      <label style={{ fontSize: '11px', color: '#4ecdc4', display: 'block', marginBottom: '4px' }}>Quy đổi (? ĐVC)</label>
                      <input type="number" min="1" step="0.001" placeholder="1" value={row.quyDoi || ''} onChange={e => updateRow(i, 'quyDoi', e.target.value)} style={{ width: '100%', padding: '8px', borderColor: 'rgba(78,205,196,0.3)' }} />
                    </div>
                    <div style={{ width: '60px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ĐVC</label>
                      <div style={{ height: '38px', display: 'flex', alignItems: 'center', color: 'var(--secondary-color)', fontWeight: 'bold' }}>{mat ? mat.DonViTinh : '---'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Thành tiền</div>
                        <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatCurrency((parseFloat(row.soLuong) || 0) * (parseFloat(row.donGia) || 0))}</div>
                      </div>
                      {rows.length > 1 && (
                        <button type="button" className="btn" style={{ padding: '8px', color: 'var(--danger)', minWidth: 'auto' }} onClick={() => removeRow(i)}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <button type="button" className="btn btn-outline" style={{ borderStyle: 'dashed', marginTop: '10px', width: '100%' }} onClick={addRow}>
                <Plus size={16} /> Thêm dòng mới
              </button>
            </div>
          </div>

          <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '18px' }}>
              <span style={{ color: 'var(--text-muted)', marginRight: '10px' }}>Tổng tiền thanh toán:</span>
              <strong style={{ color: 'var(--primary-color)', fontSize: '24px' }}>{formatCurrency(total)}</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 40px', fontWeight: 'bold' }}>Xác nhận nhập kho</button>
            </div>
          </div>
        </form>

        {/* Quick Create Supplier Overlay */}
        {showQuickSupplier && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
            <div className="glass-panel" style={{ width: '400px', padding: '24px', background: 'var(--darker-bg)', border: '1px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '18px' }}>Thêm nhà cung cấp</h4>
                <button type="button" className="btn" onClick={() => setShowQuickSupplier(false)}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Mã nhà cung cấp</label>
                  <input type="text" readOnly value={`NCC${suppliers.length > 0 ? Math.max(...suppliers.map(s => s.MaNCC)) + 1 : 1}`} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', color: 'var(--primary-color)', fontWeight: 'bold', border: '1px solid var(--border-color)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Tên nhà cung cấp *</label>
                  <input type="text" placeholder="Nhập tên..." value={newSupData.TenNCC} onChange={e => setNewSupData({...newSupData, TenNCC: e.target.value})} style={{ width: '100%', padding: '10px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Số điện thoại</label>
                  <input type="text" placeholder="Nhập SĐT..." value={newSupData.SDT} onChange={e => setNewSupData({...newSupData, SDT: e.target.value})} style={{ width: '100%', padding: '10px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Địa chỉ</label>
                  <input type="text" placeholder="Nhập địa chỉ..." value={newSupData.DiaChi} onChange={e => setNewSupData({...newSupData, DiaChi: e.target.value})} style={{ width: '100%', padding: '10px' }} />
                </div>
                <button type="button" className="btn btn-primary" onClick={handleQuickCreate} style={{ width: '100%', marginTop: '10px', padding: '12px' }}>Tạo và chọn</button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Create Material Overlay */}
        {showQuickMaterial && (
          <MaterialModal 
            onClose={() => setShowQuickMaterial(false)} 
            onSuccess={(newMat) => {
              setShowQuickMaterial(false);
              onSuccess(true); 
              const maNVL = newMat.MaNVL || newMat.maNVL;
              if (newMat && maNVL) {
                const newRow = { maNVL: maNVL.toString(), soLuong: 1, donGia: 0 };
                const lastRow = rows[rows.length - 1];
                if (lastRow && !lastRow.maNVL) {
                  const updated = [...rows];
                  updated[rows.length - 1] = newRow;
                  setRows(updated);
                } else {
                  setRows([...rows, newRow]);
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

// ===================== MODAL TẠO PHIẾU XUẤT KHO =====================
function CreateExportModal({ materials, onClose, onSuccess }) {
  const [lyDo, setLyDo] = useState('');
  const [rows, setRows] = useState([{ maNVL: '', soLuong: 1 }]);

  const addRow = () => setRows([...rows, { maNVL: '', soLuong: 1 }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) => {
    const updated = [...rows];
    updated[i][field] = val;
    setRows(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validRows = rows.filter(r => r.maNVL && r.soLuong > 0);
    if (!lyDo || validRows.length === 0) return alert('Vui lòng nhập lý do và ít nhất 1 nguyên vật liệu!');
    
    try {
      const res = await fetch('http://localhost:5000/api/inventory/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maNV: 1, // Mặc định
          lyDo,
          chiTiet: validRows.map(r => ({
            maNVL: parseInt(r.maNVL),
            soLuong: parseFloat(r.soLuong)
          }))
        })
      });
      if (res.ok) {
        alert('Tạo phiếu xuất thành công! Tồn kho đã được cập nhật.');
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.message || 'Lỗi khi tạo phiếu xuất!');
      }
    } catch {
      alert('Không thể kết nối server!');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div className="glass-panel" style={{ width: '950px', padding: '0', background: 'var(--darker-bg)', maxHeight: '95vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Tạo phiếu xuất kho</h2>
          </div>
          <button className="btn" onClick={onClose} style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
            
            {/* Top Section: Lý do */}
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Lý do xuất kho</label>
                  <input 
                    type="text" 
                    placeholder="Nhập lý do xuất (vd: Hết hạn, hỏng, sử dụng...)" 
                    value={lyDo}
                    onChange={e => setLyDo(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Nhân viên thực hiện</label>
                  <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--secondary-color)', fontWeight: 'bold' }}>
                    NV1 - Admin
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách hàng */}
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>Danh sách hàng xuất ({rows.length})</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rows.map((row, i) => {
                const mat = materials.find(m => m.MaNVL === parseInt(row.maNVL));
                return (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', position: 'relative' }}>
                    
                    <div style={{ position: 'absolute', top: '0', left: '0', background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '10px', padding: '2px 6px', borderBottomRightRadius: '8px' }}>
                      #{i + 1}
                    </div>

                    {/* Mã NVL */}
                    <div style={{ width: '120px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mã NVL</label>
                      <SearchableSelect
                        options={materials.map(m => ({ value: m.MaNVL, label: `NVL${m.MaNVL}` }))}
                        value={row.maNVL}
                        onChange={val => updateRow(i, 'maNVL', val)}
                        placeholder="Tìm mã..."
                      />
                    </div>

                    {/* Tên NVL */}
                    <div style={{ flex: '1', minWidth: '180px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tên nguyên vật liệu</label>
                      <SearchableSelect
                        options={materials.map(m => ({ value: m.MaNVL, label: m.TenNVL }))}
                        value={row.maNVL}
                        onChange={val => updateRow(i, 'maNVL', val)}
                        placeholder="Tìm tên..."
                      />
                    </div>

                    {/* SL */}
                    <div style={{ width: '120px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Số lượng ({mat ? mat.DonViTinh : '?'})</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={row.soLuong} 
                        onChange={e => updateRow(i, 'soLuong', e.target.value)} 
                      />
                    </div>

                    <button type="button" className="btn btn-outline" onClick={() => removeRow(i)} style={{ padding: '8px', color: 'var(--error-color)', borderColor: 'rgba(255,107,107,0.2)' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}

              <button type="button" className="btn btn-outline" onClick={addRow} style={{ borderStyle: 'dashed', padding: '10px' }}>
                + Thêm nguyên vật liệu
              </button>
            </div>
          </div>

          {/* Fixed Footer */}
          <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 40px', fontWeight: 'bold', background: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }}>Xác nhận xuất kho</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== MODAL XEM CHI TIẾT XUẤT KHO =====================
function ExportDetailModal({ receipt, onClose }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      console.log('CLIENT: Fetching details for ID:', receipt.MaPXK);
      try {
        const res = await fetch(`http://localhost:5000/api/inventory/exports/${receipt.MaPXK}/details`);
        const data = await res.json();
        setDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [receipt.MaPXK]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
      <div className="glass-panel" style={{ width: '580px', padding: '30px', background: 'var(--darker-bg)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px' }}>Chi tiết phiếu xuất – PX{receipt.MaPXK}</h2>
          <button className="btn" onClick={onClose}><X size={22} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mã phiếu:</span><div style={{ fontWeight: 'bold', color: 'var(--secondary-color)' }}>PX{receipt.MaPXK}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Thời gian:</span><div style={{ fontWeight: '500' }}>{formatDate(receipt.NgayLap)}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Lý do:</span><div style={{ fontWeight: '500' }}>{receipt.LyDo || '---'}</div></div>
          <div><span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Mã nhân viên:</span><div style={{ fontWeight: '500' }}>NV{receipt.MaNV}</div></div>
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>Danh sách hàng xuất</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Đang tải chi tiết...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ background: 'transparent' }}>NGUYÊN VẬT LIỆU</th>
                <th style={{ background: 'transparent' }}>ĐVC</th>
                <th style={{ background: 'transparent', textAlign: 'right' }}>SỐ LƯỢNG XUẤT</th>
              </tr>
            </thead>
            <tbody>
              {details.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.TenNVL}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{item.DonViTinh}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--secondary-color)' }}>{parseFloat(item.SoLuong)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ===================== COMPONENT CHÍNH =====================
// ===================== MODAL THÊM/SỬA NGUYÊN VẬT LIỆU =====================
function MaterialModal({ material, onClose, onSuccess }) {
  const [formData, setFormData] = useState(material || {
    TenNVL: '',
    DonViTinh: '',
    SoLuongTon: 0,
    DonGiaTrungBinh: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.TenNVL || !formData.DonViTinh) return alert('Vui lòng điền đủ tên và đơn vị tính!');
    
    const url = material 
      ? `http://localhost:5000/api/inventory/materials/${material.MaNVL}`
      : 'http://localhost:5000/api/inventory/materials';
    const method = material ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenNVL: formData.TenNVL,
          donViTinh: formData.DonViTinh,
          soLuongTon: parseFloat(formData.SoLuongTon),
          donGiaTrungBinh: parseFloat(formData.DonGiaTrungBinh)
        })
      });
      if (res.ok) {
        const resData = await res.json();
        alert(material ? 'Cập nhật thành công!' : 'Thêm thành công!');
        onSuccess(resData); 
      }
    } catch {
      alert('Lỗi kết nối!');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
      <div className="glass-panel" style={{ width: '450px', padding: '30px', background: 'var(--darker-bg)' }}>
        <h2 className="mb-4">{material ? 'Chỉnh sửa nguyên vật liệu' : 'Thêm nguyên vật liệu mới'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Tên nguyên vật liệu</label>
            <input 
              type="text" 
              value={formData.TenNVL} 
              onChange={e => setFormData({...formData, TenNVL: e.target.value})} 
              style={{ width: '100%' }}
              placeholder="VD: Cà phê hạt"
            />
          </div>
          <div className="mb-4">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Đơn vị chuẩn</label>
            <input 
              type="text" 
              value={formData.DonViTinh} 
              onChange={e => setFormData({...formData, DonViTinh: e.target.value})} 
              style={{ width: '100%', opacity: material ? 0.6 : 1 }}
              placeholder="VD: kg, túi, hộp, gr, ml..."
              disabled={!!material}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Inventory({ mode = 'list' }) {
  const [materials, setMaterials] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImport, setSelectedImport] = useState(null);
  const [selectedExport, setSelectedExport] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showCreateImport, setShowCreateImport] = useState(false);
  const [showCreateExport, setShowCreateExport] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierTab, setSupplierTab] = useState('Active'); 
  const [importTab, setImportTab] = useState('HoanThanh'); // HoanThanh hoặc DaHuy
  const [exportTab, setExportTab] = useState('HoanThanh');

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const cancelReceipt = async (type, id) => {
    if (!window.confirm(`Bạn có chắc chắn muốn HỦY phiếu ${type === 'import' ? 'nhập' : 'xuất'} này? Hệ thống sẽ tự động hoàn lại số lượng tồn và đơn giá.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/${type === 'import' ? 'imports' : 'exports'}/${id}/cancel`, {
        method: 'PUT'
      });
      if (res.ok) {
        alert('Đã hủy phiếu thành công!');
        fetchData(true);
      } else {
        const err = await res.json();
        alert(err.message || 'Lỗi khi hủy phiếu!');
      }
    } catch {
      alert('Lỗi kết nối!');
    }
  };

  useEffect(() => { fetchData(); }, [mode]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (mode === 'list') {
        const res = await fetch('http://localhost:5000/api/inventory/materials');
        setMaterials(await res.json());
      } else if (mode === 'import') {
        const [matRes, importRes, supRes] = await Promise.all([
          fetch('http://localhost:5000/api/inventory/materials'),
          fetch('http://localhost:5000/api/inventory/imports'),
          fetch('http://localhost:5000/api/inventory/suppliers')
        ]);
        const mats = await matRes.json();
        const imports = await importRes.json();
        const sups = await supRes.json();
        setMaterials(mats);
        setSuppliers(Array.isArray(sups) ? sups : []);
        setImportHistory(Array.isArray(imports) ? imports : []);
      } else if (mode === 'export') {
        const [matRes, exportRes] = await Promise.all([
          fetch('http://localhost:5000/api/inventory/materials'),
          fetch('http://localhost:5000/api/inventory/exports')
        ]);
        const mats = await matRes.json();
        const exports = await exportRes.json();
        setMaterials(Array.isArray(mats) ? mats : []);
        setExportHistory(Array.isArray(exports) ? exports : []);
      } else if (mode === 'suppliers') {
        const res = await fetch('http://localhost:5000/api/inventory/suppliers');
        const data = await res.json();
        setSuppliers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang nạp dữ liệu kho...</div>;

  // ---- TỒN KHO ----
  if (mode === 'list') {
    const filteredMaterials = materials.filter(m => 
      m.TenNVL.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(m.MaNVL).includes(searchTerm)
    );

    return (
      <div style={{ userSelect: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            <Package size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />Quản Lý Kho
          </h1>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Tìm kiếm nguyên vật liệu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <button className="btn btn-primary" onClick={() => { setSelectedMaterial(null); setShowMaterialModal(true); }}>
              <Plus size={20} /> Thêm nguyên vật liệu
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <table className="data-table">
            <thead><tr><th>Mã NVL</th><th>Tên nguyên vật liệu</th><th>Đơn vị chuẩn</th><th>Số lượng tồn</th><th>Đơn giá TB</th><th>Giá trị tồn</th><th>Thao tác</th></tr></thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không tìm thấy nguyên vật liệu nào</td></tr>
              ) : filteredMaterials.map(m => (
                <tr key={m.MaNVL}>
                  <td style={{ color: 'var(--text-muted)' }}>#{m.MaNVL}</td>
                  <td style={{ fontWeight: '500' }}>{m.TenNVL}</td>
                  <td>{m.DonViTinh}</td>
                  <td className={m.SoLuongTon < 5 ? 'text-danger' : 'text-success'} style={{ fontWeight: '600' }}>{parseFloat(m.SoLuongTon).toString()}</td>
                  <td>{formatCurrency(m.DonGiaTrungBinh)}</td>
                  <td>{formatCurrency(m.SoLuongTon * m.DonGiaTrungBinh)}</td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => { setSelectedMaterial(m); setShowMaterialModal(true); }}>
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showMaterialModal && (
          <MaterialModal 
            material={selectedMaterial} 
            onClose={() => setShowMaterialModal(false)} 
            onSuccess={() => { setShowMaterialModal(false); fetchData(); }} 
          />
        )}
      </div>
    );
  }

    const toggleSupplierStatus = async (s) => {
    const newStatus = s.TrangThai === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/inventory/suppliers/${s.MaNCC}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...s, TrangThai: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (mode === 'suppliers') {
    const filteredSuppliers = suppliers.filter(s => s.TrangThai === supplierTab);

    return (
      <div style={{ userSelect: 'none' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          <Truck size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />Nhà cung cấp
        </h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setSupplierTab('Active')}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              background: supplierTab === 'Active' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
              color: supplierTab === 'Active' ? '#000' : '#fff',
              fontWeight: '600'
            }}
          >
            Đang hợp tác ({suppliers.filter(s => s.TrangThai === 'Active').length})
          </button>
          <button 
            onClick={() => setSupplierTab('Inactive')}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none',
              cursor: 'pointer',
              background: supplierTab === 'Inactive' ? 'var(--danger)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              fontWeight: '600'
            }}
          >
            Đã ẩn ({suppliers.filter(s => s.TrangThai === 'Inactive').length})
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã NCC</th>
                <th>Tên nhà cung cấp</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Không có nhà cung cấp nào trong mục này.</td></tr>
              ) : filteredSuppliers.map(s => (
                <tr key={s.MaNCC} style={{ opacity: s.TrangThai === 'Inactive' ? 0.7 : 1 }}>
                  <td style={{ color: 'var(--text-muted)' }}>NCC{s.MaNCC}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{s.TenNCC}</td>
                  <td>{s.SDT || '---'}</td>
                  <td>{s.DiaChi || '---'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button className="btn" onClick={() => setSelectedSupplier(s)} style={{ padding: '6px', minWidth: 'auto' }} title="Chỉnh sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn" onClick={() => toggleSupplierStatus(s)} style={{ padding: '6px', minWidth: 'auto', color: s.TrangThai === 'Active' ? 'var(--text-muted)' : 'var(--secondary-color)' }} title={s.TrangThai === 'Active' ? 'Ẩn nhà cung cấp' : 'Hiện nhà cung cấp'}>
                        {s.TrangThai === 'Active' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedSupplier && (
          <EditSupplierModal 
            supplier={selectedSupplier} 
            onClose={() => setSelectedSupplier(null)} 
            onSuccess={() => { setSelectedSupplier(null); fetchData(); }} 
          />
        )}
      </div>
    );
  }

  // ---- NHẬP KHO ----
  if (mode === 'import') return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <ArrowDownCircle size={24} style={{ marginRight: '10px', verticalAlign: 'middle', color: 'var(--primary-color)' }} />Nhập Kho
        </h1>
        <button className="btn btn-primary" style={{ padding: '10px 20px' }} onClick={() => setShowCreateImport(true)}>
          + Tạo phiếu nhập
        </button>
      </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setImportTab('HoanThanh')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: importTab === 'HoanThanh' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: importTab === 'HoanThanh' ? '#000' : '#fff', fontWeight: '600' }}
          >
            Lịch sử nhập ({importHistory.filter(r => r.TrangThai === 'HoanThanh' || !r.TrangThai).length})
          </button>
          <button 
            onClick={() => setImportTab('DaHuy')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: importTab === 'DaHuy' ? 'var(--danger)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '600' }}
          >
            Đã hủy ({importHistory.filter(r => r.TrangThai === 'DaHuy').length})
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <table className="data-table">
            <thead><tr><th>Mã PN</th><th>Thời gian</th><th>Nhà cung cấp</th><th>Mã NV</th><th>Tổng tiền</th><th>Thao tác</th></tr></thead>
            <tbody>
              {importHistory.filter(r => (importTab === 'HoanThanh' ? (r.TrangThai === 'HoanThanh' || !r.TrangThai) : r.TrangThai === 'DaHuy')).map(row => (
                <tr key={row.MaPN}>
                  <td style={{ fontWeight: 'bold', color: row.TrangThai === 'DaHuy' ? 'var(--text-muted)' : 'var(--primary-color)' }}>PN{row.MaPN}</td>
                  <td>{formatDate(row.NgayLap)}</td>
                  <td>{row.MaNCC || '---'}</td>
                  <td>NV{row.MaNV}</td>
                  <td style={{ fontWeight: '600' }}>{formatCurrency(row.TongTien)}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '6px' }} title="Xem chi tiết" onClick={() => setSelectedImport(row)}>
                      <Eye size={18} />
                    </button>
                    {importTab === 'HoanThanh' && (
                      <button className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Hủy phiếu" onClick={() => cancelReceipt('import', row.MaPN)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {showCreateImport && (
        <CreateImportModal 
          materials={materials} 
          suppliers={suppliers} 
          onClose={() => setShowCreateImport(false)} 
          onSuccess={(stayOpen) => { 
            fetchData(stayOpen); 
            if (!stayOpen) setShowCreateImport(false); 
          }} 
        />
      )}
      {selectedImport && (
        <ImportDetailModal receipt={selectedImport} onClose={() => setSelectedImport(null)} />
      )}
    </div>
  );

  // ---- XUẤT KHO ----
  if (mode === 'export') return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <ArrowUpCircle size={24} style={{ marginRight: '10px', verticalAlign: 'middle', color: 'var(--secondary-color)' }} />Xuất Kho
        </h1>
        <button className="btn btn-primary" style={{ padding: '10px 20px', background: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }} onClick={() => setShowCreateExport(true)}>
          + Tạo phiếu xuất
        </button>
      </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setExportTab('HoanThanh')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: exportTab === 'HoanThanh' ? 'var(--secondary-color)' : 'rgba(255,255,255,0.05)', color: exportTab === 'HoanThanh' ? '#000' : '#fff', fontWeight: '600' }}
          >
            Lịch sử xuất ({exportHistory.filter(r => r.TrangThai === 'HoanThanh' || !r.TrangThai).length})
          </button>
          <button 
            onClick={() => setExportTab('DaHuy')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: exportTab === 'DaHuy' ? 'var(--danger)' : 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '600' }}
          >
            Đã hủy ({exportHistory.filter(r => r.TrangThai === 'DaHuy').length})
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <table className="data-table">
            <thead><tr><th>Mã PX</th><th>Thời gian</th><th>Lý do</th><th>Mã nhân viên</th><th>Thao tác</th></tr></thead>
            <tbody>
              {exportHistory.filter(r => (exportTab === 'HoanThanh' ? (r.TrangThai === 'HoanThanh' || !r.TrangThai) : r.TrangThai === 'DaHuy')).map(row => (
                <tr key={row.MaPXK}>
                  <td style={{ fontWeight: 'bold', color: row.TrangThai === 'DaHuy' ? 'var(--text-muted)' : 'var(--secondary-color)' }}>PX{row.MaPXK}</td>
                  <td>{formatDate(row.NgayLap)}</td>
                  <td>{row.LyDo || 'Không có lý do'}</td>
                  <td>NV{row.MaNV}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '6px' }} title="Xem chi tiết" onClick={() => setSelectedExport(row)}>
                      <Eye size={18} />
                    </button>
                    {exportTab === 'HoanThanh' && (
                      <button className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }} title="Hủy phiếu" onClick={() => cancelReceipt('export', row.MaPXK)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {showCreateExport && (
        <CreateExportModal 
          materials={materials} 
          onClose={() => setShowCreateExport(false)} 
          onSuccess={() => { 
            fetchData(true); 
            setShowCreateExport(false); 
          }} 
        />
      )}
      {selectedExport && (
        <ExportDetailModal receipt={selectedExport} onClose={() => setSelectedExport(null)} />
      )}
    </div>
  );

  return null;
}
