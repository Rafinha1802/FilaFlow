import React, { useEffect, useRef, useState } from 'react';
import { confirmPrecheckin, fetchPendingPrecheckins } from '../../services/precheckinApi.js';

export default function PrecheckinReception({ queueId, canConfirm, onConfirmed }) {
  const [tickets, setTickets] = useState([]);
  const [priority, setPriority] = useState({});
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const version = useRef(0);
  const operation = useRef(false);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    if (!canConfirm || !queueId) return;
    const refresh = async () => {
      if (refreshing || operation.current) return;
      refreshing = true;
      const generation = version.current;
      try {
        const pending = await fetchPendingPrecheckins(queueId);
        if (active && generation === version.current) {
          setTickets(pending);
          setLoaded(true);
        }
      } catch (err) {
        if (active && generation === version.current) setError(err.message);
      } finally { refreshing = false; }
    };
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { active = false; version.current += 1; clearInterval(timer); };
  }, [queueId, canConfirm, refreshKey]);

  const handleConfirm = async (ticket) => {
    if (operation.current) return;
    operation.current = true;
    version.current += 1;
    const generation = version.current;
    setBusy(ticket.id);
    setError('');
    try {
      const confirmed = await confirmPrecheckin(ticket.id, Boolean(priority[ticket.id]));
      if (generation !== version.current) return;
      setTickets((current) => current.filter((item) => item.id !== ticket.id));
      onConfirmed?.(confirmed);
    } catch (err) {
      if (generation === version.current) setError(err.message);
    } finally {
      operation.current = false;
      if (generation === version.current) setBusy(null);
    }
  };

  return (
    <section style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2>Pré-check-ins da recepção</h2>
        {canConfirm && <button className="btn-ghost" disabled={busy !== null}
          onClick={() => { setError(''); setRefreshKey((key) => key + 1); }}>Atualizar</button>}
      </div>
      {!canConfirm ? <p>Seu papel nesta unidade permite acompanhar o atendimento pela fila operacional.</p> : (
        <>
          {!loaded && <p role="status">Carregando pedidos...</p>}
          {loaded && !tickets.length && <p>Nenhum pré-check-in aguardando confirmação nesta fila.</p>}
          {tickets.map((ticket) => (
            <article key={ticket.id} style={{
              background: 'white', border: '1px solid #e9e5f3', borderRadius: 16, padding: 20, marginTop: 16,
              display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <div style={{ flex: '1 1 240px' }}>
                <h3>{ticket.ticket_number} · {ticket.customer_name}</h3>
                <p>{ticket.service_name}</p>
                <p>Solicitado em {new Date(ticket.issued_at).toLocaleString('pt-BR')}</p>
              </div>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={Boolean(priority[ticket.id])} disabled={busy !== null}
                  onChange={(event) => setPriority((current) => ({ ...current, [ticket.id]: event.target.checked }))} />
                Atendimento prioritário
              </label>
              <button className="btn-primary" disabled={busy !== null} onClick={() => handleConfirm(ticket)}>
                {busy === ticket.id ? 'Confirmando...' : 'Confirmar entrada na fila'}
              </button>
            </article>
          ))}
        </>
      )}
      {error && <p role="alert" style={{ color: '#9f1239', padding: 16 }}>{error}</p>}
    </section>
  );
}
