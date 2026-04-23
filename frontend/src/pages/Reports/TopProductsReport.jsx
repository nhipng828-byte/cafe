import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Trophy, Star, TrendingUp, Download, Filter, Printer } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TopProductsReport() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reports/top-products?fromDate=${dateRange.from}&toDate=${dateRange.to}`);
      const data = await res.json();
      // Đảm bảo dữ liệu luôn là mảng để không gây lỗi .map
      setTopProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const safeTopProducts = Array.isArray(topProducts) ? topProducts : [];
  
  const filteredProducts = safeTopProducts.filter(p => 
    p.TenSP && p.TenSP.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: filteredProducts.slice(0, 10).map(p => p.TenSP || 'Chưa rõ'),
    datasets: [
      {
        label: 'Số lượng đã bán',
        data: filteredProducts.slice(0, 10).map(p => p.TongSoLuong || 0),
        backgroundColor: 'rgba(78, 205, 196, 0.7)',
        borderColor: '#4ecdc4',
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(78, 205, 196, 0.9)',
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        titleColor: '#fff',
        bodyColor: '#4ecdc4',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a4b0be' } },
      y: { grid: { display: false }, ticks: { color: '#fff', font: { weight: '600' } } }
    }
  };

  const handleQuickFilter = (type) => {
    const now = new Date();
    let from, to;
    if (type === 'thisMonth') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = now;
    } else if (type === 'lastMonth') {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === 'thisYear') {
      from = new Date(now.getFullYear(), 0, 1);
      to = now;
    }
    const fromStr = from.getFullYear() + '-' + String(from.getMonth() + 1).padStart(2, '0') + '-' + String(from.getDate()).padStart(2, '0');
    const toStr = to.getFullYear() + '-' + String(to.getMonth() + 1).padStart(2, '0') + '-' + String(to.getDate()).padStart(2, '0');
    setDateRange({ from: fromStr, to: toStr });
    setTimeout(fetchData, 100);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang nạp báo cáo...</div>;

  const totalQtyAll = safeTopProducts.reduce((sum, p) => sum + parseFloat(p.TongSoLuong || 0), 0);

  return (
    <div style={{ userSelect: 'none' }} className="report-page">
      {/* PHẦN CHỈ HIỆN KHI IN (PRINT ONLY) ĐỒNG NHẤT VỚI BÁO CÁO TỒN KHO */}
      <div className="print-only" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>CAFE INN</h2>
          <p style={{ margin: '8px 0', fontSize: '12px', fontStyle: 'italic' }}>Địa chỉ: 19A Công Nữ Ngọc Hoa, phường Minh An, Hội An, Quảng Nam</p>
          <p style={{ margin: '8px 0', fontSize: '12px' }}>Hotline: 0962 744 613</p>
          <div style={{ position: 'absolute', right: 0, top: 0, fontSize: '11px', fontStyle: 'normal' }}>
            Ngày lập: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', margin: '20px 0 5px 0', textTransform: 'uppercase' }}>BÁO CÁO MÓN BÁN CHẠY</h1>
        <div style={{ textAlign: 'center', marginBottom: '25px', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '50px' }}>
          <span>Từ ngày: {formatDate(dateRange.from)}</span>
          <span>Đến ngày: {formatDate(dateRange.to)}</span>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Top Sản Phẩm Bán Chạy</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <input 
                type="text" 
                placeholder="Tìm tên món..." 
                style={{ paddingLeft: '35px', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Filter size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
            <input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange({...dateRange, from: e.target.value})} 
              style={{ width: 'auto' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
              style={{ width: 'auto' }}
            />
            <button className="btn btn-primary" onClick={fetchData}>Lọc</button>
          </div>
          <button className="btn btn-outline" onClick={() => window.print()} style={{ gap: '8px', color: 'var(--secondary-color)', borderColor: 'var(--secondary-color)' }}>
            <Printer size={18} /> Xuất Báo Cáo (In)
          </button>
        </div>
      </div>

      <div className="report-container glass-panel" style={{ padding: '24px' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', margin: 0 }}>Bảng Xếp Hạng Chi Tiết</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Xếp hạng</th>
              <th style={{ textAlign: 'left', width: '300px' }}>Tên sản phẩm</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Số lượng</th>
              <th style={{ width: '120px', textAlign: 'center' }}>Tỷ trọng</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy sản phẩm phù hợp</td></tr>
            ) : filteredProducts.map((p, i) => {
              const percentage = ((p.TongSoLuong / (totalQtyAll || 1)) * 100).toFixed(1);
              return (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ fontWeight: '600' }}>{p.TenSP}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{p.TongSoLuong}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px' }}>{percentage}%</span>
                    </div>
                    <span className="print-only" style={{ display: 'none' }}>{percentage}%</span>
                  </td>
                </tr>
              );
            })}
            <tr style={{ fontWeight: 'bold' }} className="total-row">
              <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Tổng cộng:</td>
              <td style={{ textAlign: 'center' }}>{totalQtyAll}</td>
              <td style={{ textAlign: 'center' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CHỮ KÝ CHO BẢN IN THEO MẪU */}
      <div className="print-only footer-print" style={{ display: 'none', marginTop: '60px' }}>
        <div style={{ textAlign: 'center', width: '30%', marginLeft: 'auto' }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>Quản lý</p>
          <p style={{ fontStyle: 'italic', fontSize: '11px', margin: '5px 0 80px 0' }}>(ký, ghi rõ họ tên)</p>
        </div>
      </div>

      {/* CSS CHO PHẦN IN THEO MẪU */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 1.5cm 1.2cm; }
          body * { visibility: hidden; }
          .report-page, .report-page * { visibility: visible; }
          .report-page { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; font-family: "Times New Roman", Times, serif; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .footer-print { display: flex !important; }
          .glass-panel { background: none !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
          .data-table { width: 100% !important; border-collapse: collapse !important; color: black !important; font-size: 12px !important; }
          .data-table th, .data-table td { border: 1px solid #333 !important; padding: 10px 6px !important; color: black !important; background: white !important; }
          .data-table th { font-weight: bold !important; text-transform: none !important; background: #f9f9f9 !important; }
          .total-row td { font-weight: bold !important; background: white !important; }
          .stt-cell, .in-cell, .out-cell, .end-cell, .value-cell { color: black !important; }
          h1, h2, p, span { color: black !important; }
          .sidebar, .main-content { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
