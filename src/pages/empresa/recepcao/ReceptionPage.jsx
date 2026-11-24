import React, { useEffect, useRef, useState } from 'react';
import PendingPrecheckins from '../../../components/exclusivos/empresa/recepcao/PendingPrecheckins';
import { confirmPrecheckin, fetchPendingPrecheckins } from '../../../services/precheckinApi.js';

export default function ReceptionPage({ queueId, canConfirm, onConfirmed }) {
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

  return <PendingPrecheckins tickets={tickets} priority={priority} setPriority={setPriority}
    error={error} loaded={loaded} busy={busy} canConfirm={canConfirm}
    onRefresh={() => { setError(''); setRefreshKey((key) => key + 1); }} handleConfirm={handleConfirm} />;
}
