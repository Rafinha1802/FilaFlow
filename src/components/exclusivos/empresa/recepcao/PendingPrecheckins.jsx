import React from 'react';

export default function PendingPrecheckins({
  tickets, priority, setPriority, error, loaded, busy, canConfirm, onRefresh, handleConfirm,
}) {
  return (
    <section style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2>Pré-check-ins da recepção</h2>
        {canConfirm && <button className="btn-ghost" disabled={busy !== null}
          onClick={onRefresh}>Atualizar</button>}
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
