// src/components/Toast.jsx - Thông báo nổi khi thao tác hệ thống
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Toast({ type = 'success', message, onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#10b981" />,
    warning: <AlertTriangle size={18} color="#f59e0b" />,
    error: <XCircle size={18} color="#ef4444" />,
  };

  const borders = {
    success: '1px solid rgba(16, 185, 129, 0.4)',
    warning: '1px solid rgba(245, 158, 11, 0.4)',
    error: '1px solid rgba(239, 68, 68, 0.4)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        border: borders[type] || borders.success,
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        animation: 'slideUp 0.3s ease',
        maxWidth: '400px',
      }}
    >
      {icons[type]}
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc', flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
