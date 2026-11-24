import React from 'react';

export default function NotificationBanner({ message, onDismiss, compact }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: compact ? 16 : 84,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4000,
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '12px 22px',
        borderRadius: 14,
        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
        fontWeight: 800,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slide-in-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90vw'
      }}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        style={{
          color: 'white',
          background: 'rgba(0,0,0,0.2)',
          border: 'none',
          padding: '4px 10px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 700
        }}
      >
        OK
      </button>
    </div>
  );
}
