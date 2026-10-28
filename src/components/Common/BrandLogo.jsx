import React from 'react';

export default function BrandLogo({
  size = 36,
  showText = true,
  textColor = null,
  subtitle = null,
  className = '',
  onClick = null
}) {
  return (
    <div 
      className={`temfyla-brand-logo temfila-brand-logo ${className}`} 
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none'
      }}
    >
      <img
        src="/logo.png"
        alt="TemFyla Logo"
        style={{
          width: size,
          height: size,
          borderRadius: 9,
          objectFit: 'cover',
          boxShadow: '0 3px 10px rgba(124, 58, 237, 0.25)'
        }}
      />
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: size > 32 ? 22 : 18,
              fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.025em',
              color: textColor || 'inherit'
            }}
          >
            Tem<span style={{ 
              background: 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Fyla</span>
          </span>
          {subtitle && (
            <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
