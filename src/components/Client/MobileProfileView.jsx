import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Bell, 
  Clock, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Smartphone,
  Volume2,
  CalendarCheck,
  Award,
  LogOut,
  LogIn,
  UserPlus,
  CreditCard,
  FileCheck
} from 'lucide-react';

export default function MobileProfileView({ 
  currentUser,
  isAuthenticated = true,
  onLogout,
  onOpenLogin,
  onOpenRegister,
  onGoToLanding, 
  onGoToCompany 
}) {
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundChime, setSoundChime] = useState(true);
  const [conflictGuard, setConflictGuard] = useState(true);

  const isDoctor = Boolean(currentUser?.name?.includes('Dr.') || currentUser?.email?.includes('clinicavida'));
  const userName = isDoctor || !currentUser?.name ? 'Rafael Silva' : currentUser.name;
  const userEmail = isDoctor || !currentUser?.email ? 'rafael.silva@email.com' : currentUser.email;
  const userPhone = currentUser?.phone || '(11) 98765-4321';
  const userInsurance = currentUser?.insurance || 'Unimed Nacional';
  const userCard = currentUser?.cardNumber || '0012.3456.7890.1234';
  const avatarLetter = userName.charAt(0).toUpperCase() || 'R';

  return (
    <div className="ff-mob-clean-view">
      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Sua Conta</span>
          <h2 className="view-maintitle">Meu Perfil</h2>
        </div>
      </div>

      {/* Hero Card Perfil estilo FilaFlow */}
      {isAuthenticated ? (
        <div className="clean-profile-hero-card">
          <div className="profile-avatar-squircle">
            <span>{avatarLetter}</span>
          </div>
          
          <h3 className="profile-clean-name">{userName}</h3>
          <p className="profile-clean-email">{userEmail} • {userPhone}</p>

          <div className="profile-badges-wrap">
            <span className="clean-chip-badge mint">
              <ShieldCheck size={13} />
              <span>{userInsurance}</span>
            </span>
            <span className="clean-chip-badge lavender">
              <Sparkles size={13} />
              <span>FilaFlow VIP</span>
            </span>
          </div>

          {userCard && !userInsurance.includes('Particular') && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 11,
              color: '#475569',
              marginTop: 10
            }}>
              <CreditCard size={13} color="#6366f1" />
              <span>Carteirinha: <strong>{userCard}</strong></span>
            </div>
          )}
        </div>
      ) : (
        <div className="clean-profile-hero-card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1.5px dashed #cbd5e1' }}>
          <div className="profile-avatar-squircle" style={{ background: '#e2e8f0', color: '#64748b' }}>
            <User size={24} />
          </div>
          
          <h3 className="profile-clean-name">Navegando como Visitante</h3>
          <p className="profile-clean-email">Crie sua conta para salvar seu convênio e histórico.</p>

          <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 14 }}>
            <button
              onClick={onOpenLogin}
              className="btn-primary"
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '9px 12px',
                fontSize: 12,
                borderRadius: 10
              }}
            >
              <LogIn size={14} />
              <span>Entrar</span>
            </button>

            <button
              onClick={onOpenRegister}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1.5px solid #7c3aed',
                color: '#7c3aed',
                fontWeight: 700,
                fontSize: 12,
                borderRadius: 10,
                padding: '9px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <UserPlus size={14} />
              <span>Cadastrar</span>
            </button>
          </div>
        </div>
      )}

      {/* Bento Grid de Tempo Economizado */}
      <div className="clean-profile-stats-card">
        <div className="profile-stats-header">
          <Award size={16} color="#6366f1" />
          <span>Seu Tempo Poupado com o FilaFlow</span>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-box peach">
            <div className="stat-big-val">18h 30m</div>
            <div className="stat-sub-label">Tempo poupado</div>
          </div>
          <div className="profile-stat-box mint">
            <div className="stat-big-val">14</div>
            <div className="stat-sub-label">Senhas concluídas</div>
          </div>
          <div className="profile-stat-box sky">
            <div className="stat-big-val">98.6%</div>
            <div className="stat-sub-label">Precisão da IA</div>
          </div>
        </div>
      </div>

      {/* Preferências de Notificação em Squircles Limpos */}
      <div className="clean-settings-block">
        <h4 className="clean-settings-title">Canais de Notificação</h4>

        <div className="clean-setting-card">
          {/* WhatsApp */}
          <div className="clean-toggle-item">
            <div className="toggle-left-info">
              <div className="icon-squircle mini mint">
                <MessageCircle size={15} />
              </div>
              <div>
                <strong>Avisos via WhatsApp</strong>
                <span>Receba mensagem quando faltarem 3 pessoas</span>
              </div>
            </div>
            <label className="clean-toggle-switch">
              <input 
                type="checkbox" 
                checked={whatsappAlerts} 
                onChange={(e) => setWhatsappAlerts(e.target.checked)} 
              />
              <span className="clean-switch-slider"></span>
            </label>
          </div>

          <div className="clean-item-divider"></div>

          {/* Push */}
          <div className="clean-toggle-item">
            <div className="toggle-left-info">
              <div className="icon-squircle mini sky">
                <Smartphone size={15} />
              </div>
              <div>
                <strong>Notificações Push</strong>
                <span>Alertas na barra de status do aparelho</span>
              </div>
            </div>
            <label className="clean-toggle-switch">
              <input 
                type="checkbox" 
                checked={pushAlerts} 
                onChange={(e) => setPushAlerts(e.target.checked)} 
              />
              <span className="clean-switch-slider"></span>
            </label>
          </div>

          <div className="clean-item-divider"></div>

          {/* Som */}
          <div className="clean-toggle-item">
            <div className="toggle-left-info">
              <div className="icon-squircle mini lavender">
                <Volume2 size={15} />
              </div>
              <div>
                <strong>Sinal Sonoro de Chamada</strong>
                <span>Tocar aviso acústico quando for a sua vez</span>
              </div>
            </div>
            <label className="clean-toggle-switch">
              <input 
                type="checkbox" 
                checked={soundChime} 
                onChange={(e) => setSoundChime(e.target.checked)} 
              />
              <span className="clean-switch-slider"></span>
            </label>
          </div>

          <div className="clean-item-divider"></div>

          {/* Guarda Conflitos */}
          <div className="clean-toggle-item">
            <div className="toggle-left-info">
              <div className="icon-squircle mini peach">
                <CalendarCheck size={15} />
              </div>
              <div>
                <strong>Prevenção de Choque de Horários</strong>
                <span>Recalcular previsão se duas filas colidirem</span>
              </div>
            </div>
            <label className="clean-toggle-switch">
              <input 
                type="checkbox" 
                checked={conflictGuard} 
                onChange={(e) => setConflictGuard(e.target.checked)} 
              />
              <span className="clean-switch-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Ações de Conta & Sessão */}
      <div className="clean-settings-block">
        <h4 className="clean-settings-title">Gerenciamento da Conta</h4>

        <div className="clean-links-group">
          {isAuthenticated ? (
            <>
              <button 
                className="clean-link-row" 
                onClick={onOpenLogin}
              >
                <div className="link-row-left">
                  <div className="icon-squircle mini sky">
                    <User size={15} />
                  </div>
                  <div>
                    <strong>Trocar de Conta</strong>
                    <span>Acessar com outro perfil de paciente</span>
                  </div>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </button>

              <button 
                className="clean-link-row" 
                onClick={onLogout}
                style={{ color: '#ef4444' }}
              >
                <div className="link-row-left">
                  <div className="icon-squircle mini" style={{ background: '#fef2f2', color: '#ef4444' }}>
                    <LogOut size={15} />
                  </div>
                  <div>
                    <strong style={{ color: '#ef4444' }}>Sair da Conta</strong>
                    <span>Encerrar sessão no aparelho</span>
                  </div>
                </div>
                <ChevronRight size={16} color="#ef4444" />
              </button>
            </>
          ) : (
            <button 
              className="clean-link-row" 
              onClick={onOpenLogin}
            >
              <div className="link-row-left">
                <div className="icon-squircle mini mint">
                  <LogIn size={15} />
                </div>
                <div>
                  <strong>Fazer Login ou Criar Conta</strong>
                  <span>Acesse sua conta para histórico completo</span>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      {/* Navegação e Links do Ecossistema */}
      <div className="clean-settings-block">
        <h4 className="clean-settings-title">Ecossistema FilaFlow</h4>

        <div className="clean-links-group">
          <button className="clean-link-row" onClick={onGoToLanding}>
            <div className="link-row-left">
              <div className="icon-squircle mini sky">
                <ArrowLeft size={15} />
              </div>
              <div>
                <strong>Página Institucional (/)</strong>
                <span>Planos, proposta para empresas e FAQ</span>
              </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </button>

          <button className="clean-link-row" onClick={onGoToCompany}>
            <div className="link-row-left">
              <div className="icon-squircle mini lavender">
                <ExternalLink size={15} />
              </div>
              <div>
                <strong>Painel da Empresa (SaaS B2B)</strong>
                <span>Módulo dos atendentes e triagem de guichês</span>
              </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
          </button>
        </div>
      </div>

      {/* Rodapé da Versão */}
      <div className="clean-profile-footer">
        <span>FilaFlow Mobile App • v2.4 PWA</span>
        <small>Sincronizado via WebSockets • Criptografia ponta a ponta</small>
      </div>
    </div>
  );
}
