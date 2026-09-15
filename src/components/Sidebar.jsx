// src/components/Sidebar.jsx - Khớp 100% với Figma Báo cáo IoT PTIT
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getSocket } from '../services/socket';

export default function Sidebar() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    setIsConnected(socket.connected);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'grid_view' },
    { to: '/sensors', label: 'Data Sensor', icon: 'sensors' },
    { to: '/history', label: 'Active History', icon: 'history' },
    { to: '/profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 8px 28px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#af101a',
            fontSize: '26px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#af101a' }}>
            hub
          </span>
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#af101a', lineHeight: 1.2 }}>
            Admin
          </h1>
          <p style={{ fontSize: '12px', color: '#555f6f', marginTop: '2px' }}>
            Trung tâm điều khiển IoT
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 18px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#af101a' : '#555f6f',
              backgroundColor: isActive ? 'rgba(211, 47, 47, 0.08)' : 'transparent',
              borderLeft: isActive ? '4px solid #af101a' : '4px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Connection & Student Info */}
      <div
        style={{
          marginTop: 'auto',
          padding: '14px 16px',
          backgroundColor: '#f9f9ff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#555f6f' }}>
            Mạng Realtime
          </span>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: '#8a94a6' }}>
          <div>Broker: <b style={{ color: '#151c27' }}>Mosquitto :1883</b></div>
          <div>SV: <b style={{ color: '#af101a' }}>Dương Minh Thái</b></div>
        </div>
      </div>
    </aside>
  );
}
