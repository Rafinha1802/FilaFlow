import { setupSubscription } from './liveConnection.js';
import { fetchWithAuth } from './api.js';

const TOKEN_KEY = 'temfyla_client_token';
export const CLIENT_AUTH_CLEARED = 'temfyla:client-auth-cleared';
let revision = 0;

export function getClientToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearClientSession() {
  revision += 1;
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* A sessão visual também precisa encerrar. */ }
  window.dispatchEvent(new Event(CLIENT_AUTH_CLEARED));
}

export async function loginClient(email, password, signal) {
  const version = revision;
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), signal,
  });
  if (!response.ok) throw new Error('Não foi possível entrar. Confira os dados e a disponibilidade do serviço.');
  const data = await response.json();
  if (data.user?.role !== 'client' || typeof data.access_token !== 'string' || !data.access_token) {
    throw new Error('Use uma conta de cliente habilitada.');
  }
  if (signal?.aborted || version !== revision) throw new DOMException('Login cancelado.', 'AbortError');
  try {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (getClientToken() !== data.access_token) throw new Error();
  } catch {
    clearClientSession();
    throw new Error('Permita o armazenamento no navegador para entrar.');
  }
  return data.user;
}

async function clientFetch(path, options = {}) {
  const token = getClientToken();
  if (!token) throw new Error('Entre na conta de cliente.');
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${token}` },
  });
  if (getClientToken() !== token) throw new DOMException('Sessão alterada.', 'AbortError');
  if (response.status === 401) {
    clearClientSession();
    throw new Error('Sua sessão expirou. Entre novamente.');
  }
  return response;
}

export async function restoreClientSession() {
  if (!getClientToken()) return null;
  const response = await clientFetch('/api/auth/me');
  if (!response.ok) throw new Error('Não foi possível validar sua sessão.');
  const user = await response.json();
  if (user.role !== 'client') {
    clearClientSession();
    throw new Error('Use uma conta de cliente habilitada.');
  }
  return user;
}

function validateTicket(ticket) {
  return Number.isSafeInteger(ticket?.id) && ticket.id > 0 &&
    typeof ticket.queue_id === 'string' && typeof ticket.ticket_number === 'string' &&
    ['pending', 'waiting', 'active', 'finished'].includes(ticket.status);
}

async function readTickets(response) {
  if (!response.ok) throw new Error('Não foi possível atualizar os pré-check-ins.');
  const tickets = await response.json();
  if (!Array.isArray(tickets) || !tickets.every(validateTicket)) {
    throw new Error('Resposta de pré-check-in inválida.');
  }
  return tickets;
}

export async function fetchClientTickets() {
  return readTickets(await clientFetch('/api/pre-checkins/me'));
}

export async function fetchClientQueues() {
  const response = await fetch('/api/queues');
  if (!response.ok) throw new Error('Não foi possível carregar os estabelecimentos.');
  const queues = await response.json();
  if (!Array.isArray(queues) || !queues.every((queue) =>
    ['id', 'companyName', 'unitName', 'serviceName'].every((field) => typeof queue?.[field] === 'string')
  )) {
    throw new Error('Catálogo inválido.');
  }
  return queues;
}

export async function submitPrecheckin(queueId, accountId) {
  const key = `temfyla_precheckin:${accountId}:${queueId}`;
  let requestId;
  try {
    requestId = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, requestId);
  } catch {
    throw new Error('Permita o armazenamento para enviar e repetir o pedido com segurança.');
  }
  let response;
  try {
    response = await clientFetch('/api/pre-checkins', {
      method: 'POST', body: JSON.stringify({ queue_id: queueId, request_id: requestId }),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Não foi possível confirmar o envio. Tente novamente para consultar o mesmo pedido.');
  }
  if (response.status === 409) throw new Error('Já existe um pedido aberto nesta fila. Atualize suas senhas.');
  if (!response.ok) throw new Error('O envio não foi confirmado. Tente novamente.');
  const ticket = await response.json();
  if (!validateTicket(ticket) || ticket.queue_id !== queueId) throw new Error('Resposta do pedido inválida. Tente novamente.');
  localStorage.removeItem(key);
  return ticket;
}

export async function fetchPendingPrecheckins(queueId) {
  return readTickets(await fetchWithAuth(`/api/pre-checkins?queue_id=${encodeURIComponent(queueId)}`));
}

export async function confirmPrecheckin(ticketId, isPriority) {
  const response = await fetchWithAuth(`/api/pre-checkins/${ticketId}/confirm`, {
    method: 'POST', body: JSON.stringify({ is_priority: isPriority }),
  });
  if (!response.ok) throw new Error('A confirmação falhou. Atualize a lista e confira sua permissão.');
  const ticket = await response.json();
  if (!validateTicket(ticket) || ticket.id !== ticketId) throw new Error('Resposta de confirmação inválida.');
  return ticket;
}

export function setupTicketWebSocket(ticketId, onMessage) {
  return setupSubscription({
    onMessage, getToken: getClientToken, clearAuth: clearClientSession,
    path: '/ws/tickets', field: 'ticket_id', id: ticketId,
  });
}
