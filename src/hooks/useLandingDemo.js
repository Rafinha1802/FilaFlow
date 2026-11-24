import { useState } from 'react';
import { INITIAL_QUEUES } from '../data/mockData';
import { reportDelayApi } from '../services/api';

// Estado da demonstração pública; a jornada persistida usa useClientCheckin.
export function useLandingDemo({ navigate, playChime, showToast }) {
  // Client / Patient User for Mobile App (Público em geral, NÃO médico!)
  const [mobileClientUser, setMobileClientUser] = useState(() => {
    try {
      const saved = localStorage.getItem('temfyla_client_user') || localStorage.getItem('filaflow_client_user');
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

  // Client Active Queues (Multi-Queues in Mobile App)
  const [clientActiveQueues, setClientActiveQueues] = useState(INITIAL_QUEUES);
  const [selectedQueueId, setSelectedQueueId] = useState('clinica-vida');

  // AI Schedule Conflict Demonstration
  const [hasConflict, setHasConflict] = useState(true);

  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPreCheckinOpen, setIsPreCheckinOpen] = useState(false);
  const [preCheckinBusiness, setPreCheckinBusiness] = useState(null);

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

  return {
    mobileClientUser, setMobileClientUser, isClientAuthenticated, setIsClientAuthenticated,
    clientActiveQueues, selectedQueueId, setSelectedQueueId, hasConflict, setHasConflict,
    isQrScannerOpen, setIsQrScannerOpen, isSearchOpen, setIsSearchOpen,
    isPreCheckinOpen, setIsPreCheckinOpen, preCheckinBusiness,
    handleReportDelay, handleConfirmPreCheckin, handleRemoveClientQueue,
    handleSecretaryCheckin, handleClientImOnMyWay, handleClientAskMoreTime,
    handleScanBusiness, handleSearchSelectBusiness, handleResetQueues,
  };
}
