import React, { useState, useEffect, useRef } from 'react';
import { useAppRouter } from './router/useAppRouter';
import Navbar from './components/LandingPage/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import CompanyDashboard from './components/Company/CompanyDashboard';
import CompanyLogin from './components/Company/CompanyLogin';
import ProfessionalWorkspace from './components/Professional/ProfessionalWorkspace';
import ClientMobileApp from './components/Client/ClientMobileApp';
import QrScannerModal from './components/Client/QrScannerModal';
import PreCheckinModal from './components/Client/PreCheckinModal';
import QueueSearchModal from './components/Client/QueueSearchModal';
import PricingModal from './components/Common/PricingModal';
import CheckoutPage from './components/Checkout/CheckoutPage';
import SimControlBar from './components/Common/SimControlBar';
import { INITIAL_QUEUES, REGISTERED_PROFESSIONALS } from './data/mockData';
import { 
  fetchQueues, 
  callNextTicketApi, 
  reportDelayApi, 
  addManualTicketApi, 
  setupQueueWebSocket, 
  fetchCurrentUser,
  fetchQueueStateApi,
  getToken,
  clearAuth,
  AUTH_CLEARED_EVENT
} from './services/api';

export default function App() {
  // Client-Side History Router: '/' (Site) | '/app' (Mobile App) | '/empresa' (SaaS B2B) | '/profissional' (Consultório) | '/checkout' (Pagamento)
  const { currentPath, navigate, isAppRoute, isCompanyRoute, isCheckoutRoute, isProfessionalRoute, isSiteRoute } = useAppRouter();
  const [activeProfessional, setActiveProfessional] = useState(REGISTERED_PROFESSIONALS[0]);

  // Checkout Selected Plan State
  const [checkoutPlan, setCheckoutPlan] = useState('Profissional');
  const [checkoutCycle, setCheckoutCycle] = useState('monthly');

  // Authentication State - Empresa / Profissional (B2B)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckedPath, setAuthCheckedPath] = useState(null);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;
    const resetSession = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
    };
    const validateSession = async () => {
      if (!isCompanyRoute) return;
      setAuthCheckedPath(null);
      setSessionError('');
      try {
        const user = await fetchCurrentUser();
        if (active) {
          setCurrentUser(user);
          setIsAuthenticated(Boolean(user));
        }
      } catch (err) {
        if (active) {
          resetSession();
          setSessionError('Não foi possível validar sua sessão. Entre novamente.');
        }
      } finally {
        if (active) setAuthCheckedPath(currentPath);
      }
    };
    const onStorage = (event) => {
      if (event.key === 'filaflow_token' || event.key === null) {
        resetSession();
        validateSession();
      }
    };
    window.addEventListener(AUTH_CLEARED_EVENT, resetSession);
    window.addEventListener('storage', onStorage);
    validateSession();
    return () => {
      active = false;
      window.removeEventListener(AUTH_CLEARED_EVENT, resetSession);
      window.removeEventListener('storage', onStorage);
    };
  }, [currentPath, isCompanyRoute]);

  // Client / Patient User for Mobile App (Público em geral, NÃO médico!)
  const [mobileClientUser, setMobileClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('filaflow_client_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.name?.includes('Dr.') && !parsed.name?.includes('Médic')) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      name: 'Rafael Silva',
      email: 'rafael.silva@email.com',
      phone: '(11) 98765-4321',
      cpf: '345.678.901-22',
      insurance: 'Unimed Nacional',
      cardNumber: '0012.3456.7890.1234',
      avatarInitial: 'R',
      role: 'patient'
    };
  });
  const [isClientAuthenticated, setIsClientAuthenticated] = useState(true);

  // Company State
  const [businessData, setBusinessData] = useState({
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    attendantName: 'Dr. Carlos Mendes',
    category: 'Clínica',
    room: 'Consultório 04'
  });

  // Active Attending Ticket in Company Dashboard
  const [activeAttendingTicket, setActiveAttendingTicket] = useState(null);

  // Waiting Queue in Company Dashboard
  const [companyWaitingQueue, setCompanyWaitingQueue] = useState([]);
  const [queueReady, setQueueReady] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [queueBusy, setQueueBusy] = useState(false);
  const queueOperation = useRef(false);
  const queueRefresh = useRef(null);
  const queueVersion = useRef(0);

  const toDashboardTicket = (ticket) => ticket && ({
    ticket: ticket.ticket_number,
    name: ticket.customer_name,
    service: ticket.service_name,
    time: ticket.estimated_wait_text,
    isPriority: ticket.is_priority,
    isUser: false
  });

  const applyQueueState = (data) => {
    setActiveAttendingTicket(toDashboardTicket(data.active_ticket));
    setCompanyWaitingQueue(data.remaining_queue.map(toDashboardTicket));
  };

  useEffect(() => {
    let active = true;
    let refreshing = false;
    let refreshRequested = false;
    let ws = null;
    setQueueReady(false);
    setQueueError('');

    const refreshQueue = async () => {
      refreshRequested = true;
      if (!active || refreshing || queueOperation.current) return;
      refreshing = true;
      try {
        while (active && refreshRequested && !queueOperation.current) {
          refreshRequested = false;
          const version = queueVersion.current;
          const data = await fetchQueueStateApi();
          if (!active) return;
          // Uma consulta antiga não deve sobrescrever uma operação mais recente.
          if (version !== queueVersion.current) {
            refreshRequested = true;
            continue;
          }
          applyQueueState(data);
          setQueueReady(true);
        }
      } catch {
        if (active) {
          setQueueReady(false);
          setQueueError('Não foi possível atualizar a fila. Recarregue a página.');
        }
      } finally {
        refreshing = false;
      }
    };

    if (isAuthenticated && isCompanyRoute) {
      queueRefresh.current = refreshQueue;
      refreshQueue();
      ws = setupQueueWebSocket((event) => {
        if (['READY', 'QUEUE_UPDATED', 'TICKET_CALLED'].includes(event.type)) refreshQueue();
      }, 'clinica-vida', (connected) => {
        if (active) setQueueError(connected ? '' : 'Atualização em tempo real interrompida. Tentando reconectar.');
      });
    } else {
      setActiveAttendingTicket(null);
      setCompanyWaitingQueue([]);
    }
    return () => {
      active = false;
      queueRefresh.current = null;
      ws?.close();
    };
  }, [isAuthenticated, isCompanyRoute]);

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

  // -------------------------------------------------------------
  // Sincronização Automática com o Backend FastAPI & WebSockets
  // -------------------------------------------------------------
  useEffect(() => {
    // 2. Busca filas reais do backend FastAPI
    async function syncBackendData() {
      try {
        const queues = await fetchQueues();
        if (Array.isArray(queues) && queues.length > 0) {
          console.log('[FilaFlow] Filas sincronizadas com o backend:', queues);
          const vidaQueue = queues.find((q) => q.id === 'clinica-vida') || queues[0];
          if (vidaQueue) {
            setBusinessData((prev) => ({
              ...prev,
              companyName: vidaQueue.companyName || prev.companyName,
              attendantName: vidaQueue.attendantName || prev.attendantName,
              room: vidaQueue.room || prev.room
            }));


          }
        }
      } catch (err) {
        console.warn('[FilaFlow] Rodando com dados locais:', err);
      }
    }

    syncBackendData();

  }, []);

  // A rota empresarial valida a sessão antes de exibir o painel.
  const handleOpenDashboard = () => {
    navigate('/empresa/dashboard');
  };

  const handleOpenProfessional = (professionalObj = null) => {
    if (professionalObj) {
      setActiveProfessional(professionalObj);
    } else if (!activeProfessional) {
      setActiveProfessional(REGISTERED_PROFESSIONALS[0]);
    }
    navigate('/profissional');
  };

  const handleOpenClient = () => {
    navigate('/app');
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
    showToast('Sessão encerrada.');
  };

  const handleCompanyLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setSessionError('');
    setAuthCheckedPath('/empresa/dashboard');
    navigate('/empresa/dashboard');
  };

  // A chamada só altera o painel depois da confirmação do servidor.
  const handleCallNextTicket = async () => {
    if (!queueReady || queueOperation.current) return null;
    queueOperation.current = true;
    queueVersion.current += 1;
    setQueueBusy(true);
    setQueueError('');
    const token = getToken();
    try {
      const data = await callNextTicketApi('clinica-vida');
      if (getToken() !== token) return null;
      applyQueueState(data);
      if (!data.called_ticket) {
        showToast('Não há clientes na fila de espera.');
        return null;
      }
      showToast(`Senha ${data.called_ticket.ticket_number} chamada no ${businessData.room}.`);
      return data.called_ticket;
    } catch (err) {
      setQueueError(err.message);
      return null;
    } finally {
      queueOperation.current = false;
      setQueueBusy(false);
      queueRefresh.current?.();
    }
  };

  // 2. Reportar Atraso (recalculado com IA)
  const handleReportDelay = async () => {
    reportDelayApi('clinica-vida', 5).catch(() => {});

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

  // 3. Pular senha / Não compareceu
  const handleSkipTicket = () => {
    showToast('O registro de ausência ainda não está integrado.');
  };

  // 4. Finalizar atendimento atual
  const handleFinishCurrent = () => {
    showToast('A conclusão de atendimento ainda não está integrada.');
  };

  // 5. Emitir Senha Manual no Balcão
  const handleAddManualTicket = async ({ name, serviceName, isPriority }) => {
    if (!queueReady || queueOperation.current) throw new Error('Aguarde a atualização da fila.');
    queueOperation.current = true;
    queueVersion.current += 1;
    setQueueBusy(true);
    const token = getToken();
    try {
    const ticket = await addManualTicketApi({
      queue_id: 'clinica-vida',
      customer_name: name,
      service_name: serviceName,
      is_priority: isPriority
    });
    if (getToken() !== token) throw new Error('Sessão encerrada. Entre novamente para consultar a fila.');

    const newTicketObj = {
      ticket: ticket.ticket_number,
      name: ticket.customer_name,
      service: ticket.service_name,
      time: ticket.estimated_wait_text,
      isPriority: ticket.is_priority
    };

    setCompanyWaitingQueue((prev) => [...prev, newTicketObj].sort(
      (a, b) => Number(b.isPriority) - Number(a.isPriority)
    ));
    showToast(`Senha ${newTicketObj.ticket} emitida e adicionada à fila!`);
    return ticket;
    } finally {
      queueOperation.current = false;
      setQueueBusy(false);
      queueRefresh.current?.();
    }
  };

  // 6. Confirmação do Pré-Checkin do Cliente
  const handleConfirmPreCheckin = ({ business, serviceName, userName, userPhone, isPriority }) => {
    const randomTicket = business.nextTicket || `${Math.floor(10 + Math.random() * 80)}`;
    const randomWait = parseInt(business.avgWait) || 20;
    const doctorName = business.attendantName || 'Dr. Carlos Mendes';

    const newQueueItem = {
      id: business.id + '-' + Date.now(),
      companyName: business.companyName,
      unitName: business.unitName,
      category: business.category,
      badgeColor: 'purple',
      serviceName: serviceName || 'Atendimento Geral',
      attendantName: doctorName,
      room: business.room || 'Consultório 04',
      ticketNumber: randomTicket,
      position: (business.currentWaiting || 3) + 1,
      initialWaitMin: randomWait,
      estimatedWaitText: `${randomWait - 3}-${randomWait + 4} min`,
      status: 'waiting',
      isCheckedInWithSecretary: false,
      statusDetail: `Aguardando aprovação para a fila de ${doctorName}`,
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
    navigate('/app');
    playChime();
    showToast(`Você está na fila de espera da recepção. Aguarde a confirmação de ${doctorName}...`);
  };

  // 7. Desistir de fila no app do cliente
  const handleRemoveClientQueue = (queueId) => {
    const updated = clientActiveQueues.filter((q) => q.id !== queueId);
    setClientActiveQueues(updated);
    if (selectedQueueId === queueId && updated.length > 0) {
      setSelectedQueueId(updated[0].id);
    }
    showToast('Você saiu da fila selecionada.');
  };

  // 8. Ações do cliente mobile
  const handleSecretaryCheckin = (queueId) => {
    const doctorTarget = 'Dr. Carlos Mendes';
    showToast(`Notificação enviada para a secretária. Sua autorização está sendo processada.`);

    setTimeout(() => {
      setClientActiveQueues((prevQueues) =>
        prevQueues.map((q) => {
          if (q.id === queueId) {
            return {
              ...q,
              isCheckedInWithSecretary: true,
              statusDetail: `Autorizado pela recepção! Na fila oficial de ${doctorTarget}`
            };
          }
          return q;
        })
      );
      playChime();
      showToast(`Convênio aprovado pela recepção! Você foi inserido na fila de ${doctorTarget}.`);
    }, 3500);
  };

  const handleClientImOnMyWay = (queueId) => {
    setClientActiveQueues((prevQueues) =>
      prevQueues.map((q) => {
        if (q.id === queueId) {
          return {
            ...q,
            statusDetail: '🚗 Notificação enviada: "Estou a caminho! Chegando em 5-10 min"'
          };
        }
        return q;
      })
    );
    showToast('Aviso enviado ao consultório: Você está a caminho!');
  };

  const handleClientAskMoreTime = (queueId) => {
    setClientActiveQueues((prevQueues) =>
      prevQueues.map((q) => {
        if (q.id === queueId) {
          return {
            ...q,
            position: q.position + 1,
            initialWaitMin: q.initialWaitMin + 12,
            estimatedWaitText: `${q.initialWaitMin + 8}-${q.initialWaitMin + 15} min`,
            statusDetail: '⏱️ Pedido de mais tempo aceito: Você cedeu 1 lugar na fila'
          };
        }
        return q;
      })
    );
    showToast('Você cedeu sua vez para o próximo. Seu tempo foi estendido.');
  };

  const handleScanBusiness = (scannedBusiness) => {
    setIsQrScannerOpen(false);
    setPreCheckinBusiness(scannedBusiness);
    setIsPreCheckinOpen(true);
  };

  const handleSearchSelectBusiness = (business) => {
    setIsSearchOpen(false);
    setPreCheckinBusiness(business);
    setIsPreCheckinOpen(true);
  };

  const handleResetQueues = () => {
    setClientActiveQueues(INITIAL_QUEUES);
    setSelectedQueueId('clinica-vida');
    setHasConflict(true);
    showToast('Dados e filas da demonstração restaurados.');
  };

  return (
    <div className="ff-app-root">
      {/* Top Navbar - Renderizada na Landing Page do Site (/) */}
      {isSiteRoute && (
        <Navbar
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onGoToLanding={() => navigate('/')}
          onOpenLogin={() => navigate('/empresa/dashboard')}
          onOpenSignup={() => navigate('/empresa/dashboard')}
          onOpenDashboard={handleOpenDashboard}
          onOpenPricing={() => setIsPricingOpen(true)}
          onOpenProfessional={() => handleOpenProfessional()}
          onLogout={handleLogout}
        />
      )}

      {/* Global Call Alert Banner */}
      {callAlertMessage && (
        <div
          style={{
            position: 'fixed',
            top: isAppRoute ? 16 : 84,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4000,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '12px 22px',
            borderRadius: 14,
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)',
            fontWeight: 800,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            animation: 'slide-in-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '90vw'
          }}
        >
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

      {/* ROTA 1: / (Site Institucional / Landing Page) */}
      {isSiteRoute && (
        <LandingPage
          activeQueue={clientActiveQueues[0]}
          onOpenSignup={() => navigate('/empresa/dashboard')}
          onOpenLogin={() => navigate('/empresa/dashboard')}
          onOpenPricing={() => setIsPricingOpen(true)}
        />
      )}

      {/* ROTA 2: /app (Mobile App Separado do Site) */}
      {isAppRoute && (
        <ClientMobileApp
          activeQueues={clientActiveQueues}
          selectedQueueId={selectedQueueId}
          onSelectQueue={setSelectedQueueId}
          onOpenQrScanner={() => setIsQrScannerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRemoveQueue={handleRemoveClientQueue}
          onSecretaryCheckin={handleSecretaryCheckin}
          onClientImOnMyWay={handleClientImOnMyWay}
          onClientAskMoreTime={handleClientAskMoreTime}
          hasConflict={hasConflict}
          onDismissConflict={() => setHasConflict(false)}
          onGoToLanding={() => navigate('/')}
          onGoToCompany={handleOpenDashboard}
          onSelectBusiness={handleSearchSelectBusiness}
          onPlayChime={playChime}
          currentUser={mobileClientUser}
          isAuthenticated={isClientAuthenticated}
          onLogout={() => setIsClientAuthenticated(false)}
          onAuthSuccess={(user) => {
            setMobileClientUser(user);
            setIsClientAuthenticated(true);
          }}
        />
      )}

      {/* ROTA 3: /empresa (Login e painel empresarial) */}
      {isCompanyRoute && (
        authCheckedPath !== currentPath ? <p role="status">Verificando sessão...</p> :
        isAuthenticated ? (
        <CompanyDashboard
          queueBusy={!queueReady || queueBusy}
          queueError={queueError}
          businessData={businessData}
          activeAttendingTicket={activeAttendingTicket}
          waitingQueue={companyWaitingQueue}
          onCallNext={handleCallNextTicket}
          onReportDelay={handleReportDelay}
          onFinishCurrent={handleFinishCurrent}
          onSkipTicket={handleSkipTicket}
          onAddManualTicket={handleAddManualTicket}
          onOpenMobileTest={handleOpenClient}
          onGoToSite={() => navigate('/')}
          onLogout={handleLogout}
        />
        ) : (
          <CompanyLogin
            initialError={sessionError}
            onLoginSuccess={handleCompanyLogin}
            onGoToSignup={() => alert('O cadastro de empresas ainda não está disponível.')}
            onCancel={() => navigate('/')}
          />
        )
      )}

      {/* ROTA 5: /profissional (Área do Profissional / Consultório Digital DIRETO) */}
      {isProfessionalRoute && (
        <ProfessionalWorkspace
          professional={activeProfessional || REGISTERED_PROFESSIONALS[0]}
          allProfessionals={REGISTERED_PROFESSIONALS}
          onSwitchProfessional={(pro) => setActiveProfessional(pro)}
          onLogout={() => {
            navigate('/');
            showToast('Sessão do consultório encerrada com sucesso.');
          }}
          onGoToSite={() => navigate('/')}
          onOpenMobileView={() => navigate('/app')}
        />
      )}

      {/* ROTA 4: /checkout (Página de Pagamento / Checkout por Pix, Cartão e Boleto) */}
      {isCheckoutRoute && (
        <CheckoutPage
          initialPlanName={checkoutPlan}
          initialBillingCycle={checkoutCycle}
          onGoBack={() => navigate('/')}
          onPaymentSuccess={(order) => {
            if (order && order.companyName) {
              setBusinessData((prev) => ({
                ...prev,
                companyName: order.companyName,
                attendantName: order.customerName || prev.attendantName,
                email: order.email || prev.email
              }));
              setCurrentUser({
                name: order.customerName || 'Responsável',
                email: order.email || 'contato@empresa.com.br',
                companyName: order.companyName,
                unitName: 'Unidade Principal'
              });
            }
            navigate('/empresa/dashboard');
            playChime();
            showToast(`Assinatura do ${order ? order.planName : 'Plano'} ativada com sucesso!`);
          }}
        />
      )}

      {/* Modais Globais Compartilhados */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={(plan, cycle = 'monthly') => {
          setIsPricingOpen(false);
          setCheckoutPlan(plan.name);
          setCheckoutCycle(cycle);
          navigate('/checkout');
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

      {/* Floating Simulation Bar (apenas em ambiente de desenvolvimento Vite) */}
      {import.meta.env.DEV && (
        <SimControlBar
          currentView={
            isProfessionalRoute
              ? 'professional'
              : isAppRoute
                ? 'client-mobile'
                : isCompanyRoute
                  ? 'company-dashboard'
                  : isCheckoutRoute
                    ? 'checkout'
                    : 'landing'
          }
          setCurrentView={(view) => {
            if (view === 'professional') navigate('/profissional');
            else if (view === 'client-mobile') navigate('/app');
            else if (view === 'company-dashboard' || view === 'company-auth') navigate('/empresa/dashboard');
            else if (view === 'checkout') navigate('/checkout');
            else navigate('/');
          }}
          onNextTicket={handleCallNextTicket}
          onSimulateDelay={handleReportDelay}
          onToggleConflict={() => setHasConflict(!hasConflict)}
          onResetQueues={handleResetQueues}
          onOpenAuth={() => navigate('/empresa/dashboard')}
        />
      )}
    </div>
  );
}
