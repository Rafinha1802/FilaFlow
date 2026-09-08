import React, { useState } from 'react';
import { 
  Wifi, 
  Battery, 
  Sparkles, 
  QrCode, 
  Search, 
  Clock, 
  AlertTriangle, 
  Navigation, 
  Plus, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export default function ClientMobileApp({
  activeQueues,
  selectedQueueId,
  onSelectQueue,
  onOpenQrScanner,
  onOpenSearch,
  onRemoveQueue,
  onClientImOnMyWay,
  onClientAskMoreTime,
  hasConflict,
  onDismissConflict,
  onGoToLanding,
  onGoToCompany
}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [quickNotification, setQuickNotification] = useState(null);
  const [showQueueList, setShowQueueList] = useState(false);

  // Active queue object
  const currentQueue = activeQueues.find((q) => q.id === selectedQueueId) || activeQueues[0] || null;

  const showToast = (msg) => {
    setQuickNotification(msg);
    setTimeout(() => setQuickNotification(null), 3000);
  };

  const handleImOnMyWay = () => {
    onClientImOnMyWay(currentQueue?.id);
    showToast('Aviso enviado: "Estou a caminho!"');
  };

  const handleAskMoreTime = () => {
    onClientAskMoreTime(currentQueue?.id);
    showToast('Previsão estendida em +5 minutos pela IA.');
  };

  return (
    <div className="ff-mobile-view-wrapper">
      {/* Top screen external navigation */}
      {!isFullScreen && (
        <header className="ff-mobile-external-nav">
          <button
            onClick={onGoToLanding}
            className="ff-ext-nav-btn"
            title="Retornar à página inicial do site"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Site</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onGoToCompany}
              className="ff-ext-nav-btn purple"
              title="Abrir o painel operacional da empresa"
            >
              <Building2 size={14} />
              <span>Painel Empresa</span>
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="ff-ext-nav-btn"
              title="Alternar entre modo smartphone e tela cheia"
            >
              <Maximize2 size={13} />
              <span>Expandir</span>
            </button>
          </div>
        </header>
      )}

      {/* Device Frame */}
      <div 
        className={isFullScreen ? 'ff-phone-device-fullscreen' : 'ff-phone-device'} 
      >
        <div className="ff-phone-inner">
          {/* Status Bar */}
          <div className="ff-phone-status-bar">
            <span style={{ fontWeight: 700, fontSize: 13 }}>14:30</span>
            <div className="ff-phone-dynamic-island">
              <div className="ff-island-camera"></div>
              <div className="ff-island-indicator"></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>

          {/* Screen Content */}
          <div className="ff-phone-screen-clean">
            {/* Quick In-App Toast */}
            {quickNotification && (
              <div className="ff-phone-floating-toast">
                <CheckCircle2 size={15} color="#34d399" />
                <span>{quickNotification}</span>
              </div>
            )}

            {/* Compact Header: User Info */}
            <div className="ff-clean-user-header">
              <div>
                <h2 className="ff-clean-user-title">Olá, Rafael 👋</h2>
                <span className="ff-clean-user-badge">
                  {activeQueues.length} {activeQueues.length === 1 ? 'fila ativa' : 'filas ativas'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button 
                  onClick={onOpenQrScanner}
                  className="ff-clean-icon-btn"
                  title="Escanear Totem / QR Code"
                >
                  <QrCode size={16} />
                </button>
                <button 
                  onClick={onOpenSearch}
                  className="ff-clean-icon-btn"
                  title="Buscar estabelecimentos"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Horizontal Queue Selector (Sleek Segmented Tabs) */}
            <div className="ff-clean-queue-tabs">
              {activeQueues.map((q) => {
                const isActive = q.id === currentQueue?.id;
                return (
                  <button
                    key={q.id}
                    className={`ff-clean-tab-pill ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectQueue(q.id)}
                  >
                    <span className="tab-name">{q.companyName}</span>
                    <span className="tab-num">#{q.ticketNumber}</span>
                  </button>
                );
              })}

              <button 
                className="ff-clean-tab-add"
                onClick={onOpenSearch}
                title="Adicionar nova fila"
              >
                <Plus size={13} />
                <span>Nova</span>
              </button>
            </div>

            {/* Compact AI Conflict Alert Bar (Clean, non-intrusive) */}
            {hasConflict && activeQueues.length > 1 && (
              <div className="ff-clean-conflict-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} color="#d97706" style={{ flexShrink: 0 }} />
                  <span className="banner-text">
                    Choque previsto: <strong>{activeQueues[0]?.companyName}</strong> e <strong>{activeQueues[1]?.companyName}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button onClick={handleAskMoreTime} className="banner-btn-action">
                    +5 min
                  </button>
                  <button onClick={onDismissConflict} className="banner-btn-dismiss" title="Dispensar aviso">
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* MAIN PASS: Unified Boarding Pass / Ticket Card */}
            {currentQueue ? (
              <div className="ff-clean-ticket-container">
                <div className="ff-clean-pass-card">
                  {/* Pass Header */}
                  <div className="ff-pass-header">
                    <div>
                      <div className="ff-pass-business">{currentQueue.companyName}</div>
                      <div className="ff-pass-service">
                        {currentQueue.serviceName} • {currentQueue.room || 'Recepção'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="ff-pass-pos-pill">
                        {currentQueue.position}º na fila
                      </span>
                      <button 
                        onClick={() => onRemoveQueue(currentQueue.id)}
                        className="ff-pass-remove-btn"
                        title="Desistir desta fila"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Pass Core: Ticket Number & Dynamic Time Side-by-Side */}
                  <div className="ff-pass-core">
                    <div className="ff-pass-col">
                      <span className="ff-core-label">SUA SENHA</span>
                      <div className="ff-core-ticket">#{currentQueue.ticketNumber}</div>
                      <span className="ff-core-sub">Rafael (Você)</span>
                    </div>

                    {/* Perforated Center Divider */}
                    <div className="ff-pass-divider">
                      <div className="ff-notch-top"></div>
                      <div className="ff-dash-line"></div>
                      <div className="ff-notch-bottom"></div>
                    </div>

                    <div className="ff-pass-col right">
                      <span className="ff-core-label">PREVISÃO DE ESPERA</span>
                      <div className="ff-core-time">{currentQueue.estimatedWaitText}</div>
                      <div className="ff-core-status">
                        <span className="status-dot"></span>
                        <span>IA Preditiva Ativa</span>
                      </div>
                    </div>
                  </div>

                  {/* Pass Footer Actions */}
                  <div className="ff-pass-actions">
                    <button 
                      onClick={handleImOnMyWay}
                      className="ff-pass-btn primary"
                    >
                      <Navigation size={14} />
                      <span>Estou a Caminho</span>
                    </button>

                    <button 
                      onClick={handleAskMoreTime}
                      className="ff-pass-btn secondary"
                    >
                      <Clock size={14} />
                      <span>Pedir +5 min</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Live Queue Ahead Drawer */}
                <div className="ff-clean-accordion-card">
                  <button 
                    className="ff-accordion-toggle"
                    onClick={() => setShowQueueList(!showQueueList)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={14} color="#7c3aed" />
                      <span style={{ fontWeight: 700, fontSize: 12, color: '#334155' }}>
                        Ver fluxo em tempo real ({currentQueue.aheadList ? currentQueue.aheadList.length : 3} pessoas)
                      </span>
                    </div>
                    {showQueueList ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </button>

                  {showQueueList && currentQueue.aheadList && (
                    <div className="ff-accordion-content">
                      {currentQueue.aheadList.map((item, idx) => {
                        const isYou = item.isUser;
                        const isNow = item.status === 'Em atendimento';
                        return (
                          <div 
                            key={idx} 
                            className={`ff-clean-queue-item ${isYou ? 'you' : isNow ? 'now' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="item-ticket">{item.ticket}</span>
                              <span className="item-name">{item.name}</span>
                            </div>
                            <span className="item-status">{item.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="ff-clean-empty-state">
                <QrCode size={40} color="#cbd5e1" />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
                  Nenhuma fila ativa
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>
                  Aponte a câmera para um totem ou busque um local.
                </p>
                <button onClick={onOpenQrScanner} className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', background: '#7c3aed' }}>
                  <QrCode size={15} />
                  <span>Escanear QR Code</span>
                </button>
              </div>
            )}

            {/* Bottom Floating Bar */}
            <nav className="ff-clean-bottom-bar">
              <button onClick={onOpenQrScanner} className="ff-bottom-tab active">
                <QrCode size={18} />
                <span>Escanear QR</span>
              </button>

              <button onClick={onOpenSearch} className="ff-bottom-tab">
                <Search size={18} />
                <span>Buscar Locais</span>
              </button>
            </nav>
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
