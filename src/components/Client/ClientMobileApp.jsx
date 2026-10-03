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
  Zap,
  LogIn
} from 'lucide-react';
import MobileDashboard from './MobileDashboard';
import MobileQueuesView from './MobileQueuesView';
import MobileExploreView from './MobileExploreView';
import MobileNotificationsView from './MobileNotificationsView';
import MobileProfileView from './MobileProfileView';
import MobileAuthView from './MobileAuthView';

export default function ClientMobileApp({
  activeQueues,
  selectedQueueId,
  onSelectQueue,
  onOpenQrScanner,
  onOpenSearch,
  onRemoveQueue,
  onSecretaryCheckin,
  onClientImOnMyWay,
  onClientAskMoreTime,
  onApproveReceptionCheckin,
  hasConflict,
  onDismissConflict,
  onGoToLanding,
  onGoToCompany,
  onSelectBusiness,
  onPlayChime,
  currentUser,
  isAuthenticated = true,
  onAuthSuccess,
  onLogout,
  isAuthOpen,
  setIsAuthOpen,
  authMode = 'login',
  setAuthMode
}) {
  const sanitizeClientUser = (u) => {
    if (!u || u.name?.includes('Dr.') || u.email?.includes('clinicavida')) {
      return {
        id: 'usr_client',
        name: 'Rafael Silva',
        email: 'rafael.silva@email.com',
        phone: '(11) 98765-4321',
        cpf: '345.678.901-22',
        insurance: 'Unimed Nacional',
        cardNumber: '0012.3456.7890.1234',
        avatarInitial: 'R',
        role: 'patient'
      };
    }
    return u;
  };

  // Internal Client Authentication State (Self-contained + Props-aware)
  const [clientUser, setClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('filaflow_client_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !parsed.name.includes('Dr.') && !parsed.email?.includes('clinicavida')) {
          return parsed;
        }
      }
    } catch (e) {}
    return sanitizeClientUser(currentUser);
  });

  const [clientIsAuth, setClientIsAuth] = useState(() => {
    const saved = localStorage.getItem('filaflow_client_is_auth');
    if (saved !== null) return saved === 'true';
    return isAuthenticated !== undefined ? isAuthenticated : true;
  });

  // Internal state fallback for Auth view
  const [internalAuthOpen, setInternalAuthOpen] = useState(false);
  const [internalAuthMode, setInternalAuthMode] = useState(authMode || 'login');

  // Quando o usuário não estiver autenticado, a tela de login/cadastro é obrigatória
  const effectiveAuthOpen = !clientIsAuth || (isAuthOpen !== undefined ? isAuthOpen : internalAuthOpen);

  const handleSetAuthOpen = (val) => {
    // Se o cliente não estiver autenticado, não permite fechar a tela de auth
    if (!clientIsAuth && !val) return;
    setInternalAuthOpen(val);
    if (setIsAuthOpen) setIsAuthOpen(val);
  };

  const effectiveAuthMode = authMode || internalAuthMode;
  const handleSetAuthMode = setAuthMode || setInternalAuthMode;

  // Real client logout handler: clears session and immediately opens the Reference Login screen!
  const handleClientLogout = () => {
    try {
      localStorage.removeItem('filaflow_client_user');
      localStorage.setItem('filaflow_client_is_auth', 'false');
    } catch (e) {}
    setClientUser(null);
    setClientIsAuth(false);
    if (onLogout) onLogout();
    handleSetAuthMode('login');
    handleSetAuthOpen(true);
  };

  // Real client auth success handler
  const handleClientAuthSuccess = (user) => {
    const cleanUser = sanitizeClientUser(user);
    try {
      localStorage.setItem('filaflow_client_is_auth', 'true');
      localStorage.setItem('filaflow_client_user', JSON.stringify(cleanUser));
    } catch (e) {}
    setClientUser(cleanUser);
    setClientIsAuth(true);
    handleSetAuthOpen(false);
    if (onAuthSuccess) onAuthSuccess(cleanUser);
    setActiveTab('dashboard');
  };

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
            <span>FilaFlow Mobile</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Botão Direto para Abrir / Testar Login & Cadastro */}
            <button
              onClick={() => {
                handleSetAuthMode('login');
                handleSetAuthOpen(true);
              }}
              className="ff-ext-nav-btn purple"
              title="Abrir Tela de Login & Cadastro estilo Referência"
            >
              <LogIn size={13} />
              <span>Entrar / Cadastrar</span>
            </button>

            {clientIsAuth && (
              <button
                onClick={() => setActiveTab('profile')}
                className="ff-ext-nav-btn"
                title={`Logado como ${clientUser?.name || 'Usuário'}`}
              >
                <User size={13} />
                <span>{clientUser?.name ? clientUser.name.split(' ')[0] : 'Perfil'}</span>
              </button>
            )}

            <button
              onClick={onGoToCompany}
              className="ff-ext-nav-btn"
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
          <div className={`ff-phone-status-bar ${effectiveAuthOpen ? 'auth-mode' : ''}`}>
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
          <div className={`ff-phone-screen-clean ${effectiveAuthOpen ? 'is-auth-screen' : ''}`}>
            {effectiveAuthOpen ? (
              <MobileAuthView
                initialMode={effectiveAuthMode}
                onSuccess={handleClientAuthSuccess}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <MobileDashboard
                    activeQueues={activeQueues}
                    selectedQueueId={selectedQueueId}
                    onSelectQueue={onSelectQueue}
                    onOpenQrScanner={onOpenQrScanner}
                    onOpenSearch={onOpenSearch}
                    onRemoveQueue={onRemoveQueue}
                    onSecretaryCheckin={onSecretaryCheckin}
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
                    onSecretaryCheckin={onSecretaryCheckin}
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
                    currentUser={clientUser}
                    isAuthenticated={clientIsAuth}
                    onLogout={handleClientLogout}
                    onOpenLogin={() => {
                      handleSetAuthMode('login');
                      handleSetAuthOpen(true);
                    }}
                    onOpenRegister={() => {
                      handleSetAuthMode('signup');
                      handleSetAuthOpen(true);
                    }}
                    onGoToLanding={onGoToLanding}
                    onGoToCompany={onGoToCompany}
                  />
                )}
              </>
            )}
          </div>

          {/* Native Bottom Navigation Bar (Oculto se estiver na tela de Auth) */}
          {!effectiveAuthOpen && (
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
          )}

          {/* iOS / Modern Home Indicator Bar */}
          <div className="ff-phone-home-indicator">
            <div className="ff-home-pill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
