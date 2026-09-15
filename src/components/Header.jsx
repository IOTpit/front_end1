// src/components/Header.jsx - Header chính hiển thị thời gian thực và trạng thái
import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

export default function Header({ title, subtitle }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '28px',
      flexWrap: 'wrap',
      gap: '16px',
    }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* System Badge */}
        <div className="badge badge-success" style={{ padding: '6px 14px' }}>
          <ShieldCheck size={14} />
          <span>Hệ thống Hoạt động</span>
        </div>

        {/* Real-time Clock */}
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          color: 'var(--text-primary)',
          fontWeight: 500,
        }}>
          <Clock size={16} color="var(--primary)" />
          <span>{formattedTime}</span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formattedDate}</span>
        </div>
      </div>
    </header>
  );
}
