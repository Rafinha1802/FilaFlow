import React, { useState, useRef, useEffect } from 'react';
import { Layers, Building2, ArrowRight, LogOut, Stethoscope, ChevronDown } from 'lucide-react';

export default function Navbar({
  isAuthenticated,
  currentUser,
  onGoToLanding,
  onOpenLogin,
  onOpenSignup,
  onOpenDashboard,
  onOpenClient,
  onOpenPricing,
  onOpenProfessional,
  onLogout
}) {
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef(null);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target)) {
        setIsLoginMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLoginRole = (role) => {
    setIsLoginMenuOpen(false);
    if (role === 'professional') {
      if (onOpenProfessional) {
        onOpenProfessional();
      } else {
        onOpenLogin('professional');
      }
    } else {
      onOpenLogin('company');
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
              {/* Unified "Entrar" button with dropdown for Professional and Company */}
              <div className="ff-login-dropdown-wrapper" ref={loginMenuRef}>
                <button
                  type="button"
                  className={`btn-ghost ff-btn-login-unified ${isLoginMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
                  aria-expanded={isLoginMenuOpen}
                  title="Entrar na sua conta (Profissional ou Gestor)"
                >
                  <span>Entrar</span>
                  <ChevronDown size={14} className={`ff-chevron-icon ${isLoginMenuOpen ? 'rotated' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isLoginMenuOpen && (
                  <div className="ff-login-dropdown-menu">
                    <div className="ff-dropdown-header">
                      <span>Selecione seu perfil de acesso</span>
                    </div>

                    <button
                      type="button"
                      className="ff-dropdown-item professional"
                      onClick={() => handleSelectLoginRole('professional')}
                    >
                      <div className="ff-dropdown-item-icon pro">
                        <Stethoscope size={18} />
                      </div>
                      <div className="ff-dropdown-item-text">
                        <div className="ff-item-title-row">
                          <span className="ff-dropdown-item-title">Área do Profissional</span>
                          <span className="ff-dropdown-pill-pro">Consultório</span>
                        </div>
                        <span className="ff-dropdown-item-sub">
                          Médico, Dentista, Chef e Atendente (Chamada de senhas & cronômetro)
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="ff-dropdown-item company"
                      onClick={() => handleSelectLoginRole('company')}
                    >
                      <div className="ff-dropdown-item-icon biz">
                        <Building2 size={18} />
                      </div>
                      <div className="ff-dropdown-item-text">
                        <div className="ff-item-title-row">
                          <span className="ff-dropdown-item-title">Gestor da Empresa</span>
                          <span className="ff-dropdown-pill-biz">Admin</span>
                        </div>
                        <span className="ff-dropdown-item-sub">
                          Painel B2B, gestão de filas gerais, relatórios e equipe
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <button
                className="btn-primary"
                onClick={onOpenSignup}
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
