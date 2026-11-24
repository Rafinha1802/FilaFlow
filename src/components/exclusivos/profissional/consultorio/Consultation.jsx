import React, { useEffect, useRef, useState } from 'react';
import { getToken, fetchQueueStateApi, callNextTicketApi, finishCurrentTicketApi, setupQueueWebSocket } from '../../../../services/api';

export default function Consultation({ queue, onBusyChange }) {
  const [state, setState] = useState(null);
  const [loadingError, setLoadingError] = useState('');
  const [actionError, setActionError] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const operation = useRef(false);
  const version = useRef(0);
  const refreshAfterOperation = useRef(null);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    let requested = false;
    const token = getToken();
    const refresh = async () => {
      requested = true;
      if (!active || refreshing || operation.current) return;
      refreshing = true;
      try {
        while (active && requested && !operation.current) {
          requested = false;
          const generation = version.current;
          const next = await fetchQueueStateApi(queue.id);
          if (!active || token !== getToken()) return;
          if (generation !== version.current) { requested = true; continue; }
          setState(next);
          setLoadingError('');
        }
      } catch (error) {
        if (active) {
          setState(null);
          setLoadingError(error.message);
        }
      } finally { refreshing = false; }
    };
    refreshAfterOperation.current = refresh;
    refresh();
    const socket = setupQueueWebSocket((event) => {
      if (['READY', 'QUEUE_UPDATED', 'TICKET_CALLED'].includes(event.type)) refresh();
    }, queue.id, (connected) => {
      if (active) setConnectionMessage(connected ? '' : 'Reconectando às atualizações da fila...');
    });
    return () => {
      active = false;
      version.current += 1;
      refreshAfterOperation.current = null;
      socket?.close();
    };
  }, [queue.id, refreshKey]);

  const mutate = async (action) => {
    if (operation.current || !state) return;
    operation.current = true;
    version.current += 1;
    const generation = version.current;
    const token = getToken();
    setBusy(true);
    onBusyChange(true);
    setActionError('');
    try {
      const next = await action();
      if (generation !== version.current || token !== getToken()) return;
      setState(next);
    } catch (error) {
      if (generation === version.current && token === getToken()) setActionError(error.message);
    } finally {
      operation.current = false;
      if (generation === version.current) {
        setBusy(false);
        onBusyChange(false);
        refreshAfterOperation.current?.();
      }
    }
  };

  return (
    <>
      <div className="professional-queue-heading">
        <div><h2>{queue.serviceName}</h2><p>{queue.companyName} · {queue.unitName} · {queue.room}</p></div>
        <button className="btn-ghost" disabled={busy} onClick={() => setRefreshKey((key) => key + 1)}>Atualizar</button>
      </div>
      {connectionMessage && <p role="status">{connectionMessage}</p>}
      {loadingError && <p role="alert" className="professional-queue-error">{loadingError}</p>}
      {actionError && <p role="alert" className="professional-queue-error">{actionError}</p>}
      {!state && !loadingError && <p role="status">Carregando fila...</p>}
      {state && (
        <>
          <section className="professional-queue-card" aria-live="polite">
            <h2>Atendimento atual</h2>
            {state.active_ticket ? (
              <>
                <strong className="professional-queue-number">{state.active_ticket.ticket_number}</strong>
                <p>{state.active_ticket.customer_name}</p>
                <p>{state.active_ticket.service_name}</p>
                <button className="btn-primary" disabled={busy}
                  onClick={() => mutate(() => finishCurrentTicketApi(queue.id, state.active_ticket.ticket_number))}>
                  {busy ? 'Aguarde...' : 'Concluir atendimento'}
                </button>
              </>
            ) : <p>Nenhum atendimento em andamento.</p>}
          </section>
          <section className="professional-queue-card">
            <div className="professional-queue-heading">
              <h2>Fila de espera ({state.remaining_queue.length})</h2>
              <button className="btn-primary" disabled={busy || state.remaining_queue.length === 0}
                onClick={() => mutate(() => callNextTicketApi(queue.id))}>
                {busy ? 'Aguarde...' : 'Chamar próxima senha'}
              </button>
            </div>
            {!state.remaining_queue.length && <p>Nenhum cliente aguardando.</p>}
            <ol className="professional-queue-list">
              {state.remaining_queue.map((ticket) => (
                <li key={ticket.ticket_number}>
                  <strong>{ticket.ticket_number}</strong>
                  <span>{ticket.customer_name} · {ticket.service_name}</span>
                  {ticket.is_priority && <span className="professional-queue-priority">Prioritário</span>}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </>
  );
}
