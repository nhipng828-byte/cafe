import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { TrendingUp, DollarSign, Receipt, AlertTriangle, Download, Printer } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (num) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' đ';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

export default function RevenueProfitReport() {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [groupBy, setGroupBy] = useState('day'); // 'day', 'month', 'year'
  const [summary, setSummary] = useState({
    doanhThu: 0,
    soHoaDon: 0,
    loiNhuan: 0,
    haoHut: 0
  });
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [groupBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const summaryRes = await fetch(`http://localhost:5000/api/reports/dashboard?fromDate=${dateRange.from}&toDate=${dateRange.to}`);
      const detailsRes = await fetch(`http://localhost:5000/api/reports/details?fromDate=${dateRange.from}&toDate=${dateRange.to}&groupBy=${groupBy}`);
      
      const summaryData = await summaryRes.json();
      const detailsData = await detailsRes.json();
      
      setSummary(summaryData);
      setDetails(detailsData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: details.map(d => d.Ngay),
    datasets: [
      {
        label: 'Doanh Thu',
        data: details.map(d => d.DoanhThu),
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.5)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Lợi Nhuận',
        data: details.map(d => d.LoiNhuan),
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.5)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#f5f6fa' } },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a4b0be', callback: (value) => value.toLocaleString() } },
      x: { grid: { display: false }, ticks: { color: '#a4b0be' } }
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang nạp báo cáo...</div>;

  const totalDoanhThu = details.reduce((sum, d) => sum + parseFloat(d.DoanhThu || 0), 0);
  const totalGiaVon = details.reduce((sum, d) => sum + parseFloat(d.GiaVon || 0), 0);

  const getGroupLabel = () => {
    if (groupBy === 'month') return 'Tháng';
    if (groupBy === 'year') return 'Năm';
    return 'Ngày';
  };

  return (
    <div style={{ userSelect: 'none' }} className="report-page">
      {/* PHẦN CHỈ HIỆN KHI IN (PRINT ONLY) ĐỒNG NHẤT VỚI CÁC BÁO CÁO KHÁC */}
      <div className="print-only" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>CAFE INN</h2>
          <p style={{ margin: '8px 0', fontSize: '12px', fontStyle: 'italic' }}>Địa chỉ: 19A Công Nữ Ngọc Hoa, phường Minh An, Hội An, Quảng Nam</p>
          <p style={{ margin: '8px 0', fontSize: '12px' }}>Hotline: 0962 744 613</p>
          <div style={{ position: 'absolute', right: 0, top: 0, fontSize: '11px', fontStyle: 'normal' }}>
            Ngày lập: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', margin: '20px 0 5px 0', textTransform: 'uppercase' }}>BÁO CÁO DOANH THU - LỢI NHUẬN</h1>
        <div style={{ textAlign: 'center', marginBottom: '25px', fontSize: '12px', display: 'flex', justifyContent: 'center', gap: '50px' }}>
          <span>Từ ngày: {formatDate(dateRange.from)}</span>
          <span>Đến ngày: {formatDate(dateRange.to)}</span>
          <span>Chế độ: Theo {getGroupLabel().toLowerCase()}</span>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Báo Cáo Doanh Thu - Lợi Nhuận</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn ${groupBy === 'day' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => setGroupBy('day')}>Theo Ngày</button>
            <button className={`btn ${groupBy === 'month' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => setGroupBy('month')}>Theo Tháng</button>
            <button className={`btn ${groupBy === 'year' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => setGroupBy('year')}>Theo Năm</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
          <h3 style={{ fontSize: '16px', margin: 0 }}>Chi Tiết Tổng Hợp {getGroupLabel()}</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th style={{ textAlign: 'center' }}>{getGroupLabel()}</th>
              <th style={{ textAlign: 'right' }}>Doanh Thu</th>
              <th style={{ textAlign: 'right' }}>Giá Vốn</th>
              <th style={{ textAlign: 'right' }}>Lợi Nhuận</th>
            </tr>
          </thead>
          <tbody>
            {details.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu trong khoảng thời gian này</td></tr>
            ) : (() => {
              // Gộp nhóm dữ liệu tại Frontend để đảm bảo tuyệt đối không lặp lại
              const aggregated = details.reduce((acc, curr) => {
                const dateObj = new Date(curr.Ngay);
                let key = '';
                if (isNaN(dateObj.getTime())) {
                  key = curr.Ngay;
                } else {
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const year = dateObj.getFullYear();
                  if (groupBy === 'month') key = `${month}/${year}`;
                  else if (groupBy === 'year') key = `${year}`;
                  else key = `${day}/${month}/${year}`;
                }

                if (!acc[key]) {
                  acc[key] = { Ngay: key, DoanhThu: 0, GiaVon: 0 };
                }
                acc[key].DoanhThu += Number(curr.DoanhThu || 0);
                acc[key].GiaVon += Number(curr.GiaVon || 0);
                return acc;
              }, {});

              return Object.values(aggregated).map((d, i) => {
                const currentLoiNhuan = d.DoanhThu - d.GiaVon;
                return (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ textAlign: 'center' }}>{d.Ngay}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(d.DoanhThu)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(d.GiaVon)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }} className="text-success">{formatCurrency(currentLoiNhuan)}</td>
                  </tr>
                );
              });
            })()}
            <tr style={{ fontWeight: 'bold' }} className="total-row">
              <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Tổng cộng:</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totalDoanhThu)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totalGiaVon)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(totalDoanhThu - totalGiaVon)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CHỮ KÝ CHO BẢN IN */}
      <div className="print-only footer-print" style={{ display: 'none', marginTop: '60px' }}>
        <div style={{ textAlign: 'center', width: '30%', marginLeft: 'auto' }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>Quản lý</p>
          <p style={{ fontStyle: 'italic', fontSize: '11px', margin: '5px 0 80px 0' }}>(ký, ghi rõ họ tên)</p>
        </div>
      </div>

      {/* CSS CHO PHẦN IN */}
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
          .data-table { width: 100% !important; border-collapse: collapse !important; color: black !important; font-size: 11px !important; }
          .data-table th, .data-table td { border: 1px solid #333 !important; padding: 8px 6px !important; color: black !important; background: white !important; }
          .data-table th { font-weight: bold !important; text-transform: none !important; background: #f9f9f9 !important; }
          .total-row td { font-weight: bold !important; background: white !important; }
          h1, h2, p, span { color: black !important; }
          .sidebar, .main-content { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
