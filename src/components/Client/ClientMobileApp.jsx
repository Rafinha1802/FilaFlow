import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Sparkles, 
  QrCode, 
  Search, 
  Clock, 
  Maximize2, 
  Minimize2, 
  ArrowLeft,
  Building2,
  Home,
  Ticket,
  Compass,
  Bell,
  User,
  Zap
} from 'lucide-react';
import MobileDashboard from './MobileDashboard';
import MobileQueuesView from './MobileQueuesView';
import MobileExploreView from './MobileExploreView';
import MobileNotificationsView from './MobileNotificationsView';
import MobileProfileView from './MobileProfileView';

export default function ClientMobileApp({
  activeQueues,
  selectedQueueId,
  onSelectQueue,
  onOpenQrScanner,
  onOpenSearch,
  onRemoveQueue,
  onClientImOnMyWay,
  onClientAskMoreTime,
  onApproveReceptionCheckin,
  hasConflict,
  onDismissConflict,
  onGoToLanding,
  onGoToCompany,
  onSelectBusiness,
  onPlayChime
}) {
  // Mobile App Internal Tabs: 'dashboard' | 'queues' | 'explore' | 'notifications' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('14:30');

  // Real-time clock for the status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Most urgent queue for Dynamic Island
  const urgentQueue = activeQueues.length > 0 
    ? [...activeQueues].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
    : null;

  return (
    <div className="ff-mobile-view-wrapper">
      {/* Top external navigation bar (Desktop only preview) */}
      {!isFullScreen ? (
        <header className="ff-mobile-external-nav">
          <button
            onClick={onGoToLanding}
            className="ff-ext-nav-btn"
            title="Voltar à Página Inicial"
          >
            <ArrowLeft size={13} />
            <span>Site</span>
          </button>

          <div className="ff-ext-nav-brand-badge">
            <span className="live-dot" />
            <span>App Mobile</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={onGoToCompany}
              className="ff-ext-nav-btn purple"
              title="Acessar Painel da Empresa"
            >
              <Building2 size={13} />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setIsFullScreen(true)}
              className="ff-ext-nav-btn"
              title="Expandir para tela cheia"
            >
              <Maximize2 size={13} />
              <span>Expandir</span>
            </button>
          </div>
        </header>
      ) : (
        <button
          onClick={() => setIsFullScreen(false)}
          className="ff-ext-nav-btn"
          style={{
            position: 'fixed',
            top: 14,
            right: 14,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: 999,
            padding: '7px 14px'
          }}
          title="Voltar ao modo smartphone"
        >
          <Minimize2 size={13} />
          <span>Modo Celular</span>
        </button>
      )}

      {/* Device Frame */}
      <div className={isFullScreen ? 'ff-phone-device-fullscreen' : 'ff-phone-device'}>
        <div className="ff-phone-inner">
          {/* Status Bar */}
          <div className="ff-phone-status-bar">
            <span className="ff-status-clock">{currentTime}</span>

            {/* Dynamic Island with Live Queue Indicator */}
            <div 
              className={`ff-phone-dynamic-island ${urgentQueue ? 'has-activity' : ''}`}
              title={urgentQueue ? `Fila Ativa: #${urgentQueue.ticketNumber} - ${urgentQueue.companyName}` : 'FilaFlow Live Activity'}
            >
              <div className="ff-island-sensor-group">
                <div className="ff-island-camera"></div>
                <div className="ff-island-mic"></div>
              </div>
              {urgentQueue ? (
                <div className="ff-island-content">
                  <span className="island-dot"></span>
                  <span className="island-text">
                    #{urgentQueue.ticketNumber} • {urgentQueue.companyName.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <div className="ff-island-indicator"></div>
              )}
            </div>

            <div className="ff-status-icons">
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>

          {/* Screen Content Container */}
          <div className="ff-phone-screen-clean">
            {activeTab === 'dashboard' && (
              <MobileDashboard
                activeQueues={activeQueues}
                selectedQueueId={selectedQueueId}
                onSelectQueue={onSelectQueue}
                onOpenQrScanner={onOpenQrScanner}
                onOpenSearch={onOpenSearch}
                onRemoveQueue={onRemoveQueue}
                onClientImOnMyWay={onClientImOnMyWay}
                onClientAskMoreTime={onClientAskMoreTime}
                onApproveReceptionCheckin={onApproveReceptionCheckin}
                hasConflict={hasConflict}
                onDismissConflict={onDismissConflict}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'queues' && (
              <MobileQueuesView
                activeQueues={activeQueues}
                selectedQueueId={selectedQueueId}
                onSelectQueue={onSelectQueue}
                onRemoveQueue={onRemoveQueue}
                onClientImOnMyWay={onClientImOnMyWay}
                onClientAskMoreTime={onClientAskMoreTime}
                onApproveReceptionCheckin={onApproveReceptionCheckin}
                onOpenSearch={onOpenSearch}
                onOpenQrScanner={onOpenQrScanner}
              />
            )}

            {activeTab === 'explore' && (
              <MobileExploreView
                onSelectBusiness={onSelectBusiness || onOpenSearch}
                onOpenQrScanner={onOpenQrScanner}
              />
            )}

            {activeTab === 'notifications' && (
              <MobileNotificationsView
                onPlayChime={onPlayChime}
              />
            )}

            {activeTab === 'profile' && (
              <MobileProfileView
                onGoToLanding={onGoToLanding}
                onGoToCompany={onGoToCompany}
              />
            )}
          </div>

          {/* Native Bottom Navigation Bar */}
          <nav className="ff-mob-bottom-nav">
            <button 
              className={`mob-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Home size={19} />
              <span>Início</span>
            </button>

            <button 
              className={`mob-nav-tab ${activeTab === 'queues' ? 'active' : ''}`}
              onClick={() => setActiveTab('queues')}
            >
              <div className="tab-icon-relative">
                <Ticket size={19} />
                {activeQueues.length > 0 && (
                  <span className="mob-tab-badge">{activeQueues.length}</span>
                )}
              </div>
              <span>Filas</span>
            </button>

            <button 
              className={`mob-nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTab('explore')}
            >
              <Compass size={19} />
              <span>Explorar</span>
            </button>

            <button 
              className={`mob-nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <div className="tab-icon-relative">
                <Bell size={19} />
                <span className="mob-tab-badge dot"></span>
              </div>
              <span>Alertas</span>
            </button>

            <button 
              className={`mob-nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={19} />
              <span>Perfil</span>
            </button>
          </nav>

          {/* iOS / Modern Home Indicator Bar */}
          <div className="ff-phone-home-indicator">
            <div className="ff-home-pill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
