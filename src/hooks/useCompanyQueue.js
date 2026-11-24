import { useEffect, useRef, useState } from 'react';
import { useOperationalQueues } from './useOperationalQueues';
import { getToken, fetchQueueStateApi, setupQueueWebSocket, callNextTicketApi, finishCurrentTicketApi, addManualTicketApi } from '../services/api';

export function useCompanyQueue(operationalToken, showToast) {
  const operational = useOperationalQueues(operationalToken);
  const operationalQueue = operational.selected;
  const operationalContext = operationalQueue ? operationalToken + ':' + operationalQueue.id : '';
  const currentQueueContext = useRef('');
  currentQueueContext.current = operationalContext;
  const [queueState, setQueueState] = useState({ context: '', data: null });
  const [queueError, setQueueError] = useState('');
  const [queueActionError, setQueueActionError] = useState('');
  const [queueBusy, setQueueBusy] = useState(false);
  const visibleState = queueState.context === operationalContext ? queueState.data : null;
  const queueReady = Boolean(operationalQueue && visibleState);
  const canIssue = ['admin', 'reception'].includes(operationalQueue?.role);
  const canAttend = ['admin', 'professional'].includes(operationalQueue?.role);

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

  const activeAttendingTicket = toDashboardTicket(visibleState?.active_ticket);
  const companyWaitingQueue = visibleState?.remaining_queue.map(toDashboardTicket) || [];

  const applyQueueState = (data, context) => {
    setQueueState({ context, data });
  };

  useEffect(() => {
    currentQueueContext.current = operationalContext;
    let active = true;
    let refreshing = false;
    let refreshRequested = false;
    let ws = null;
    setQueueState({ context: operationalContext, data: null });
    setQueueError('');
    setQueueActionError('');

    const refreshQueue = async () => {
      refreshRequested = true;
      if (!active || refreshing || queueOperation.current) return;
      refreshing = true;
      try {
        while (active && refreshRequested && !queueOperation.current) {
          refreshRequested = false;
          const version = queueVersion.current;
          const data = await fetchQueueStateApi(operationalQueue.id);
          if (!active) return;
          // Uma consulta antiga não deve sobrescrever uma operação mais recente.
          if (version !== queueVersion.current) {
            refreshRequested = true;
            continue;
          }
          applyQueueState(data, operationalContext);
        }
      } catch {
        if (active) {
          setQueueState({ context: operationalContext, data: null });
          setQueueError('Não foi possível atualizar a fila. Recarregue a página.');
        }
      } finally {
        refreshing = false;
      }
    };

    if (operationalQueue) {
      queueRefresh.current = refreshQueue;
      refreshQueue();
      ws = setupQueueWebSocket((event) => {
        if (['READY', 'QUEUE_UPDATED', 'TICKET_CALLED'].includes(event.type)) refreshQueue();
      }, operationalQueue.id, (connected) => {
        if (active) setQueueError(connected ? '' : 'Atualização em tempo real interrompida. Tentando reconectar.');
      });
    } else {
      setQueueState({ context: operationalContext, data: null });
    }
    return () => {
      active = false;
      if (currentQueueContext.current === operationalContext) currentQueueContext.current = '';
      queueRefresh.current = null;
      ws?.close();
    };
  }, [operationalContext]);

  // A chamada só altera o painel depois da confirmação do servidor.
  const handleCallNextTicket = async () => {
    if (!queueReady || !canAttend || queueOperation.current) return null;
    queueOperation.current = true;
    queueVersion.current += 1;
    setQueueBusy(true);
    setQueueError('');
    setQueueActionError('');
    const token = getToken();
    try {
      const context = operationalContext;
      const data = await callNextTicketApi(operationalQueue.id);
      if (getToken() !== token || currentQueueContext.current !== context) return null;
      applyQueueState(data, operationalContext);
      if (!data.called_ticket) {
        showToast('Não há clientes na fila de espera.');
        return null;
      }
      showToast(`Senha ${data.called_ticket.ticket_number} chamada no ${operationalQueue.room}.`);
      return data.called_ticket;
    } catch (err) {
      if (getToken() === token && currentQueueContext.current === operationalContext) setQueueActionError(err.message);
      return null;
    } finally {
      queueOperation.current = false;
      setQueueBusy(false);
      queueRefresh.current?.();
    }
  };

  // 4. Finalizar atendimento atual
  const handleFinishCurrent = async () => {
    if (!activeAttendingTicket || !queueReady || !canAttend || queueOperation.current) return;
    queueOperation.current = true;
    queueVersion.current += 1;
    setQueueBusy(true);
    setQueueError('');
    setQueueActionError('');
    const token = getToken();
    try {
      const data = await finishCurrentTicketApi(operationalQueue.id, activeAttendingTicket.ticket);
      if (getToken() !== token || currentQueueContext.current !== operationalContext) return;
      applyQueueState(data, operationalContext);
      showToast('Atendimento finalizado.');
    } catch (err) {
      if (getToken() === token && currentQueueContext.current === operationalContext) setQueueActionError(err.message);
    } finally {
      queueOperation.current = false;
      setQueueBusy(false);
      queueRefresh.current?.();
    }
  };

  // 5. Emitir Senha Manual no Balcão
  const handleAddManualTicket = async ({ name, serviceName, isPriority }) => {
    if (!queueReady || !canIssue || queueOperation.current) throw new Error('Aguarde a atualização da fila.');
    queueOperation.current = true;
    queueVersion.current += 1;
    setQueueBusy(true);
    const token = getToken();
    try {
      const ticket = await addManualTicketApi({
        queue_id: operationalQueue.id,
        customer_name: name,
        service_name: serviceName,
        is_priority: isPriority
      });
      if (getToken() !== token || currentQueueContext.current !== operationalContext) throw new Error('Sessão encerrada. Entre novamente para consultar a fila.');

      setQueueState((previous) => ({
        context: operationalContext,
        data: {
          active_ticket: previous.context === operationalContext ? previous.data?.active_ticket || null : null,
          remaining_queue: [...(previous.context === operationalContext ? previous.data?.remaining_queue || [] : []), ticket]
            .sort((a, b) => Number(b.is_priority) - Number(a.is_priority))
        }
      }));
      showToast(`Senha ${ticket.ticket_number} emitida e adicionada à fila!`);
      return ticket;
    } finally {
      queueOperation.current = false;
      setQueueBusy(false);
      queueRefresh.current?.();
    }
  };

  return {
    operationalContext,
    operationalQueue,
    operationalQueues: operational.queues,
    selectQueue: (id) => {
      if (!queueOperation.current) operational.selectQueue(id);
    },
    queueBusy,
    queueReady,
    canIssue,
    canAttend,
    queueError: operational.error || (operational.loading ? 'Carregando filas permitidas...' : !operationalQueue ? 'Sua conta não possui filas disponíveis.' : queueError),
    queueActionError,
    dismissActionError: () => setQueueActionError(''),
    activeAttendingTicket,
    companyWaitingQueue,
    callNext: handleCallNextTicket,
    finishCurrent: handleFinishCurrent,
    addManualTicket: handleAddManualTicket,
  };
}
