import React, { useState, useEffect } from 'react';
import { useAppRouter } from './router/useAppRouter';
import Navbar from './components/LandingPage/Navbar';
import LandingPage from './components/LandingPage/LandingPage';
import CompanyDashboard from './components/Company/CompanyDashboard';
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
  ensureAuthToken 
} from './services/api';

export default function App() {
  // Client-Side History Router: '/' (Site) | '/app' (Mobile App) | '/empresa' (SaaS B2B) | '/profissional' (Consultório) | '/checkout' (Pagamento)
  const { currentPath, navigate, isAppRoute, isCompanyRoute, isCheckoutRoute, isProfessionalRoute, isSiteRoute } = useAppRouter();
  const [activeProfessional, setActiveProfessional] = useState(REGISTERED_PROFESSIONALS[0]);

  // Checkout Selected Plan State
  const [checkoutPlan, setCheckoutPlan] = useState('Profissional');
  const [checkoutCycle, setCheckoutCycle] = useState('monthly');

  // Authentication State - Conectado diretamente à empresa padrão para operação imediata com backend
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Carlos Mendes',
    email: 'atendimento@clinicavida.com.br',
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro'
  });

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

  // -------------------------------------------------------------
  // Sincronização Automática com o Backend FastAPI & WebSockets
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Garante autenticação em segundo plano com o backend (JWT)
    ensureAuthToken().catch((err) => {
      console.log('[FilaFlow] Backend não detectado ou inicializando:', err);
    });

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

            // Atualiza fila de espera no dashboard caso venha do backend
            if (vidaQueue.aheadList && vidaQueue.aheadList.length > 0) {
              setCompanyWaitingQueue(
                vidaQueue.aheadList.map((t, idx) => ({
                  ticket: t.ticket || `#${idx + 44}`,
                  name: t.name || 'Paciente',
                  service: vidaQueue.serviceName || 'Consulta Geral',
                  time: t.time || '~15 min',
                  isPriority: false,
                  isUser: !!t.isUser
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn('[FilaFlow] Rodando com dados locais:', err);
      }
    }

    syncBackendData();

    // 3. Conexão WebSocket para receber chamadas de senha e recálculos da IA em tempo real
    const ws = setupQueueWebSocket((event) => {
      console.log('[FilaFlow WS Recebido]', event);
      if (event.type === 'TICKET_CALLED') {
        playChime();
        const ticketNum = event.ticketNumber || event.ticket?.ticket_number || '#--';
        const clientName = event.customerName || event.ticket?.customer_name || 'Paciente';
        const roomName = event.room || 'Consultório 04';

        setActiveAttendingTicket({
          ticket: ticketNum,
          name: clientName,
          service: event.serviceName || 'Atendimento'
        });

        setCompanyWaitingQueue((prev) => prev.filter((t) => t.ticket !== ticketNum));
        showToast(`🔔 SENHA CHAMADA: ${ticketNum} (${clientName}) no ${roomName}`);
      } else if (event.type === 'QUEUE_UPDATED' || event.type === 'AI_PREDICTIONS_UPDATED') {
        syncBackendData();
      }
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Navegação direta para o Painel da Empresa sem telas de login/cadastro
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
    navigate('/');
    showToast('Retornou à página inicial.');
  };

  // 1. Chamar Próxima Senha (integrado à API real e com fallback local imediato)
  const handleCallNextTicket = async () => {
    // Tenta chamar a API do backend
    const apiRes = await callNextTicketApi('clinica-vida');

    if (apiRes && apiRes.called_ticket) {
      const ct = apiRes.called_ticket;
      const nextOne = {
        ticket: ct.ticket_number,
        name: ct.customer_name,
        service: ct.service_name,
        isUser: ct.is_user
      };

      setActiveAttendingTicket(nextOne);
      if (apiRes.remaining_queue) {
        setCompanyWaitingQueue(
          apiRes.remaining_queue.map((t) => ({
            ticket: t.ticket_number,
            name: t.customer_name,
            service: t.service_name,
            time: t.estimated_wait_text || '~12 min',
            isPriority: t.is_priority,
            isUser: t.is_user
          }))
        );
      } else {
        setCompanyWaitingQueue((prev) => prev.slice(1));
      }

      playChime();
      showToast(`🔔 Senha ${ct.ticket_number} chamada no ${businessData.room || 'Consultório 04'}!`);
      return;
    }

    // Fallback local se o backend estiver iniciando ou offline
    if (companyWaitingQueue.length === 0) {
      alert('Não há mais clientes na fila de espera no momento.');
      return;
    }

    const nextOne = companyWaitingQueue[0];
    const remainingQueue = companyWaitingQueue.slice(1);

    setActiveAttendingTicket(nextOne);
    setCompanyWaitingQueue(remainingQueue);
    playChime();

    if (nextOne.isUser || nextOne.ticket === '#47') {
      showToast(`🔔 SUA VEZ CHEGOU! Senha ${nextOne.ticket} chamada no ${businessData.room || 'Consultório 04'}.`);
    } else {
      showToast(`🔔 Senha ${nextOne.ticket} (${nextOne.name}) chamada no ${businessData.room || 'Consultório 04'}.`);
    }

    // Sincroniza aplicativo cliente
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
    handleCallNextTicket();
  };

  // 4. Finalizar atendimento atual
  const handleFinishCurrent = () => {
    handleCallNextTicket();
  };

  // 5. Emitir Senha Manual no Balcão
  const handleAddManualTicket = async ({ name, serviceName, isPriority }) => {
    addManualTicketApi({
      queue_id: 'clinica-vida',
      customer_name: name,
      service_name: serviceName,
      is_priority: isPriority
    }).catch(() => {});

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
    showToast(`Senha ${newTicketObj.ticket} emitida e adicionada à fila!`);
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
        />
      )}

      {/* ROTA 3: /empresa (Painel Operacional da Empresa DIRETO - Sem bloqueio de login/cadastro) */}
      {isCompanyRoute && (
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
          onGoToSite={() => navigate('/')}
          onLogout={handleLogout}
        />
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
