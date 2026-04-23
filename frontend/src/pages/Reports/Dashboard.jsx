import React, { useState } from 'react';
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
import { TrendingUp, DollarSign, Receipt, AlertTriangle } from 'lucide-react';

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

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Dữ liệu mẫu Doanh Thu
  const barData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Doanh Thu (VNĐ)',
        data: [1500000, 2300000, 1800000, 2900000, 3100000, 4500000, 4800000],
        backgroundColor: 'rgba(255, 107, 107, 0.7)',
        borderColor: '#ff6b6b',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Dữ liệu mẫu Top 5 Sản Phẩm Bán Chạy
  const topProductsData = {
    labels: ['Bạc xỉu đá', 'Cà phê muối', 'Trà thạch đào', 'Espresso', 'Nước ép cam'],
    datasets: [
      {
        label: 'Số lượng bán',
        data: [145, 120, 98, 85, 76],
        backgroundColor: 'rgba(78, 205, 196, 0.7)',
        borderColor: '#4ecdc4',
        borderWidth: 1,
        borderRadius: 4
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
      y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a4b0be' } },
      x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a4b0be' } }
    }
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Báo Cáo Doanh Thu</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="date" 
            value={dateRange.from} 
            onChange={(e) => setDateRange({...dateRange, from: e.target.value})} 
            style={{ width: 'auto' }}
          />
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>-</span>
          <input 
            type="date" 
            value={dateRange.to} 
            onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
            style={{ width: 'auto' }}
          />
          <button className="btn btn-primary">Lọc Dữ Liệu</button>
        </div>
      </div>

      <div className="grid-4 mb-3">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-title">Doanh Thu</span>
            <DollarSign color="var(--primary-color)" />
          </div>
          <span className="stat-value">20.9M</span>
          <span className="text-success" style={{ fontSize: '12px' }}>+12% so với tuần trước</span>
        </div>
        
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-title">Số Hóa Đơn</span>
            <Receipt color="var(--secondary-color)" />
          </div>
          <span className="stat-value">342</span>
          <span className="text-success" style={{ fontSize: '12px' }}>+5% so với tuần trước</span>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-title">Lợi Nhuận</span>
            <TrendingUp color="var(--success)" />
          </div>
          <span className="stat-value">11.0M</span>
          <span className="text-success" style={{ fontSize: '12px' }}>+15% so với tuần trước</span>
        </div>

        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-title">Hao Hụt NVL</span>
            <AlertTriangle color="var(--danger)" />
          </div>
          <span className="stat-value">450K</span>
          <span className="text-danger" style={{ fontSize: '12px' }}>+2% so với tuần trước</span>
        </div>
      </div>

      <div className="grid-2 mb-3">
        <div className="glass-panel" style={{ padding: '24px', height: '400px' }}>
          <h3 className="mb-2" style={{ fontSize: '16px' }}>Biểu Đồ Doanh Thu</h3>
          <div style={{ height: '320px' }}>
            <Bar data={barData} options={options} />
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', height: '400px' }}>
          <h3 className="mb-2" style={{ fontSize: '16px' }}>Top 5 Sản Phẩm Bán Chạy</h3>
          <div style={{ height: '320px' }}>
            <Bar data={topProductsData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}
