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

            {/* Queue List Box */}
            <div className="ff-phone-queue-box">
              <div className="ff-queue-box-title">
                <span>Fila em Andamento</span>
                <span className="ff-queue-count-pill">{queue.aheadList ? queue.aheadList.length : 5} pessoas</span>
              </div>

              <div className="ff-queue-list-compact">
                {queue.aheadList && queue.aheadList.slice(0, 5).map((item, idx) => {
                  let rowClass = 'waiting';
                  let statusBadgeClass = 'badge-waiting';
                  if (item.status === 'Em atendimento') {
                    rowClass = 'current';
                    statusBadgeClass = 'badge-current';
                  } else if (item.status.includes('Próximo')) {
                    rowClass = 'next';
                    statusBadgeClass = 'badge-next';
                  } else if (item.isUser) {
                    rowClass = 'you';
                    statusBadgeClass = 'badge-you';
                  }

                  return (
                    <div key={idx} className={`ff-queue-row-compact ${rowClass}`}>
                      <div className="queue-row-left">
                        <span className="queue-row-ticket">{item.ticket}</span>
                        <span className="queue-row-name">{item.name}</span>
                      </div>
                      <span className={`queue-status-chip ${statusBadgeClass}`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
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
