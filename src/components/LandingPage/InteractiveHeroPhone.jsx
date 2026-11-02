import React, { useState, useEffect, useRef } from 'react';
import {
  Wifi,
  Battery,
  Home,
  Ticket,
  Compass,
  Bell,
  User,
  Zap
} from 'lucide-react';
import MobileDashboard from '../Client/MobileDashboard';
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

const STATIC_HERO_USER = {
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

export default function InteractiveHeroPhone({
  activeQueue,
  activeQueues = INITIAL_QUEUES,
  selectedQueueId
}) {
  const [currentTime, setCurrentTime] = useState('14:30');
  const [tiltStyle, setTiltStyle] = useState({});
  const wrapperRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = (x * 8).toFixed(2);
    const rotateX = (-y * 8).toFixed(2);
    setTiltStyle({
      transform: `perspective(1200px) translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'transform 0.15s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1200px) translateY(0px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });
  };

  const baseQueues = Array.isArray(activeQueues) && activeQueues.length > 0
    ? activeQueues
    : INITIAL_QUEUES;

  const effectiveSelectedQueueId = selectedQueueId || 'clinica-vida';

  const queuesToRender = EXTRA_CATEGORY_QUEUES[effectiveSelectedQueueId] &&
    !baseQueues.some((q) => q.id === effectiveSelectedQueueId)
    ? [...baseQueues, EXTRA_CATEGORY_QUEUES[effectiveSelectedQueueId]]
    : baseQueues;

  const urgentQueue = queuesToRender.length > 0
    ? [...queuesToRender].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
    : null;

  return (
    <div
      ref={wrapperRef}
      className="ff-phone-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="ff-phone-glow"></div>
      <div className="ff-phone-glow-secondary"></div>

      {/* Pop-ups Flutuantes (Micro-Badges ao redor do telefone na Landing Page) */}
      <div className="ff-float-chip ff-float-chip-top">
        <div className="ff-float-chip-icon red">
          <Bell size={13} />
        </div>
        <div className="ff-float-chip-content">
          <span className="chip-label">Alerta Automático</span>
          <span className="chip-value">{activeQueue?.chipTopText || 'Sua vez em 5 min • Sala 04'}</span>
        </div>
      </div>

      <div className="ff-float-chip ff-float-chip-bottom">
        <div className="ff-float-chip-icon purple">
          <Zap size={13} />
        </div>
        <div className="ff-float-chip-content">
          <span className="chip-label">Previsão por IA</span>
          <span className="chip-value">{activeQueue?.chipBottomText || 'IA: Fluxo +18% mais ágil hoje'}</span>
        </div>
      </div>

      {/* Device Frame Estático com o visual idêntico ao App e movimento suave ao aproximar o cursor */}
      <div className="ff-phone-device ff-phone-static-preview" style={tiltStyle}>
        <div className="ff-phone-bezel-reflection" />
        <div className="ff-phone-inner">
          {/* Status Bar */}
          <div className="ff-phone-status-bar">
            <span className="ff-status-clock">{currentTime}</span>

            {/* Dynamic Island */}
            <div className={`ff-phone-dynamic-island ${urgentQueue ? 'has-activity' : ''}`}>
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

          {/* Tela Estática na Senha (sem clique e sem scroll) */}
          <div className="ff-phone-screen-clean ff-hero-static-screen">
            <MobileDashboard
              currentUser={STATIC_HERO_USER}
              activeQueues={queuesToRender}
              selectedQueueId={effectiveSelectedQueueId}
              hasConflict={true}
            />
          </div>

          {/* Barra de Navegação Inferior Estática */}
          <nav className="ff-mob-bottom-nav ff-hero-static-nav">
            <button type="button" className="mob-nav-tab active" tabIndex={-1}>
              <Home size={19} />
              <span>Início</span>
            </button>

            <button type="button" className="mob-nav-tab" tabIndex={-1}>
              <div className="tab-icon-relative">
                <Ticket size={19} />
                <span className="mob-tab-badge">{queuesToRender.length}</span>
              </div>
              <span>Filas</span>
            </button>

            <button type="button" className="mob-nav-tab" tabIndex={-1}>
              <Compass size={19} />
              <span>Explorar</span>
            </button>

            <button type="button" className="mob-nav-tab" tabIndex={-1}>
              <div className="tab-icon-relative">
                <Bell size={19} />
                <span className="mob-tab-badge dot"></span>
              </div>
              <span>Alertas</span>
            </button>

            <button type="button" className="mob-nav-tab" tabIndex={-1}>
              <User size={19} />
              <span>Perfil</span>
            </button>
          </nav>

          {/* Home Indicator Bar */}
          <div className="ff-phone-home-indicator">
            <div className="ff-home-pill"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
