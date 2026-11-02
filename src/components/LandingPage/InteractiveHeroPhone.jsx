import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Home,
  Ticket,
  Compass,
  Bell,
  User
} from 'lucide-react';
import MobileDashboard from '../Client/MobileDashboard';
import MobileQueuesView from '../Client/MobileQueuesView';
import MobileExploreView from '../Client/MobileExploreView';
import MobileNotificationsView from '../Client/MobileNotificationsView';
import MobileProfileView from '../Client/MobileProfileView';
import MobileAuthView from '../Client/MobileAuthView';
import { INITIAL_QUEUES } from '../../data/mockData';

const EXTRA_CATEGORY_QUEUES = {
  beauty: {
    id: 'beauty',
    companyName: 'Don Corleone Barber Club',
    unitName: 'Unidade Jardins',
    category: 'Barbearia',
    badgeColor: 'purple',
    serviceName: 'Corte Degradê + Barba Terapia',
    attendantName: 'Dr. Marcos Barbeiro',
    room: 'Cadeira 02',
    ticketNumber: '09',
    position: 1,
    initialWaitMin: 5,
    estimatedWaitText: '4-7 min',
    status: 'waiting',
    statusDetail: 'Você é o próximo a ser atendido',
    staffNote: 'Ritmo de Marcos: ~5 min para finalizar acabamento'
  },
  public: {
    id: 'public',
    companyName: '2º Cartório de Registro Civil',
    unitName: 'Unidade Centro',
    category: 'Cartório',
    badgeColor: 'blue',
    serviceName: 'Reconhecimento de Firma & Procuração',
    attendantName: 'Dr. Ricardo (Tabelião)',
    room: 'Guichê 05',
    ticketNumber: '31',
    position: 2,
    initialWaitMin: 9,
    estimatedWaitText: '8-11 min',
    status: 'waiting',
    statusDetail: 'Guichê expresso em andamento',
    staffNote: 'Ritmo do Guichê 05: ~4 min por atendimento'
  }
};

