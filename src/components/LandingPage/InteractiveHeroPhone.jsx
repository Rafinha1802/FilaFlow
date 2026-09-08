import React from 'react';
import { Wifi, Battery, Clock, Sparkles } from 'lucide-react';

export default function InteractiveHeroPhone({ activeQueue }) {
  const queue = activeQueue || {
    companyName: 'Clínica Vida',
    unitName: 'Centro',
    ticketNumber: '47',
    position: 5,
    estimatedWaitText: '35-42 min',
    aheadList: [
      { ticket: '#43', name: 'Maria Silva', status: 'Em atendimento' },
      { ticket: '#44', name: 'João Santos', status: 'Aguardando' },
      { ticket: '#45', name: 'Ana Costa', status: 'Aguardando' },
      { ticket: '#46', name: 'Pedro Lima', status: 'Próximo' },
      { ticket: '#47', name: 'Você', status: 'Sua vez', isUser: true },
    ]
  };

  return (
    <div className="ff-phone-wrapper">
      <div className="ff-phone-glow"></div>

      <div className="ff-phone-device">
        <div className="ff-phone-inner">
          {/* Status Bar */}
          <div className="ff-phone-status-bar">
            <span>14:30</span>
            <div className="ff-phone-dynamic-island">
              <div className="ff-island-camera"></div>
              <div className="ff-island-indicator"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={12} />
              <Battery size={14} />
            </div>
          </div>

          {/* Screen Content */}
          <div className="ff-phone-screen-content">
            {/* Header Badge */}
            <div className="ff-ticket-app-header">
              <div className="ff-unit-badge">
                <span className="ff-unit-dot"></span>
                <span>{queue.companyName} • {queue.unitName}</span>
              </div>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PWA Live</span>
            </div>

            {/* Ticket Hero */}
            <div className="ff-ticket-hero">
              <div className="ff-ticket-label">Sua Senha</div>
              <div className="ff-ticket-number">#{queue.ticketNumber}</div>
              <div className="ff-ticket-position-pill">
                Você está em {queue.position}º lugar na fila
              </div>
            </div>

            {/* Forecast Box */}
            <div className="ff-forecast-card">
              <div className="ff-forecast-title">Previsão de Espera</div>
              <div className="ff-forecast-time">{queue.estimatedWaitText}</div>
              <div className="ff-forecast-status">
                <span>🟡</span>
                <span>Previsão atualizada por IA</span>
              </div>
            </div>

            {/* Queue List Box */}
            <div className="ff-phone-queue-box">
              <div className="ff-queue-box-title">
                <span>Fila em Tempo Real</span>
                <span>Ritmo Normal</span>
              </div>

              {queue.aheadList && queue.aheadList.slice(0, 5).map((item, idx) => {
                let rowClass = '';
                if (item.status === 'Em atendimento') rowClass = 'current';
                else if (item.status === 'Próximo' || item.status === 'Próximo a chamar') rowClass = 'next';
                else if (item.isUser) rowClass = 'you';

                return (
                  <div key={idx} className={`ff-queue-row ${rowClass}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800 }}>{item.ticket}</span>
                      <span style={{ opacity: 0.85 }}>{item.name}</span>
                    </div>
                    <span>{item.status}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Indicator Footer */}
            <div className="ff-phone-live-footer">
              <Sparkles size={13} />
              <span>Previsão de fila em tempo real</span>
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
