// src/components/MetricCard.jsx - Thẻ thông số cảm biến phong cách hiện đại
import React from 'react';
import { Thermometer, Droplets, Sun, ArrowUpRight } from 'lucide-react';

const SENSOR_CONFIG = {
  temperature: {
    title: 'Nhiệt độ phòng',
    unit: '°C',
    icon: Thermometer,
    color: 'var(--accent-temp)',
    gradient: 'var(--accent-temp-grad)',
    glow: 'rgba(255, 94, 98, 0.3)',
    maxVal: 50,
    getStatus: (val) => {
      if (val > 35) return { text: 'Nhiệt độ cao', class: 'badge-danger' };
      if (val < 18) return { text: 'Nhiệt độ thấp', class: 'badge-pending' };
      return { text: 'Lý tưởng', class: 'badge-success' };
    },
  },
  humidity: {
    title: 'Độ ẩm không khí',
    unit: '%',
    icon: Droplets,
    color: 'var(--accent-humid)',
    gradient: 'var(--accent-humid-grad)',
    glow: 'rgba(0, 198, 255, 0.3)',
    maxVal: 100,
    getStatus: (val) => {
      if (val > 80) return { text: 'Quá ẩm', class: 'badge-pending' };
      if (val < 40) return { text: 'Khô ráo', class: 'badge-pending' };
      return { text: 'Thoải mái', class: 'badge-success' };
    },
  },
  light: {
    title: 'Cường độ ánh sáng',
    unit: 'lux',
    icon: Sun,
    color: 'var(--accent-light)',
    gradient: 'var(--accent-light-grad)',
    glow: 'rgba(251, 191, 36, 0.3)',
    maxVal: 1000,
    getStatus: (val) => {
      if (val > 700) return { text: 'Rất sáng', class: 'badge-success' };
      if (val < 200) return { text: 'Ánh sáng yếu', class: 'badge-pending' };
      return { text: 'Đủ sáng', class: 'badge-success' };
    },
  },
};

export default function MetricCard({ type, value, time }) {
  const config = SENSOR_CONFIG[type] || SENSOR_CONFIG.temperature;
  const Icon = config.icon;
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const status = config.getStatus(numValue);
  const percentage = Math.min(100, Math.max(0, (numValue / config.maxVal) * 100));

  const formattedTime = time ? new Date(time).toLocaleTimeString('vi-VN') : '--:--:--';

  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: `3px solid ${config.color}`,
      }}
    >
      {/* Background Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: config.gradient,
        filter: 'blur(50px)',
        opacity: 0.15,
        pointerEvents: 'none',
      }} />

      {/* Top row: Title and Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {config.title}
        </span>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.color,
          boxShadow: `0 0 15px ${config.glow}`,
        }}>
          <Icon size={20} />
        </div>
      </div>

      {/* Metric Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
        <span style={{
          fontSize: '38px',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-1px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {numValue.toFixed(1)}
        </span>
        <span style={{ fontSize: '18px', fontWeight: 600, color: config.color }}>
          {config.unit}
        </span>
      </div>

      {/* Progress / Gauge Bar */}
      <div style={{
        height: '6px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: config.gradient,
          borderRadius: '4px',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>

      {/* Footer Info: Status Badge and Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
        <span className={`badge ${status.class}`}>
          {status.text}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
