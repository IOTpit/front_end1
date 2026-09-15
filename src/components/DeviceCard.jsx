// src/components/DeviceCard.jsx - Thẻ điều khiển thiết bị có hiệu ứng hoạt họa sống động
import React from 'react';
import { Fan, Lightbulb, Wind, Loader2, Power } from 'lucide-react';

const DEVICE_METADATA = {
  'Quạt': {
    name: 'Quạt làm mát',
    pin: 'D1 (GPIO5)',
    icon: Fan,
    getAnimClass: (isOn) => (isOn ? 'anim-fan-spinning' : ''),
    accentColor: '#06b6d4',
  },
  'Đèn': {
    name: 'Đèn chiếu sáng',
    pin: 'D2 (GPIO4)',
    icon: Lightbulb,
    getAnimClass: (isOn) => (isOn ? 'anim-bulb-on' : ''),
    accentColor: '#fbbf24',
  },
  'Điều hòa': {
    name: 'Điều hòa không khí',
    pin: 'D6 (GPIO12)',
    icon: Wind,
    getAnimClass: (isOn) => (isOn ? 'anim-ac-flow' : ''),
    accentColor: '#38bdf8',
  },
};

export default function DeviceCard({ deviceName, status, onToggle, loading }) {
  const meta = DEVICE_METADATA[deviceName] || {
    name: deviceName,
    pin: 'GPIO',
    icon: Power,
    getAnimClass: () => '',
    accentColor: '#6366f1',
  };

  const Icon = meta.icon;
  const isOn = status === 'ON';
  const animClass = meta.getAnimClass(isOn);

  return (
    <div
      className="glass-card glass-card-interactive"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        border: isOn ? `1px solid ${meta.accentColor}55` : '1px solid var(--border-subtle)',
        boxShadow: isOn ? `0 10px 30px -10px ${meta.accentColor}33` : 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Animated Icon Box */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: isOn ? `${meta.accentColor}22` : 'rgba(255, 255, 255, 0.04)',
              border: isOn ? `1px solid ${meta.accentColor}44` : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isOn ? meta.accentColor : 'var(--text-muted)',
              transition: 'all 0.3s ease',
            }}
          >
            <Icon size={26} className={animClass} />
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
              {meta.name}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Chân điều khiển: {meta.pin}
            </span>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isOn}
            disabled={loading}
            onChange={() => onToggle(deviceName, isOn ? 'OFF' : 'ON')}
          />
          <span className="toggle-slider" />
        </label>
      </div>

      {/* Footer Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning)' }}>
              <Loader2 size={14} className="anim-fan-spinning" />
              Đang gửi lệnh...
            </span>
          ) : (
            <span className={isOn ? 'badge badge-success' : 'badge badge-danger'}>
              {isOn ? 'Đang bật' : 'Đã tắt'}
            </span>
          )}
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          MQTT: device/control
        </span>
      </div>
    </div>
  );
}
