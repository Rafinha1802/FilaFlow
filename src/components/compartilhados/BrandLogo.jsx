import React from 'react';

export default function BrandLogo({
  size = 36,
  showText = true,
  textColor = null,
  subtitle = null,
  className = '',
  onClick = null
}) {
  const isWhiteText = textColor === '#ffffff' || textColor === 'white';

  return (
    <div 
      className={`temfyla-brand-logo temfila-brand-logo ${className}`} 
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(8, Math.round(size * 0.28)),
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none'
      }}
    >
      {/* Icon Badge: Sem fundo preto, com contorno roxo vibrante da letra T */}
      <div
        className="temfyla-logo-badge"
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(8, Math.round(size * 0.28)),
          background: isWhiteText 
            ? 'rgba(139, 92, 246, 0.16)' 
            : 'rgba(124, 58, 237, 0.06)',
          border: '2px solid #8b5cf6',
          boxShadow: isWhiteText
            ? '0 0 16px rgba(168, 85, 247, 0.45)'
            : '0 2px 12px rgba(124, 58, 237, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: Math.max(3, Math.round(size * 0.12)),
          boxSizing: 'border-box',
          position: 'relative',
          flexShrink: 0,
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <img
          src="/temfyla-icon-purple-contour.png"
          alt="TemFyla Logo T"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.35))'
          }}
        />
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: size > 32 ? 22 : 18,
              fontWeight: 900,
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.025em',
              color: isWhiteText ? '#ffffff' : (textColor || '#0f172a'),
              display: 'inline-flex',
              alignItems: 'baseline'
            }}
          >
            Tem<span 
              style={{ 
                color: isWhiteText ? '#ffffff' : undefined,
                background: isWhiteText 
                  ? 'linear-gradient(135deg, #ffffff 0%, #ddd6fe 100%)' 
                  : 'linear-gradient(135deg, #9333ea 0%, #6366f1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: isWhiteText ? '0 0 14px rgba(192, 132, 252, 0.5)' : undefined
              }}
            >
              Fyla
            </span>
          </span>
          {subtitle && (
            <span style={{ fontSize: 10, color: isWhiteText ? '#cbd5e1' : '#94a3b8', fontWeight: 600 }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
