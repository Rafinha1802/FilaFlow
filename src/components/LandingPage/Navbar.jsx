import React from 'react';
import { Building2, Stethoscope } from 'lucide-react';
import BrandLogo from '../Common/BrandLogo';

export default function Navbar({
  isAuthenticated,
  currentUser,
  onGoToLanding,
  onOpenDashboard,
  onOpenLogin,
  onOpenSignup,
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
        <div onClick={onGoToLanding} title="Página Inicial TemFyla" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <BrandLogo size={38} textColor="#0f172a" />
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
              title="Acessar Área do Profissional / Consultório"
              style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <Stethoscope size={16} />
              <span className="hidden-mobile">Área do Profissional</span>
            </button>

            <button
              className="btn-ghost"
              onClick={onOpenLogin || onOpenDashboard}
              title="Entrar na conta da Empresa"
              style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700 }}
            >
              <span>Entrar</span>
            </button>

            <button
              className="btn-primary"
              onClick={onOpenSignup || onOpenDashboard}
              title="Cadastrar sua empresa no TemFyla"
              style={{ background: '#7c3aed', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Building2 size={15} />
              <span>Cadastrar Empresa</span>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: '#34d399', 
                display: 'inline-block', 
                boxShadow: '0 0 8px #34d399' 
              }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
