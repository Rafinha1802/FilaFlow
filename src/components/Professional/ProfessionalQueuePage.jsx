import React, { useEffect, useRef, useState } from 'react';
import BrandLogo from '../Common/BrandLogo';
import OperationalLogin from '../compartilhados/OperationalLogin';
import { useOperationalQueues } from '../../hooks/useOperationalQueues';
import {
  AUTH_CLEARED_EVENT, clearAuth, getToken, fetchCurrentUser,
  fetchQueueStateApi, callNextTicketApi, finishCurrentTicketApi, setupQueueWebSocket,
} from '../../services/api';
import './professional-queue.css';

const attendanceRoles = ['admin', 'professional'];

function Consultation({ queue, onBusyChange }) {
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

export default function ProfessionalQueuePage({ onGoToSite, onGoToClient }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const token = user ? getToken() : null;
  const operational = useOperationalQueues(token, attendanceRoles);

  useEffect(() => {
    let active = true;
    const reset = () => { setUser(null); setBusy(false); };
    const restore = async () => {
      setChecking(true);
      try {
        const next = await fetchCurrentUser();
        if (active) setUser(next);
      } catch (err) {
        if (active) setError(err.message);
      } finally { if (active) setChecking(false); }
    };
    const onStorage = (event) => {
      if (event.key === 'filaflow_token' || event.key === null) { reset(); restore(); }
    };
    window.addEventListener(AUTH_CLEARED_EVENT, reset);
    window.addEventListener('storage', onStorage);
    restore();
    return () => {
      active = false;
      window.removeEventListener(AUTH_CLEARED_EVENT, reset);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (checking) return <p role="status">Verificando sessão...</p>;
  if (!user) return <OperationalLogin professionalMode initialError={error}
    onCancel={onGoToSite} onLoginSuccess={(next) => { setError(''); setUser(next); }} />;
  return (
    <main className="professional-queue-page">
      <div className="professional-queue-container">
        <header className="professional-queue-heading">
          <BrandLogo subtitle="Consultório" />
          <nav className="professional-queue-heading">
            <button className="btn-ghost" onClick={onGoToSite}>Site</button>
            <button className="btn-ghost" onClick={onGoToClient}>Área do cliente</button>
            <button className="btn-ghost" onClick={() => clearAuth()}>Sair</button>
          </nav>
        </header>
        <p>{user.email}</p>
        <div className="professional-queue-heading">
          <h1>Consultório</h1>
          <label>Unidade e fila
            <select value={operational.selected?.id || ''} disabled={busy || operational.loading}
              onChange={(event) => { if (!busy) operational.selectQueue(event.target.value); }}>
              {!operational.queues.length && <option value="">Nenhuma fila disponível</option>}
              {operational.queues.map((queue) => (
                <option key={queue.id} value={queue.id}>
                  {queue.companyName} · {queue.unitName} · {queue.serviceName}
                </option>
              ))}
            </select>
          </label>
        </div>
        {operational.loading && <p role="status">Carregando filas permitidas...</p>}
        {operational.error && <p role="alert" className="professional-queue-error">{operational.error}</p>}
        {!operational.loading && !operational.error && !operational.selected &&
          <p>Sua conta precisa de permissão de atendimento em uma fila para acessar o consultório.</p>}
        {operational.selected && <Consultation key={token + ':' + operational.selected.id}
          queue={operational.selected} onBusyChange={setBusy} />}
      </div>
    </main>
  );
}
