import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import CompanyDashboard from './components/Company/CompanyDashboard';
import CompanyAuth from './components/Company/CompanyAuth';
import ClientMobileApp from './components/Client/ClientMobileApp';
import QrScannerModal from './components/Client/QrScannerModal';
import PreCheckinModal from './components/Client/PreCheckinModal';
import QueueSearchModal from './components/Client/QueueSearchModal';
import PricingModal from './components/Common/PricingModal';
import SimControlBar from './components/Common/SimControlBar';
import { INITIAL_QUEUES } from './data/mockData';

export default function App() {
  // Navigation View State: 'landing' | 'company-auth' | 'company-dashboard' | 'client-mobile'
  const [currentView, setCurrentView] = useState('landing');
  const [authInitialTab, setAuthInitialTab] = useState('login');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Company State
  const [businessData, setBusinessData] = useState({
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    attendantName: 'Dr. Carlos Mendes',
    category: 'Clínica',
    room: 'Consultório 04'
  });

  // Active Attending Ticket in Company Dashboard
  const [activeAttendingTicket, setActiveAttendingTicket] = useState({
    ticket: '#43',
    name: 'Maria Silva',
    service: 'Consulta Oftalmologia Geral'
  });

  // Waiting Queue in Company Dashboard
  const [companyWaitingQueue, setCompanyWaitingQueue] = useState([
    { ticket: '#44', name: 'João Santos', service: 'Consulta Oftalmologia Geral', time: '~10 min', isPriority: false },
    { ticket: '#45', name: 'Ana Costa', service: 'Exame de Fundo de Olho', time: '~22 min', isPriority: false },
    { ticket: '#46', name: 'Pedro Lima', service: 'Retorno de Consulta', time: '~34 min', isPriority: false },
    { ticket: '#47', name: 'Rafael', service: 'Consulta Oftalmologia Geral', time: '~42 min', isPriority: false, isUser: true },
    { ticket: '#48', name: 'Mariana Alencar', service: 'Avaliação Cirúrgica', time: '~55 min', isPriority: true }
  ]);

  // Client Active Queues (Multi-Queues in Mobile App)
  const [clientActiveQueues, setClientActiveQueues] = useState(INITIAL_QUEUES);
  const [selectedQueueId, setSelectedQueueId] = useState('clinica-vida');

  // AI Schedule Conflict Demonstration
  const [hasConflict, setHasConflict] = useState(true);

  // Global Call Announcement Toast for Client
  const [callAlertMessage, setCallAlertMessage] = useState(null);

  // Modals
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreCheckinOpen, setIsPreCheckinOpen] = useState(false);
  const [preCheckinBusiness, setPreCheckinBusiness] = useState(null);

  // Sound chime helper
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    } catch (e) {
      console.log('AudioContext not allowed without gesture');
    }
  };

  const showToast = (message) => {
    setCallAlertMessage(message);
    setTimeout(() => setCallAlertMessage(null), 6000);
  };

  // Auth Handlers
  const handleLoginSuccess = (data) => {
    setBusinessData((prev) => ({ ...prev, ...data }));
    setIsAuthenticated(true);
    setCurrentUser({
      name: data.attendantName || 'Dr. Carlos Mendes',
      email: data.email || 'atendimento@clinicavida.com.br',
      companyName: data.companyName || 'Clínica Vida',
      unitName: data.unitName || 'Unidade Centro'
    });
    setCurrentView('company-dashboard');
    playChime();
    showToast(`Conectado com sucesso como ${data.companyName || 'Clínica Vida'}!`);
  };

  const handleRegisterSuccess = (data) => {
    setBusinessData((prev) => ({ ...prev, ...data }));
    setIsAuthenticated(true);
    setCurrentUser({
      name: data.attendantName || 'Responsável',
      email: data.email || 'contato@empresa.com.br',
      companyName: data.companyName,
      unitName: data.unitName
    });
    setCurrentView('company-dashboard');
    playChime();
    showToast(`Parabéns! Fila de ${data.companyName} ativada com sucesso!`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('landing');
    showToast('Sessão encerrada com sucesso.');
  };

  const handleOpenLogin = () => {
    setAuthInitialTab('login');
    setCurrentView('company-auth');
  };

  const handleOpenSignup = () => {
    setAuthInitialTab('register');
    setCurrentView('company-auth');
  };

  const handleOpenDashboard = () => {
    if (isAuthenticated) {
      setCurrentView('company-dashboard');
    } else {
      setAuthInitialTab('login');
      setCurrentView('company-auth');
    }
  };

  const handleOpenClient = () => {
    setCurrentView('client-mobile');
  };

  // 1. Call Next Ticket in Company Dashboard
  const handleCallNextTicket = () => {
    if (companyWaitingQueue.length === 0) {
      alert('Não há mais clientes na fila de espera no momento.');
      return;
    }

    const nextOne = companyWaitingQueue[0];
    const remainingQueue = companyWaitingQueue.slice(1);

    setActiveAttendingTicket(nextOne);
    setCompanyWaitingQueue(remainingQueue);
    playChime();

    // Check if the called ticket is the user's (#47 or matching isUser)
    if (nextOne.isUser || nextOne.ticket === '#47') {
      showToast(`🔔 SUA VEZ CHEGOU! Senha ${nextOne.ticket} chamada no ${businessData.room || 'Consultório 04'}.`);
    }

    // Synchronize Client Mobile App queue state
    setClientActiveQueues((prevQueues) =>
      prevQueues.map((queue) => {
        if (queue.id === 'clinica-vida') {
          const newPos = Math.max(1, queue.position - 1);
          const newWait = Math.max(2, queue.initialWaitMin - 8);
          const isNowUserTurn = newPos === 1;

          return {
            ...queue,
            position: newPos,
            initialWaitMin: newWait,
            estimatedWaitText: isNowUserTurn ? 'Sua Vez! Dirija-se à Sala' : `${newWait - 4}-${newWait + 3} min`,
            status: isNowUserTurn ? 'ready' : 'waiting',
            statusDetail: isNowUserTurn
              ? '🟢 SUA VEZ: Dirija-se ao guichê/sala agora!'
              : `Ritmo acelerado: ${newPos} atendimentos à frente`,
            aheadList: queue.aheadList ? queue.aheadList.slice(1) : []
          };
        }
        return queue;
      })
    );
  };

  // 2. Simulate Delay (+5 min by AI)
  const handleReportDelay = () => {
    setClientActiveQueues((prevQueues) =>
      prevQueues.map((queue) => {
        if (queue.id === 'clinica-vida') {
          const newWait = queue.initialWaitMin + 5;
          return {
            ...queue,
            initialWaitMin: newWait,
            estimatedWaitText: `${newWait - 3}-${newWait + 5} min`,
            statusDetail: '⚠️ Previsão ajustada: +5 min de atraso detectado na consulta',
            delayWarning: '+5 min na consulta anterior'
          };
        }
        return queue;
      })
    );
    showToast('Atraso notificado. A IA recalculou o tempo das senhas seguintes.');
  };

  // 3. Skip current ticket / mark absent
  const handleSkipTicket = () => {
    handleCallNextTicket();
  };

  // 4. Finish current attendance
  const handleFinishCurrent = () => {
    handleCallNextTicket();
  };

  // 5. Add Manual Ticket from Counter (Balcão presencial)
  const handleAddManualTicket = ({ name, serviceName, isPriority }) => {
    const nextNum = Math.floor(50 + Math.random() * 40);
    const newTicketObj = {
      ticket: `#${nextNum}`,
      name,
      service: serviceName,
      time: `~${(companyWaitingQueue.length + 1) * 12} min`,
      isPriority
    };

    if (isPriority) {
      setCompanyWaitingQueue([companyWaitingQueue[0], newTicketObj, ...companyWaitingQueue.slice(1)]);
    } else {
      setCompanyWaitingQueue([...companyWaitingQueue, newTicketObj]);
    }
    showToast(`Senha ${newTicketObj.ticket} impressa e adicionada à fila!`);
  };

  // 6. Client: Pre-Checkin Complete
  const handleConfirmPreCheckin = ({ business, serviceName, userName, userPhone, isPriority }) => {
    const randomTicket = business.nextTicket || `${Math.floor(10 + Math.random() * 80)}`;
    const randomWait = parseInt(business.avgWait) || 20;

    const newQueueItem = {
      id: business.id + '-' + Date.now(),
      companyName: business.companyName,
      unitName: business.unitName,
      category: business.category,
      badgeColor: 'purple',
      serviceName: serviceName || 'Atendimento Geral',
      attendantName: business.attendantName || 'Equipe FilaFlow',
      room: business.room || 'Recepção',
      ticketNumber: randomTicket,
      position: (business.currentWaiting || 3) + 1,
      initialWaitMin: randomWait,
      estimatedWaitText: `${randomWait - 3}-${randomWait + 4} min`,
      status: 'waiting',
      statusDetail: 'Pré-check-in confirmado via QR Code',
      isAiRecalculating: false,
      delayWarning: null,
      joinedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      aheadList: [
        { ticket: `#${Number(randomTicket) - 2}`, name: 'Paciente Anterior', status: 'Em atendimento' },
        { ticket: `#${Number(randomTicket) - 1}`, name: 'Próximo da Vez', status: 'Aguardando' },
        { ticket: `#${randomTicket}`, name: `${userName} (Você)`, status: 'Sua vez', isUser: true }
      ]
    };

    setClientActiveQueues([newQueueItem, ...clientActiveQueues]);
    setSelectedQueueId(newQueueItem.id);
    setIsPreCheckinOpen(false);
    setCurrentView('client-mobile');
    playChime();
    showToast(`Check-in confirmado! Sua senha é #${randomTicket}.`);
  };

  // 7. Remove queue from client mobile app
  const handleRemoveClientQueue = (queueId) => {
    const updated = clientActiveQueues.filter((q) => q.id !== queueId);
    setClientActiveQueues(updated);
    if (selectedQueueId === queueId && updated.length > 0) {
      setSelectedQueueId(updated[0].id);
    }
    showToast('Você desistiu da fila selecionada.');
  };

  // 8. Client actions: "Estou a caminho" & "Pedir +5 min"
  const handleClientImOnMyWay = (queueId) => {
    // Notify company
  };

  const handleClientAskMoreTime = (queueId) => {
    handleReportDelay();
  };

  // 9. QR Scan trigger
  const handleScanBusiness = (business) => {
    setIsQrScannerOpen(false);
    setPreCheckinBusiness(business);
    setIsPreCheckinOpen(true);
  };

  // 10. Search Select trigger
  const handleSearchSelectBusiness = (business) => {
    setIsSearchOpen(false);
    setPreCheckinBusiness(business);
    setIsPreCheckinOpen(true);
  };

  // Reset to initial demo state
  const handleResetQueues = () => {
    setClientActiveQueues(INITIAL_QUEUES);
    setSelectedQueueId('clinica-vida');
    setHasConflict(true);
    showToast('Dados e filas da demonstração restaurados.');
  };

  return (
    <div className="ff-app-root">
      {/* Top Navbar - Only rendered on the public landing page */}
      {currentView === 'landing' && (
        <Navbar
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onGoToLanding={() => setCurrentView('landing')}
          onOpenLogin={handleOpenLogin}
          onOpenSignup={handleOpenSignup}
          onOpenDashboard={handleOpenDashboard}
          onOpenClient={handleOpenClient}
          onOpenPricing={() => setIsPricingOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Global Call Alert Banner (pops up on call or important notification) */}
      {callAlertMessage && (
        <div style={{
          position: 'fixed',
          top: 84,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 4000,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '14px 24px',
          borderRadius: 14,
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
          fontWeight: 800,
          fontSize: 15,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'slide-in-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <span>{callAlertMessage}</span>
          <button 
            onClick={() => setCallAlertMessage(null)}
            style={{ 
              color: 'white', 
              background: 'rgba(0,0,0,0.2)', 
              border: 'none', 
              padding: '4px 10px', 
              borderRadius: 6, 
              cursor: 'pointer',
              fontWeight: 700 
            }}
          >
            OK
          </button>
        </div>
      )}

      {/* VIEW 1: Site Institucional (Landing Page) */}
      {currentView === 'landing' && (
        <LandingPage
          activeQueue={clientActiveQueues[0]}
          onOpenMobileApp={handleOpenClient}
          onOpenSignup={handleOpenSignup}
          onOpenLogin={handleOpenLogin}
          onOpenPricing={() => setIsPricingOpen(true)}
        />
      )}

      {/* VIEW 2: Autenticação Unificada (Login & Cadastro) */}
      {currentView === 'company-auth' && (
        <CompanyAuth
          initialTab={authInitialTab}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLanding={() => setCurrentView('landing')}
          onGoToClient={handleOpenClient}
        />
      )}

      {/* VIEW 3: Painel da Empresa (Dashboard Operacional SaaS) */}
      {currentView === 'company-dashboard' && (
        <CompanyDashboard
          businessData={businessData}
          activeAttendingTicket={activeAttendingTicket}
          waitingQueue={companyWaitingQueue}
          onCallNext={handleCallNextTicket}
          onReportDelay={handleReportDelay}
          onFinishCurrent={handleFinishCurrent}
          onSkipTicket={handleSkipTicket}
          onAddManualTicket={handleAddManualTicket}
          onOpenMobileTest={handleOpenClient}
          onGoToSite={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {/* VIEW 4: App do Cliente (Multi-Filas no Celular) */}
      {currentView === 'client-mobile' && (
        <ClientMobileApp
          activeQueues={clientActiveQueues}
          selectedQueueId={selectedQueueId}
          onSelectQueue={setSelectedQueueId}
          onOpenQrScanner={() => setIsQrScannerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRemoveQueue={handleRemoveClientQueue}
          onClientImOnMyWay={handleClientImOnMyWay}
          onClientAskMoreTime={handleClientAskMoreTime}
          hasConflict={hasConflict}
          onDismissConflict={() => setHasConflict(false)}
          onGoToLanding={() => setCurrentView('landing')}
          onGoToCompany={handleOpenDashboard}
        />
      )}

      {/* Modais Globais */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={(plan) => {
          setIsPricingOpen(false);
          handleOpenSignup();
        }}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanBusiness={handleScanBusiness}
      />

      <PreCheckinModal
        isOpen={isPreCheckinOpen}
        business={preCheckinBusiness}
        onClose={() => setIsPreCheckinOpen(false)}
        onConfirmCheckin={handleConfirmPreCheckin}
      />

      <QueueSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectBusiness={handleSearchSelectBusiness}
      />

      {/* Floating Simulation Bar (Retrátil no Canto Inferior) */}
      <SimControlBar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onNextTicket={handleCallNextTicket}
        onSimulateDelay={handleReportDelay}
        onToggleConflict={() => setHasConflict(!hasConflict)}
        onResetQueues={handleResetQueues}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab);
          setCurrentView('company-auth');
        }}
      />
    </div>
  );
}
