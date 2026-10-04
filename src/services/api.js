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
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Erro ao chamar próximo');
    }
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao chamar próximo:', err);
    return null;
  }
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

export function setupQueueWebSocket(onMessage, companyId = 'clinica-vida') {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const token = getToken();
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : `?company_id=${encodeURIComponent(companyId)}`;
  const wsUrl = `${protocol}//${window.location.host}/ws${tokenQuery}`;

  let socket = null;
  let pingInterval = null;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('[FilaFlow WS] Conectado ao servidor WebSocket FastAPI em tempo real.');
      // Envia comando de inscrição de sala da empresa e fila
      try {
        socket.send(JSON.stringify({
          type: 'subscribe',
          companyId: companyId,
          queueId: 'clinica-vida',
          token: token
        }));
      } catch (e) {}

      // Ping a cada 25s para manter a conexão WebSocket ativa no backend
      pingInterval = setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') return;
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error('[FilaFlow WS] Erro ao processar mensagem recebida:', e);
      }
    };

    socket.onerror = (err) => {
      console.warn('[FilaFlow WS] Conexão WebSocket offline ou instável');
    };

    socket.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
      console.log('[FilaFlow WS] Conexão WebSocket encerrada.');
    };
  } catch (e) {
    console.warn('[FilaFlow WS] WebSocket não pôde ser iniciado:', e);
  }

  return socket;
}
