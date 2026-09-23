import React from 'react';
import { Layers, Building2, Stethoscope } from 'lucide-react';

export default function Navbar({
  isAuthenticated,
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
        <div className="ff-logo-group" onClick={onGoToLanding} title="Página Inicial FilaFlow">
          <div className="ff-logo-mark">
            <Layers size={20} strokeWidth={2.4} />
          </div>
          <span className="ff-logo-text">
            Fila<span>Flow</span>
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
              title="Acessar Área do Profissional / Consultório"
              style={{ padding: '8px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <Stethoscope size={16} />
              <span className="hidden-mobile">Área do Profissional</span>
            </button>

            <button
              className="btn-primary"
              onClick={onOpenDashboard}
              title="Acessar Painel da Empresa diretamente integrado ao backend"
              style={{ background: '#7c3aed', padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Building2 size={15} />
              <span>Painel da Empresa</span>
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