export default function InteractiveHeroPhone({
  activeQueue,
  activeQueues = INITIAL_QUEUES,
  selectedQueueId,
  onSelectQueue,
  onOpenQrScanner,
  onOpenSearch,
  onRemoveQueue,
  onSecretaryCheckin,
  onClientImOnMyWay,
  onClientAskMoreTime,
  onApproveReceptionCheckin,
  hasConflict = true,
  onDismissConflict,
  onGoToLanding,
  onGoToCompany,
  onSelectBusiness,
  onPlayChime,
  currentUser,
  isAuthenticated = true,
  onAuthSuccess,
  onLogout
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

  const [clientUser, setClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('temfyla_client_user') || localStorage.getItem('filaflow_client_user');
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
    const saved = localStorage.getItem('temfyla_client_is_auth') || localStorage.getItem('filaflow_client_is_auth');
    if (saved !== null) return saved === 'true';
    return isAuthenticated !== undefined ? isAuthenticated : true;
  });

  const [internalAuthOpen, setInternalAuthOpen] = useState(false);
  const [internalAuthMode, setInternalAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [internalSelectedQueueId, setInternalSelectedQueueId] = useState(selectedQueueId || 'clinica-vida');
  const [internalConflict, setInternalConflict] = useState(hasConflict);
  const [currentTime, setCurrentTime] = useState('14:30');

  useEffect(() => {
    if (selectedQueueId) {
      setInternalSelectedQueueId(selectedQueueId);
    }
  }, [selectedQueueId]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const effectiveAuthOpen = !clientIsAuth || internalAuthOpen;

  const handleClientLogout = () => {
    try {
      localStorage.removeItem('temfyla_client_user');
      localStorage.removeItem('filaflow_client_user');
      localStorage.setItem('temfyla_client_is_auth', 'false');
      localStorage.setItem('filaflow_client_is_auth', 'false');
    } catch (e) {}
    setClientUser(null);
    setClientIsAuth(false);
    if (onLogout) onLogout();
    setInternalAuthMode('login');
    setInternalAuthOpen(true);
  };

  const handleClientAuthSuccess = (user) => {
    const cleanUser = sanitizeClientUser(user);
    try {
      localStorage.setItem('temfyla_client_is_auth', 'true');
      localStorage.setItem('temfyla_client_user', JSON.stringify(cleanUser));
    } catch (e) {}
    setClientUser(cleanUser);
    setClientIsAuth(true);
    setInternalAuthOpen(false);
    if (onAuthSuccess) onAuthSuccess(cleanUser);
    setActiveTab('dashboard');
  };

  const baseQueues = Array.isArray(activeQueues) && activeQueues.length > 0
    ? activeQueues
    : INITIAL_QUEUES;

  const effectiveSelectedQueueId = selectedQueueId || internalSelectedQueueId;

  const queuesToRender = EXTRA_CATEGORY_QUEUES[effectiveSelectedQueueId] &&
    !baseQueues.some((q) => q.id === effectiveSelectedQueueId)
    ? [...baseQueues, EXTRA_CATEGORY_QUEUES[effectiveSelectedQueueId]]
    : baseQueues;

  const handleSelectQueue = (id) => {
    setInternalSelectedQueueId(id);
    if (onSelectQueue) onSelectQueue(id);
  };

  // Most urgent queue for Dynamic Island (same logic as ClientMobileApp)
  const urgentQueue = queuesToRender.length > 0
    ? [...queuesToRender].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
    : null;

  return (
    <div className="ff-phone-wrapper">
      <div className="ff-phone-glow"></div>
      <div className="ff-phone-glow-secondary"></div>

      {/* Device Frame (Idêntico ao ClientMobileApp em /app) */}
      <div className="ff-phone-device">
        <div className="ff-phone-bezel-reflection" />
        <div className="ff-phone-inner">
          {/* Status Bar */}
          <div className={`ff-phone-status-bar ${effectiveAuthOpen ? 'auth-mode' : ''}`}>
            <span className="ff-status-clock">{currentTime}</span>

            {/* Dynamic Island with Live Queue Indicator */}
            <div
              className={`ff-phone-dynamic-island ${urgentQueue ? 'has-activity' : ''}`}
              title={urgentQueue ? `Fila Ativa: #${urgentQueue.ticketNumber} - ${urgentQueue.companyName}` : 'TemFyla Live Activity'}
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
                initialMode={internalAuthMode}
                onSuccess={handleClientAuthSuccess}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <MobileDashboard
                    currentUser={clientUser}
                    activeQueues={queuesToRender}
                    selectedQueueId={effectiveSelectedQueueId}
                    onSelectQueue={handleSelectQueue}
                    onOpenQrScanner={onOpenQrScanner}
                    onOpenSearch={onOpenSearch}
                    onRemoveQueue={onRemoveQueue}
                    onSecretaryCheckin={onSecretaryCheckin}
                    onClientImOnMyWay={onClientImOnMyWay}
                    onClientAskMoreTime={onClientAskMoreTime}
                    onApproveReceptionCheckin={onApproveReceptionCheckin}
                    hasConflict={hasConflict !== undefined ? hasConflict : internalConflict}
                    onDismissConflict={() => {
                      setInternalConflict(false);
                      if (onDismissConflict) onDismissConflict();
                    }}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onPlayChime={onPlayChime}
                  />
                )}

                {activeTab === 'queues' && (
                  <MobileQueuesView
                    activeQueues={queuesToRender}
                    selectedQueueId={effectiveSelectedQueueId}
                    onSelectQueue={handleSelectQueue}
                    onRemoveQueue={onRemoveQueue}
                    onSecretaryCheckin={onSecretaryCheckin}
                    onClientImOnMyWay={onClientImOnMyWay}
                    onClientAskMoreTime={onClientAskMoreTime}
                    onApproveReceptionCheckin={onApproveReceptionCheckin}
                    onOpenSearch={onOpenSearch}
                    onOpenQrScanner={onOpenQrScanner}
                    onPlayChime={onPlayChime}
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
                      setInternalAuthMode('login');
                      setInternalAuthOpen(true);
                    }}
                    onOpenRegister={() => {
                      setInternalAuthMode('signup');
                      setInternalAuthOpen(true);
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
                  {queuesToRender.length > 0 && (
                    <span className="mob-tab-badge">{queuesToRender.length}</span>
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
