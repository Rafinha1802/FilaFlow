import React from 'react';
import { Wifi, Battery, Clock, Sparkles, Bell, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function InteractiveHeroPhone({ activeQueue }) {
  const queue = activeQueue || {
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    ticketNumber: '47',
    position: 5,
    estimatedWaitText: '35-42 min',
    aheadList: [
      { ticket: '#43', name: 'Maria Silva', status: 'Em atendimento' },
      { ticket: '#44', name: 'João Santos', status: 'Aguardando' },
      { ticket: '#45', name: 'Ana Costa', status: 'Aguardando' },
      { ticket: '#46', name: 'Pedro Lima', status: 'Próximo a chamar' },
      { ticket: '#47', name: 'Você (Rafael)', status: 'Sua vez em breve', isUser: true },
    ]
  };

  return (
    <div className="ff-phone-wrapper">
      {/* Dynamic Ambient Background Glows */}
      <div className="ff-phone-glow"></div>
      <div className="ff-phone-glow-secondary"></div>

      {/* Floating Micro-Badges around the Phone for SaaS depth */}
      <div className="ff-float-chip ff-float-chip-top">
        <div className="ff-float-chip-icon red">
          <Bell size={13} />
        </div>
        <div className="ff-float-chip-content">
          <span className="chip-label">Alerta Automático</span>
          <span className="chip-value">Sua vez em 5 min • Sala 04</span>
        </div>
      </div>

      <div className="ff-float-chip ff-float-chip-bottom">
        <div className="ff-float-chip-icon purple">
          <Zap size={13} />
        </div>
        <div className="ff-float-chip-content">
          <span className="chip-label">Previsão por IA</span>
          <span className="chip-value">Fluxo +18% mais ágil hoje</span>
        </div>
      </div>

      {/* Phone Chassis (Flagship Titanium Finish) */}
      <div className="ff-phone-device">
        <div className="ff-phone-bezel-reflection"></div>

        <div className="ff-phone-inner">
          {/* Status Bar */}
          <div className="ff-phone-status-bar">
            <span className="ff-phone-time">14:30</span>

            <div className="ff-phone-dynamic-island">
              <div className="ff-island-camera"></div>
              <div className="ff-island-live-activity">
                <span className="ff-island-pulse-dot"></span>
                <span className="ff-island-text">#43 Chamado</span>
              </div>
            </div>

            <div className="ff-phone-status-icons">
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>

          {/* Screen Content */}
          <div className="ff-phone-screen-content">
            {/* Header Badge */}
            <div className="ff-ticket-app-header">
              <div className="ff-unit-badge">
                <span className="ff-unit-dot"></span>
                <span>{queue.companyName}</span>
                <span className="ff-unit-divider">•</span>
                <span className="ff-unit-room">{queue.unitName}</span>
              </div>
              <div className="ff-pwa-live-pill">
                <span className="pwa-dot"></span>
                <span>AO VIVO</span>
              </div>
            </div>

            {/* Ticket Hero - Card Holográfico Moderno */}
            <div className="ff-ticket-hero-card">
              <div className="ff-ticket-card-reflection"></div>
              <div className="ff-ticket-top-row">
                <span className="ff-ticket-category-tag">Atendimento Presencial</span>
                <span className="ff-ticket-id-tag">PASS-7842</span>
              </div>

              <div className="ff-ticket-center">
                <div className="ff-ticket-label">SUA SENHA ATIVA</div>
                <div className="ff-ticket-number">#{queue.ticketNumber}</div>
                <div className="ff-ticket-service">Consulta Oftalmologia Geral</div>
              </div>

              <div className="ff-ticket-footer-row">
                <div className="ff-ticket-pos-badge">
                  <span className="pos-highlight">{queue.position}º</span> na fila de espera
                </div>
                <div className="ff-ticket-barcode-mini">
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            </div>

            {/* Forecast Box with Live Wave Visualizer */}
            <div className="ff-forecast-card">
              <div className="ff-forecast-header">
                <div className="ff-forecast-title-group">
                  <Clock size={14} className="ff-forecast-icon" />
                  <span className="ff-forecast-title">Previsão Estimada por IA</span>
                </div>
                <span className="ff-forecast-confidence">96% precisão</span>
              </div>

              <div className="ff-forecast-main">
                <div className="ff-forecast-time">{queue.estimatedWaitText}</div>
                <div className="ff-ai-wave-bars">
                  <span className="wave-bar bar-1"></span>
                  <span className="wave-bar bar-2"></span>
                  <span className="wave-bar bar-3"></span>
                  <span className="wave-bar bar-4"></span>
                  <span className="wave-bar bar-5"></span>
                </div>
              </div>

              <div className="ff-forecast-footer">
                <span className="ff-forecast-dot-pulse"></span>
                <span>Ritmo do Dr. Carlos: ~8 min por atendimento</span>
              </div>
            </div>

            {/* Seu Lugar na Fila */}
            <div className="ff-phone-queue-box">
              <div className="ff-queue-box-title">
                <span>Seu Lugar na Fila</span>
                <span className="ff-queue-count-pill">{queue.position}º lugar</span>
              </div>

              <div className="ff-personal-pos-card">
                <div className="pos-card-main">
                  <div className="pos-badge-highlight">
                    <span className="pos-big-num">{queue.position}º</span>
                    <span className="pos-big-label">Sua posição</span>
                  </div>
                  <div className="pos-details-col">
                    <strong>{queue.position > 1 ? `${queue.position - 1} pessoas na sua frente` : 'Você é o próximo!'}</strong>
                    <span>Notificação no celular quando for sua vez</span>
                  </div>
                </div>

                <div className="pos-steps-bar">
                  <div className="pos-step done">
                    <span className="step-dot">✓</span>
                    <span className="step-lbl">Check-in</span>
                  </div>
                  <div className="pos-step-line done"></div>
                  <div className="pos-step active">
                    <span className="step-dot">●</span>
                    <span className="step-lbl">Na Fila</span>
                  </div>
                  <div className="pos-step-line"></div>
                  <div className="pos-step pending">
                    <span className="step-dot">○</span>
                    <span className="step-lbl">Chamada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Indicator Footer */}
            <div className="ff-phone-live-footer">
              <Sparkles size={13} className="sparkle-spin" />
              <span>Sincronizado via WebSockets com a recepção</span>
            </div>
          </div>

          {/* Home indicator */}
          <div className="ff-phone-home-indicator">
            <div className="ff-home-pill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
