import React, { useEffect, useState } from 'react';
import BrandLogo from '../../../components/compartilhados/BrandLogo';
import ProfessionalLoginPage from '../login/ProfessionalLoginPage';
import Consultation from '../../../components/exclusivos/profissional/consultorio/Consultation';
import { useOperationalQueues } from '../../../hooks/useOperationalQueues';
import {
  AUTH_CLEARED_EVENT, clearAuth, getToken, fetchCurrentUser,
} from '../../../services/api';
import '../../../components/exclusivos/profissional/consultorio/professional-queue.css';

const attendanceRoles = ['admin', 'professional'];

export default function ProfessionalWorkspacePage({ onGoToSite, onGoToClient }) {
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
  if (!user) return <ProfessionalLoginPage initialError={error}
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
