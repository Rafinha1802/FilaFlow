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
  Award
} from 'lucide-react';

export default function MobileProfileView({ onGoToLanding, onGoToCompany }) {
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundChime, setSoundChime] = useState(true);
  const [conflictGuard, setConflictGuard] = useState(true);

  return (
    <div className="ff-mob-clean-view">
      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Sua Conta</span>
          <h2 className="view-maintitle">Meu Perfil</h2>
        </div>
      </div>

      {/* Hero Card Perfil estilo Screen 3 */}
      <div className="clean-profile-hero-card">
        <div className="profile-avatar-squircle">
          <span>R</span>
        </div>
        
        <h3 className="profile-clean-name">Rafael Silva</h3>
        <p className="profile-clean-email">rafael.silva@email.com • (11) 98765-4321</p>

        <div className="profile-badges-wrap">
          <span className="clean-chip-badge mint">
            <ShieldCheck size={13} />
            <span>Perfil Verificado</span>
          </span>
          <span className="clean-chip-badge lavender">
            <Sparkles size={13} />
            <span>FilaFlow VIP Pass</span>
          </span>
        </div>
      </div>

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
