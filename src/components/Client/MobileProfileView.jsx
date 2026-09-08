import React, { useState } from 'react';
import { 
  User, 
  Smartphone, 
  Mail, 
  ShieldCheck, 
  Bell, 
  Sliders, 
  Clock, 
  ArrowLeft, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function MobileProfileView({ onGoToLanding, onGoToCompany }) {
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundChime, setSoundChime] = useState(true);
  const [conflictGuard, setConflictGuard] = useState(true);

  return (
    <div className="ff-mob-profile-view">
      {/* Profile Header Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-avatar">
          <span>R</span>
        </div>
        <h3 className="profile-hero-name">Rafael Silva</h3>
        <p className="profile-hero-email">rafael.silva@email.com • (11) 98765-4321</p>

        <div className="profile-badge-row">
          <span className="profile-verified-badge">
            <ShieldCheck size={12} />
            <span>Perfil Verificado</span>
          </span>
          <span className="profile-vip-badge">
            <Sparkles size={12} />
            <span>FilaFlow Pass</span>
          </span>
        </div>
      </div>

      {/* Accumulated Impact Stats */}
      <div className="profile-impact-card">
        <div className="impact-title">Seu Tempo Poupado com o FilaFlow</div>
        <div className="impact-grid">
          <div className="impact-item">
            <div className="impact-num">18h 30m</div>
            <div className="impact-label">Economizado este mês</div>
          </div>
          <div className="impact-item">
            <div className="impact-num">14</div>
            <div className="impact-label">Senhas concluídas</div>
          </div>
          <div className="impact-item">
            <div className="impact-num">98.6%</div>
            <div className="impact-label">Pontualidade da IA</div>
          </div>
        </div>
      </div>

      {/* Preferences / Settings */}
      <div className="profile-section-card">
        <h4 className="section-card-title">Canais de Notificação</h4>

        <div className="setting-toggle-row">
          <div className="toggle-info">
            <strong>Avisos via WhatsApp</strong>
            <span>Receba mensagem no WhatsApp quando faltarem 3 pessoas</span>
          </div>
          <label className="ff-toggle-switch">
            <input 
              type="checkbox" 
              checked={whatsappAlerts} 
              onChange={(e) => setWhatsappAlerts(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-toggle-row">
          <div className="toggle-info">
            <strong>Notificações Push no Celular</strong>
            <span>Alertas instantâneos na barra de status do aparelho</span>
          </div>
          <label className="ff-toggle-switch">
            <input 
              type="checkbox" 
              checked={pushAlerts} 
              onChange={(e) => setPushAlerts(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-toggle-row">
          <div className="toggle-info">
            <strong>Sinal Sonoro de Chamada</strong>
            <span>Tocar aviso sonoro de guichê ao ser chamado</span>
          </div>
          <label className="ff-toggle-switch">
            <input 
              type="checkbox" 
              checked={soundChime} 
              onChange={(e) => setSoundChime(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="setting-toggle-row">
          <div className="toggle-info">
            <strong>Guarda de Conflitos (IA Schedule)</strong>
            <span>Avisar automaticamente quando 2 filas colidirem de horário</span>
          </div>
          <label className="ff-toggle-switch">
            <input 
              type="checkbox" 
              checked={conflictGuard} 
              onChange={(e) => setConflictGuard(e.target.checked)} 
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Quick Links & Switch to Website */}
      <div className="profile-section-card">
        <h4 className="section-card-title">Navegação e Sistema</h4>

        <button className="profile-action-row" onClick={onGoToLanding}>
          <div className="row-left">
            <ArrowLeft size={16} color="#4f46e5" />
            <div>
              <strong>Acessar Site Institucional (/)</strong>
              <span>Conhecer planos, proposta para empresas e FAQ</span>
            </div>
          </div>
          <ChevronRight size={16} color="#94a3b8" />
        </button>

        <button className="profile-action-row" onClick={onGoToCompany}>
          <div className="row-left">
            <ExternalLink size={16} color="#7c3aed" />
            <div>
              <strong>Área da Empresa (SaaS B2B)</strong>
              <span>Painel de chamada de senhas para atendentes</span>
            </div>
          </div>
          <ChevronRight size={16} color="#94a3b8" />
        </button>
      </div>

      {/* Version Tag */}
      <div className="profile-footer-version">
        <span>FilaFlow Mobile Web App • v2.4 PWA</span>
        <small>Conectado a servidores de tempo real • SLA 99.9%</small>
      </div>
    </div>
  );
}
