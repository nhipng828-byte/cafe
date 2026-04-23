import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { Coffee, LayoutDashboard, Package, FileText, Users, ShoppingCart, Layout, Tag, ArrowDownCircle, ArrowUpCircle, Truck, PieChart, BarChart3, ClipboardList, LogOut } from 'lucide-react';
import Dashboard from './pages/Reports/Dashboard';
import RevenueProfitReport from './pages/Reports/RevenueProfitReport';
import TopProductsReport from './pages/Reports/TopProductsReport';
import InventoryReport from './pages/Reports/InventoryReport';
import POS from './pages/POS/POS';
import Inventory from './pages/Inventory/Inventory';
import Products from './pages/Products/Products';
import Categories from './pages/Products/Categories';
import Staff from './pages/Staff/Staff';
import Tables from './pages/Tables/Tables';
import Promotions from './pages/Promotions/Promotions';
import Invoices from './pages/POS/Invoices';
import Login from './pages/Login/Login';
import { TableProvider } from './context/TableContext';

function AppLayout({ children, onLogout, userRole }) {
  const [inventoryOpen, setInventoryOpen] = React.useState(false);
  const [productsOpen, setProductsOpen] = React.useState(false);
  const [reportsOpen, setReportsOpen] = React.useState(false);

  const isCashier = userRole === 'cashier';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Coffee size={28} color="var(--primary-color)" strokeWidth={2.5} />
          <span>CAFE INN</span>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {!isCashier && (
            <NavLink to="/reports" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
              <LayoutDashboard size={20} /> Tổng quan
            </NavLink>
          )}
          
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} end>
            <ShoppingCart size={20} /> Bán hàng (POS)
          </NavLink>
          
          <NavLink to="/invoices" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <FileText size={20} /> Hóa đơn
          </NavLink>
          
          {!isCashier && (
            <>
              <div 
                className="nav-link" 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setInventoryOpen(!inventoryOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Package size={20} /> Quản lý kho
                </div>
                <div style={{ transform: inventoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                  <ArrowDownCircle size={14} style={{ opacity: 0.5 }} />
                </div>
              </div>

              {inventoryOpen && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', margin: '0 10px 10px 10px' }}>
                  <NavLink to="/inventory" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <Package size={16} /> Nguyên vật liệu
                  </NavLink>
                  <NavLink to="/inventory-import" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <ArrowDownCircle size={16} /> Nhập kho
                  </NavLink>
                  <NavLink to="/inventory-export" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <ArrowUpCircle size={16} /> Xuất kho
                  </NavLink>
                  <NavLink to="/inventory-suppliers" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <Truck size={16} /> Nhà cung cấp
                  </NavLink>
                </div>
              )}

              <div 
                className="nav-link" 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setProductsOpen(!productsOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} /> Sản phẩm & Công thức
                </div>
                <div style={{ transform: productsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                  <ArrowDownCircle size={14} style={{ opacity: 0.5 }} />
                </div>
              </div>

              {productsOpen && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', margin: '0 10px 10px 10px' }}>
                  <NavLink to="/products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <FileText size={16} /> Sản phẩm
                  </NavLink>
                  <NavLink to="/products-categories" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <Layout size={16} /> Loại sản phẩm
                  </NavLink>
                </div>
              )}
            </>
          )}

          <NavLink to="/tables" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
            <Layout size={20} /> Quản lý bàn
          </NavLink>

          {!isCashier && (
            <>
              <NavLink to="/promotions" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <Tag size={20} /> Khuyến mại
              </NavLink>
              <NavLink to="/staff" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
                <Users size={20} /> Nhân viên
              </NavLink>

              <div 
                className="nav-link" 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setReportsOpen(!reportsOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BarChart3 size={20} /> Báo cáo
                </div>
                <div style={{ transform: reportsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                  <ArrowDownCircle size={14} style={{ opacity: 0.5 }} />
                </div>
              </div>

              {reportsOpen && (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', margin: '0 10px 10px 10px' }}>
                  <NavLink to="/reports/revenue" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <PieChart size={16} /> Doanh thu - Lợi nhuận
                  </NavLink>
                  <NavLink to="/reports/top-products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <BarChart3 size={16} /> Sản phẩm bán chạy
                  </NavLink>
                  <NavLink to="/reports/inventory" className={({isActive}) => isActive ? "nav-link active" : "nav-link"} style={{ paddingLeft: '40px', fontSize: '13px' }}>
                    <ClipboardList size={16} /> Báo cáo tồn kho
                  </NavLink>
                </div>
              )}
            </>
          )}
        </nav>
        
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            className="nav-link" 
            style={{ width: '100%', justifyContent: 'flex-start', color: '#ff6b6b', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onClick={onLogout}
          >
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const authStatus = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    if (authStatus === 'true') {
      setIsLoggedIn(true);
      setUserRole(role || 'admin');
    }
  }, []);

  const handleLogin = (role = 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      setIsLoggedIn(false);
      setUserRole('admin');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <TableProvider>
        <AppLayout onLogout={handleLogout} userRole={userRole}>
          <Routes>
            <Route path="/" element={<POS />} />
            <Route path="/reports" element={<Dashboard />} />
            <Route path="/reports/revenue" element={<RevenueProfitReport />} />
            <Route path="/reports/top-products" element={<TopProductsReport />} />
            <Route path="/reports/inventory" element={<InventoryReport />} />
            <Route path="/inventory" element={<Inventory mode="list" />} />
            <Route path="/inventory-import" element={<Inventory mode="import" />} />
            <Route path="/inventory-export" element={<Inventory mode="export" />} />
            <Route path="/inventory-suppliers" element={<Inventory mode="suppliers" />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products-categories" element={<Categories />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/promotions" element={<Promotions />} />
          </Routes>
        </AppLayout>
      </TableProvider>
    </Router>
  );
}

export default App;
