// FilaFlow API Service Client & Token Manager
const API_BASE = '/api';
const TOKEN_STORAGE_KEY = 'filaflow_token';
const USER_STORAGE_KEY = 'filaflow_user';

// Credenciais padrão da demonstração para login automático com o backend
export const DEFAULT_DEMO_CREDENTIALS = {
  email: 'atendimento@clinicavida.com.br',
  password: '123456'
};

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
  setToken(null);
  setStoredUser(null);
}

/**
 * Realiza login direto no backend FastAPI.
 */
export async function loginApi(email = DEFAULT_DEMO_CREDENTIALS.email, password = DEFAULT_DEMO_CREDENTIALS.password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Falha na autenticação');
    }

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      if (data.user) setStoredUser(data.user);
      console.log('[FilaFlow API] Autenticado com sucesso no backend FastAPI!');
    }
    return data;
  } catch (err) {
    console.warn('[FilaFlow API] Backend offline ou credenciais não sincronizadas:', err.message);
    return null;
  }
}

/**
 * Garante que o frontend possua um token válido ativo.
 * Caso não haja token armazenado, tenta autenticar automaticamente com as credenciais padrão da clínica.
 */
export async function ensureAuthToken(forceRefresh = false) {
  let token = getToken();
  if (!token || forceRefresh) {
    const loginRes = await loginApi();
    token = loginRes?.access_token || null;
  }
  return token;
}

/**
 * Wrapper de fetch com injeção automática de Authorization Bearer JWT
 */
async function fetchWithAuth(url, options = {}) {
  let token = await ensureAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    let res = await fetch(url, { ...options, headers });

    // Se retornar 401 (token expirado ou inválido), tenta renovar o login 1 vez
    if (res.status === 401) {
      console.log('[FilaFlow API] Token expirado (401). Renovando autenticação com o backend...');
      token = await ensureAuthToken(true);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        res = await fetch(url, { ...options, headers });
      }
    }

    return res;
  } catch (err) {
    throw err;
  }
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
    if (!res.ok) throw new Error('Erro ao emitir senha');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao emitir senha:', err);
    return null;
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
