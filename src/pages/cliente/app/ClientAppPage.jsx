import React from 'react';
import BrandLogo from '../../../components/compartilhados/BrandLogo';
import ClientTicketList from '../../../components/exclusivos/cliente/app/ClientTicketList';
import { useClientCheckin } from '../../../hooks/useClientCheckin';
import { clearClientSession } from '../../../services/precheckinApi.js';
import '../../../components/exclusivos/cliente/app/client-checkin.css';

export default function ClientAppPage({ onGoToLanding }) {
  const { user, checking, email, setEmail, password, setPassword, error, setError,
    loadError, queues, tickets, queueId, setQueueId, busy, loaded, setRefreshKey,
    handleLogin, handleSubmit, hasOpenTicket } = useClientCheckin();
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
                <ClientTicketList tickets={tickets} queues={queues} />
              </div>
            </section>
          </>
        )}
        {(error || loadError) && <p role="alert" className="client-checkin-error">{error || loadError}</p>}
      </div>
    </main>
  );
}
