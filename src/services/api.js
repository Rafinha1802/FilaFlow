// FilaFlow API Service Client & Token Manager
const API_BASE = '/api';
const TOKEN_STORAGE_KEY = 'filaflow_token';
const USER_STORAGE_KEY = 'filaflow_user';

export const AUTH_CLEARED_EVENT = 'filaflow:auth-cleared';
let authRevision = 0;

// Gerenciamento de Token JWT no LocalStorage
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[FilaFlow API] Erro ao salvar token:', e);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('[FilaFlow API] Erro ao salvar dados do usuário:', e);
  }
}

export function clearAuth() {
  authRevision += 1;
  setToken(null);
  setStoredUser(null);
  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
}

/**
 * Realiza login direto no backend FastAPI.
 */
export async function loginApi(email, password, { signal } = {}) {
  const revision = authRevision;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error('E-mail ou senha incorretos.');
      if (res.status === 503) throw new Error('Login indisponível no momento. Tente novamente mais tarde.');
      if (res.status === 422) throw new Error('Confira o e-mail e a senha informados.');
      throw new Error('Não foi possível entrar. Tente novamente.');
    }

    const data = await res.json();
    if (typeof data.access_token !== 'string' || !data.access_token || data.user?.role !== 'company') {
      throw new Error('Resposta de autenticação inválida. Tente novamente.');
    }
    // Uma resposta atrasada não pode restaurar uma sessão encerrada.
    if (signal?.aborted || revision !== authRevision) throw new DOMException('Login cancelado.', 'AbortError');
    setToken(data.access_token);
    setStoredUser(data.user);
    if (getToken() !== data.access_token) throw new Error('Permita o armazenamento no navegador para entrar.');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    if (revision === authRevision) clearAuth();
    if (err instanceof TypeError) throw new Error('Não foi possível conectar ao servidor. Tente novamente.');
    throw err;
  }
}

/**
 * Wrapper de fetch com injeção automática de Authorization Bearer JWT
 */
async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  if (!token) throw new Error('Entre na sua conta para continuar.');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    if (getToken() === token) clearAuth();
    throw new Error('Sua sessão expirou. Entre novamente.');
  }
  return res;
}

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;
  const res = await fetchWithAuth(`${API_BASE}/auth/me`);
  if (!res.ok) throw new Error('Não foi possível validar sua sessão. Tente entrar novamente.');
  const user = await res.json();
  if (getToken() !== token) return null;
  if (user?.role !== 'company') {
    clearAuth();
    throw new Error('Sessão empresarial inválida. Entre novamente.');
  }
  setStoredUser(user);
  return user;
}

// -------------------------------------------------------------
// Filas e Senhas
// -------------------------------------------------------------

export async function fetchQueues() {
  try {
    const res = await fetch(`${API_BASE}/queues`);
    if (!res.ok) throw new Error('Falha ao buscar filas públicas');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Backend offline ou erro em /queues, usando dados locais:', err);
    return null;
  }
}

export async function fetchMyQueues() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/queues/me`);
    if (!res.ok) throw new Error('Falha ao buscar filas da empresa');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao buscar /queues/me:', err);
    return null;
  }
}

export async function callNextTicketApi(queueId = 'clinica-vida') {
  try {
    const res = await fetchWithAuth(`${API_BASE}/tickets/next?queue_id=${encodeURIComponent(queueId)}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Não foi possível chamar a próxima senha.');
    const data = await readQueueState(res);
    if (data.called_ticket !== null && !isQueueTicket(data.called_ticket)) {
      throw new Error('Resposta de chamada inválida. Recarregue a fila.');
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError || err instanceof SyntaxError) {
      throw new Error('Não foi possível confirmar a chamada. Recarregue a fila antes de tentar novamente.');
    }
    throw err;
  }
}

function isQueueTicket(ticket) {
  return ticket && typeof ticket.ticket_number === 'string' && ticket.ticket_number.length > 0 &&
    typeof ticket.customer_name === 'string' && typeof ticket.service_name === 'string' &&
    typeof ticket.is_priority === 'boolean';
}

async function readQueueState(res) {
  const data = await res.json();
  if (!data || (data.active_ticket !== null && !isQueueTicket(data.active_ticket)) ||
      !Array.isArray(data.remaining_queue) || !data.remaining_queue.every(isQueueTicket)) {
    throw new Error('Resposta da fila inválida. Recarregue a página.');
  }
  return data;
}

export async function fetchQueueStateApi(queueId = 'clinica-vida') {
  const res = await fetchWithAuth(`${API_BASE}/tickets?queue_id=${encodeURIComponent(queueId)}`);
  if (!res.ok) throw new Error('Não foi possível carregar a fila. Recarregue a página.');
  return readQueueState(res);
}

