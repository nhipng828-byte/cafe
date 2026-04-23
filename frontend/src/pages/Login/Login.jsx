import React, { useState } from 'react';
import { Coffee, Lock, User, LogIn, ShoppingCart } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '123') {
      onLogin();
    } else {
      setError('Tài khoản hoặc mật khẩu không đúng!');
    }
  };

  return (
    <div className="login-container" style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4b3621 0%, #2c1e12 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'rgba(121, 85, 72, 0.1)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'rgba(121, 85, 72, 0.05)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }}></div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--primary-color)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 10px 20px rgba(121, 85, 72, 0.3)'
        }}>
          <Coffee size={40} color="#fff" />
        </div>

        <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>CAFE INN</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px', fontSize: '14px' }}>Chào mừng bạn quay trở lại!</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="mb-4">
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tài khoản</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'rgba(255,255,255,0.4)' }} />
              <input 
                type="text" 
                placeholder="Nhập tài khoản..." 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 15px 15px 45px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: 'rgba(255,255,255,0.4)' }} />
              <input 
                type="password" 
                placeholder="Nhập mật khẩu..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 15px 15px 45px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '20px', textAlign: 'center', background: 'rgba(255, 107, 107, 0.1)', padding: '10px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" style={{
            width: '100%',
            height: '55px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '10px'
          }}>
            ĐĂNG NHẬP <LogIn size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '15px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>HOẶC</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          </div>

          <button 
            type="button"
            className="btn btn-outline" 
            onClick={() => onLogin('cashier')}
            style={{
              width: '100%',
              height: '50px',
              fontSize: '15px',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <ShoppingCart size={18} /> MÀN HÌNH THU NGÂN
          </button>
        </form>

        <p style={{ marginTop: '30px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
          &copy; 2026 CAFE INN Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
