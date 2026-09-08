import React from 'react';
import { Layers, Building2, ArrowRight, LogOut } from 'lucide-react';

export default function Navbar({
  isAuthenticated,
  currentUser,
  onGoToLanding,
  onOpenLogin,
  onOpenSignup,
  onOpenDashboard,
  onOpenClient,
  onOpenPricing,
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
          {/* Conditional Auth Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn-primary"
                onClick={onOpenDashboard}
                style={{ background: '#7c3aed', padding: '8px 16px', fontSize: 13 }}
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

              <button
                className="btn-ghost"
                onClick={onLogout}
                title="Encerrar sessão da empresa"
                style={{ padding: '8px 12px', fontSize: 13, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <LogOut size={15} />
                <span className="hidden-mobile">Sair</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn-ghost"
                onClick={onOpenLogin}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                Entrar
              </button>

              <button
                className="btn-primary"
                onClick={onOpenSignup}
                style={{ padding: '8px 18px', fontSize: 14 }}
              >
                <span>Cadastrar Empresa</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
