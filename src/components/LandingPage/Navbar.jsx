import React from 'react';
import { Building2, Stethoscope } from 'lucide-react';

export default function Navbar({
  isAuthenticated,
  isProfessionalAuthenticated,
  activeProfessional,
  currentUser,
  onGoToLanding,
  onOpenDashboard,
  onOpenClient,
  onOpenPricing,
  onOpenProfessional,
  onLogout
}) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="ff-header">
      <div className="ff-header-inner">
        {/* Logo */}
        <div className="ff-logo-group" onClick={onGoToLanding} title="Página Inicial TemFyla">
          <div className="ff-logo-mark">
            <img src="/temfyla-icon.png" alt="TemFyla Logo" className="ff-logo-img" />
          </div>
          <span className="ff-logo-text">
            Tem<span>Fyla</span>
          </span>
        </div>

        {/* Public Landing Navigation Links */}
        <nav className="ff-nav-links">
          <button
            className="ff-nav-link"
            onClick={() => scrollToSection('como-funciona')}
          >
            Como Funciona
          </button>
          <button
            className="ff-nav-link"
            onClick={() => scrollToSection('segmentos')}
          >
            Segmentos
          </button>
          <button
            className="ff-nav-link"
            onClick={() => scrollToSection('gestao-ia')}
          >
            Gestão & IA
          </button>
          <button
            className="ff-nav-link"
            onClick={onOpenPricing}
          >
            Planos
          </button>
        </nav>

        {/* Header Actions */}
        <div className="ff-header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn-ghost"
              onClick={onOpenProfessional}
              title={isProfessionalAuthenticated ? `Conectado como ${activeProfessional?.name || 'Profissional'}` : "Acessar Área do Profissional / Consultório"}
              style={{ 
                padding: '8px 14px', 
                fontSize: 13, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                fontWeight: 600,
                border: isProfessionalAuthenticated ? '1.5px solid #c4b5fd' : '1px solid transparent',
                background: isProfessionalAuthenticated ? '#faf5ff' : 'transparent',
                color: isProfessionalAuthenticated ? '#6d28d9' : '#475569'
              }}
            >
              <Stethoscope size={16} color={isProfessionalAuthenticated ? '#7c3aed' : 'currentColor'} />
              <span className="hidden-mobile">
                {isProfessionalAuthenticated 
                  ? `Consultório (${activeProfessional?.name?.split(' ')[0] || 'Ativo'})` 
                  : 'Área do Profissional'}
              </span>
              {isProfessionalAuthenticated && (
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: '#10b981', 
                  display: 'inline-block', 
                  boxShadow: '0 0 8px #10b981' 
                }} />
              )}
            </button>

            <button
              className="btn-primary"
              onClick={onOpenDashboard}
              title={isAuthenticated ? `Painel Ativo: ${currentUser?.companyName || 'Empresa'}` : "Acessar ou Cadastrar Painel da Empresa"}
              style={{ background: '#7c3aed', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Building2 size={15} />
              <span>Painel da Empresa</span>
              {isAuthenticated && (
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  background: '#34d399', 
                  display: 'inline-block', 
                  boxShadow: '0 0 8px #34d399' 
                }} />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
