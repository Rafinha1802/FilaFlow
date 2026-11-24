import React, { useEffect, useRef, useState } from 'react';
import BrandLogo from '../Common/BrandLogo';
import {
  CLIENT_AUTH_CLEARED, clearClientSession, getClientToken, loginClient,
  restoreClientSession, fetchClientQueues, fetchClientTickets, submitPrecheckin, setupTicketWebSocket,
} from '../../services/precheckinApi.js';
import './client-checkin.css';

const statusLabels = {
  pending: 'Aguardando recepção', waiting: 'Na fila de espera',
  active: 'Sua senha foi chamada', finished: 'Atendimento concluído',
};

export default function ClientCheckinPage({ onGoToLanding }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [queues, setQueues] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [queueId, setQueueId] = useState('');
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const request = useRef(null);
  const operation = useRef(false);
  const version = useRef(0);

  useEffect(() => {
    let active = true;
    const reset = () => {
      version.current += 1;
      request.current?.abort();
      request.current = null;
      operation.current = false;
      setBusy(false);
      setUser(null);
      setTickets([]);
      setQueues([]);
      setQueueId('');
      setLoaded(false);
      setLoadError('');
    };
    const onStorage = (event) => {
      if (event.key === 'temfyla_client_token' || event.key === null) {
        reset();
        restoreClientSession().then((next) => { if (active) setUser(next); })
          .catch((err) => { if (active) setError(err.message); });
      }
    };
    window.addEventListener(CLIENT_AUTH_CLEARED, reset);
    window.addEventListener('storage', onStorage);
    restoreClientSession().then((next) => { if (active) setUser(next); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setChecking(false); });
    return () => {
      active = false;
      version.current += 1;
      request.current?.abort();
      window.removeEventListener(CLIENT_AUTH_CLEARED, reset);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let refreshing = false;
    const token = getClientToken();
    setLoaded(false);
    const refresh = async () => {
      if (refreshing || operation.current) return;
      refreshing = true;
      const generation = version.current;
      try {
        const [catalog, mine] = await Promise.all([fetchClientQueues(), fetchClientTickets()]);
        if (!active || token !== getClientToken() || generation !== version.current) return;
        setQueues(catalog);
        setTickets(mine);
        setQueueId((current) => catalog.some((queue) => queue.id === current) ? current : catalog[0]?.id || '');
        setLoaded(true);
        setLoadError('');
      } catch (err) {
        if (active && generation === version.current && token === getClientToken() && err.name !== 'AbortError') {
          setLoadError(err.message);
        }
      } finally { refreshing = false; }
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [user?.id, refreshKey]);

  const liveTicketIds = user ? tickets.filter((ticket) => ticket.status !== 'finished').map((ticket) => ticket.id).join(',') : '';
  useEffect(() => {
    if (!liveTicketIds) return;
    const sockets = liveTicketIds.split(',').map((id) => setupTicketWebSocket(Number(id), (event) => {
      if (event.type === 'READY' || event.type === 'TICKET_UPDATED') setRefreshKey((key) => key + 1);
    }));
    return () => sockets.forEach((socket) => socket?.close());
  }, [user?.id, liveTicketIds]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    try {
      const next = await loginClient(email.trim(), password, controller.signal);
      if (!controller.signal.aborted) { setUser(next); setPassword(''); }
    } catch (err) {
      if (!controller.signal.aborted) setError(err.message);
    } finally {
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (operation.current || !queueId || !user || !loaded) return;
    operation.current = true;
    version.current += 1;
    const token = getClientToken();
    const generation = version.current;
    setBusy(true);
    setError('');
    try {
      const ticket = await submitPrecheckin(queueId, user.id);
      if (token !== getClientToken() || generation !== version.current) return;
      setTickets((current) => [ticket, ...current.filter((item) => item.id !== ticket.id)]);
    } catch (err) {
      if (token === getClientToken() && generation === version.current) setError(err.message);
    } finally {
      if (generation === version.current) {
        operation.current = false;
        setBusy(false);
      }
    }
  };

  const hasOpenTicket = tickets.some((ticket) => ticket.queue_id === queueId && ticket.status !== 'finished');
  const localTime = (value) => value ? new Date(value).toLocaleString('pt-BR') : '';
  return (
    <main className="client-checkin-page">
      <div className="client-checkin-container">
        <header className="client-checkin-header">
          <BrandLogo />
          <button className="btn-ghost" onClick={onGoToLanding}>Voltar ao site</button>
        </header>
        {checking ? <p role="status">Verificando sessão...</p> : !user ? (
          <section className="client-checkin-card">
            <h1>Entre para acompanhar suas senhas</h1>
            <form onSubmit={handleLogin}>
              <label htmlFor="client-email">E-mail</label>
              <input id="client-email" type="email" required autoComplete="username" value={email}
                onChange={(event) => setEmail(event.target.value)} disabled={busy} />
              <label htmlFor="client-password">Senha</label>
              <input id="client-password" type="password" required autoComplete="current-password"
                value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} />
              <button className="btn-primary" disabled={busy}>{busy ? 'Entrando...' : 'Entrar'}</button>
            </form>
          </section>
        ) : (
          <>
            <div className="client-checkin-header">
              <p>{user.email}</p>
              <button className="btn-ghost" onClick={() => { clearClientSession(); setError(''); }}>Sair</button>
            </div>
            <section className="client-checkin-card">
              <h1>Fazer pré-check-in</h1>
              <form onSubmit={handleSubmit}>
                <label htmlFor="client-queue">Estabelecimento e atendimento</label>
                <select id="client-queue" value={queueId} disabled={busy || !loaded}
                  onChange={(event) => setQueueId(event.target.value)}>
                  {!queues.length && <option value="">Carregando estabelecimentos...</option>}
                  {queues.map((queue) => (
                    <option key={queue.id} value={queue.id}>
                      {queue.companyName} · {queue.unitName} · {queue.serviceName}
                    </option>
                  ))}
                </select>
                <button className="btn-primary" disabled={busy || !loaded || !queueId || hasOpenTicket}>
                  {busy ? 'Enviando...' : hasOpenTicket ? 'Você já tem uma senha nesta fila' : 'Enviar pré-check-in'}
                </button>
              </form>
            </section>
            <section className="client-checkin-card">
              <div className="client-checkin-header">
                <h2>Minhas senhas</h2>
                <button className="btn-ghost" disabled={busy} onClick={() => setRefreshKey((key) => key + 1)}>Atualizar</button>
              </div>
              {!loaded && <p role="status">Carregando suas senhas...</p>}
              {loaded && !tickets.length && <p>Você ainda não tem senhas.</p>}
              <div aria-live="polite">
                {tickets.map((ticket) => {
                  const queue = queues.find((item) => item.id === ticket.queue_id);
                  return (
                    <article key={ticket.id} className="client-checkin-ticket">
                      <strong>{ticket.ticket_number} · {statusLabels[ticket.status]}</strong>
                      <p>{queue ? `${queue.companyName} · ${queue.unitName}` : ticket.queue_id}</p>
                      <p>{ticket.service_name}</p>
                      {ticket.confirmed_at && <p>Confirmada em {localTime(ticket.confirmed_at)}</p>}
                      {ticket.called_at && <p>Chamada em {localTime(ticket.called_at)}</p>}
                      {ticket.finished_at && <p>Concluída em {localTime(ticket.finished_at)}</p>}
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
        {(error || loadError) && <p role="alert" className="client-checkin-error">{error || loadError}</p>}
      </div>
    </main>
  );
}