export async function reportDelayApi(queueId = 'clinica-vida', minutes = 5) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/tickets/delay`, {
      method: 'POST',
      body: JSON.stringify({ queue_id: queueId, additional_minutes: minutes })
    });
    if (!res.ok) throw new Error('Erro ao simular atraso');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao simular atraso:', err);
    return null;
  }
}

export async function addManualTicketApi(ticketData) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/tickets/manual`, {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
    if (!res.ok) {
      if (res.status === 422) throw new Error('Confira o nome, o serviço e a prioridade informados.');
      if (res.status === 404) throw new Error('Fila não encontrada. Não foi possível emitir a senha.');
      throw new Error('Não foi possível emitir a senha. Tente novamente mais tarde.');
    }
    const ticket = await res.json();
    if (typeof ticket.ticket_number !== 'string' || !ticket.ticket_number ||
        typeof ticket.customer_name !== 'string' || typeof ticket.service_name !== 'string' ||
        typeof ticket.is_priority !== 'boolean' || ticket.queue_id !== ticketData.queue_id) {
      throw new Error('Não foi possível confirmar os dados da senha emitida.');
    }
    return ticket;
  } catch (err) {
    if (err instanceof TypeError || err instanceof SyntaxError) {
      throw new Error('Não foi possível confirmar a emissão. Verifique a conexão antes de tentar novamente.');
    }
    throw err;
  }
}

// -------------------------------------------------------------
// Recepção / Secretária & Autorização de Convênio
// -------------------------------------------------------------

export async function getReceptionWaitingList() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list`);
    if (!res.ok) throw new Error('Erro ao buscar lista da recepção');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao buscar lista da recepção:', err);
    return null;
  }
}

export async function addReceptionPatientApi(patientData) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list`, {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
    if (!res.ok) throw new Error('Erro ao cadastrar na recepção');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao cadastrar paciente na recepção:', err);
    return null;
  }
}

export async function updateReceptionStatusApi(patientId, status) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Erro ao atualizar status');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao atualizar status:', err);
    return null;
  }
}

export async function authorizeReceptionPatientApi(patientId, authData = {}) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}/authorize`, {
      method: 'POST',
      body: JSON.stringify(authData)
    });
    if (!res.ok) throw new Error('Erro ao autorizar convênio');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao autorizar convênio:', err);
    return null;
  }
}

export async function removeReceptionPatientApi(patientId) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Erro ao remover paciente');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao remover paciente:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Checkout / Pagamentos
// -------------------------------------------------------------

export async function createOrderApi(orderData) {
  try {
    const res = await fetch(`${API_BASE}/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Erro ao criar pedido');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro no pedido de checkout:', err);
    return null;
  }
}

// -------------------------------------------------------------
// Conexão WebSocket para Notificações e Eventos Live
// -------------------------------------------------------------

export function setupQueueWebSocket(onMessage, queueId = 'clinica-vida', onConnectionChange = () => {}) {
  const token = getToken();
  if (!token) return null;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  let socket = null;
  let stopped = false;
  let reconnectTimer = null;
  let pingInterval = null;
  let watchdog = null;

  const clearTimers = () => {
    clearTimeout(reconnectTimer);
    clearInterval(pingInterval);
    clearTimeout(watchdog);
  };
  const connect = () => {
    if (stopped || getToken() !== token) return;
    try {
      socket = new WebSocket(wsUrl);
    } catch {
      onConnectionChange(false);
      reconnectTimer = setTimeout(connect, 2000);
      return;
    }
    const currentSocket = socket;
    currentSocket.onopen = () => {
      if (stopped || getToken() !== token) { currentSocket.close(); return; }
      currentSocket.send(JSON.stringify({ type: 'subscribe', queue_id: queueId, token }));
      watchdog = setTimeout(() => currentSocket.close(), 10000);
    };
    currentSocket.onmessage = (event) => {
      if (stopped || getToken() !== token) return;
      let data;
      try { data = JSON.parse(event.data); } catch { currentSocket.close(); return; }
      if (data?.type === 'pong') { clearTimeout(watchdog); return; }
      if (data?.queue_id !== queueId) return;
      if (data.type === 'READY') {
        clearTimeout(watchdog);
        clearInterval(pingInterval);
        onConnectionChange(true);
        pingInterval = setInterval(() => {
          if (currentSocket.readyState === WebSocket.OPEN) {
            currentSocket.send(JSON.stringify({ type: 'ping' }));
            watchdog = setTimeout(() => currentSocket.close(), 10000);
          }
        }, 20000);
      }
      onMessage?.(data);
    };
    currentSocket.onerror = () => currentSocket.close();
    currentSocket.onclose = (event) => {
      clearTimers();
      if (stopped || getToken() !== token) return;
      if (event.code === 1008) { stopped = true; clearAuth(); return; }
      onConnectionChange(false);
      // A nova mensagem READY faz o painel consultar eventos perdidos na queda.
      reconnectTimer = setTimeout(connect, 2000);
    };
  };
  connect();
  return {
    close() {
      stopped = true;
      clearTimers();
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
    }
  };
}
