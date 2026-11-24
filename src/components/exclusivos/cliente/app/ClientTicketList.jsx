import React from 'react';

const statusLabels = {
  pending: 'Aguardando recepção', waiting: 'Na fila de espera',
  active: 'Sua senha foi chamada', finished: 'Atendimento concluído',
};

export default function ClientTicketList({ tickets, queues }) {
  const localTime = (value) => value ? new Date(value).toLocaleString('pt-BR') : '';
  return <>
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
  </>;
}
