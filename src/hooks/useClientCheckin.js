import { useEffect, useRef, useState } from 'react';
import {
  CLIENT_AUTH_CLEARED, clearClientSession, getClientToken, loginClient,
  restoreClientSession, fetchClientQueues, fetchClientTickets, submitPrecheckin, setupTicketWebSocket,
} from '../services/precheckinApi.js';

export function useClientCheckin() {
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
  return { user, checking, email, setEmail, password, setPassword, error, setError,
    loadError, queues, tickets, queueId, setQueueId, busy, loaded, setRefreshKey,
    handleLogin, handleSubmit, hasOpenTicket };
}
