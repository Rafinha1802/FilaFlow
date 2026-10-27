// TemFyla API Service Client & Token Manager
const API_BASE = '/api';
const TOKEN_STORAGE_KEY = 'TemFyla_token';
const USER_STORAGE_KEY = 'TemFyla_user';

// Credenciais padrÃ£o da demonstraÃ§Ã£o para login automÃ¡tico com o backend
export const DEFAULT_DEMO_CREDENTIALS = {
  email: 'atendimento@clinicavida.com.br',
  password: '123456'
};

// Gerenciamento de Token JWT no LocalStorage
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem('filaflow_token');
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
      localStorage.removeItem('filaflow_token');
    }
  } catch (e) {
    console.warn('[TemFyla API] Erro ao salvar token:', e);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY) || localStorage.getItem('filaflow_user');
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
    console.warn('[TemFyla API] Erro ao salvar dados do usuÃ¡rio:', e);
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
      throw new Error(errData.detail || 'Falha na autenticaÃ§Ã£o');
    }

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      if (data.user) setStoredUser(data.user);
      console.log('[TemFyla API] Autenticado com sucesso no backend FastAPI!');
    }
    return data;
  } catch (err) {
    console.warn('[TemFyla API] Backend offline ou credenciais nÃ£o sincronizadas:', err.message);
    return null;
  }
}

/**
 * Garante que o frontend possua um token vÃ¡lido ativo.
 * Caso nÃ£o haja token armazenado, tenta autenticar automaticamente com as credenciais padrÃ£o da clÃ­nica.
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
 * Wrapper de fetch com injeÃ§Ã£o automÃ¡tica de Authorization Bearer JWT
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

    // Se retornar 401 (token expirado ou invÃ¡lido), tenta renovar o login 1 vez
    if (res.status === 401) {
      console.log('[TemFyla API] Token expirado (401). Renovando autenticaÃ§Ã£o com o backend...');
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
    if (!res.ok) throw new Error('Falha ao buscar filas pÃºblicas');
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Backend offline ou erro em /queues, usando dados locais:', err);
    return null;
  }
}

export async function fetchMyQueues() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/queues/me`);
    if (!res.ok) throw new Error('Falha ao buscar filas da empresa');
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Erro ao buscar /queues/me:', err);
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
      throw new Error(errData.detail || 'Erro ao chamar prÃ³ximo');
    }
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Erro ao chamar prÃ³ximo:', err);
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
    console.warn('[TemFyla API] Erro ao simular atraso:', err);
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
    console.warn('[TemFyla API] Erro ao emitir senha:', err);
    return null;
  }
}

// -------------------------------------------------------------
// RecepÃ§Ã£o / SecretÃ¡ria & AutorizaÃ§Ã£o de ConvÃªnio
// -------------------------------------------------------------

export async function getReceptionWaitingList() {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list`);
    if (!res.ok) throw new Error('Erro ao buscar lista da recepÃ§Ã£o');
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Erro ao buscar lista da recepÃ§Ã£o:', err);
    return null;
  }
}

export async function addReceptionPatientApi(patientData) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list`, {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
    if (!res.ok) throw new Error('Erro ao cadastrar na recepÃ§Ã£o');
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Erro ao cadastrar paciente na recepÃ§Ã£o:', err);
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
    console.warn('[TemFyla API] Erro ao atualizar status:', err);
    return null;
  }
}

export async function authorizeReceptionPatientApi(patientId, authData = {}) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}/authorize`, {
      method: 'POST',
      body: JSON.stringify(authData)
    });
    if (!res.ok) throw new Error('Erro ao autorizar convÃªnio');
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Erro ao autorizar convÃªnio:', err);
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
    console.warn('[TemFyla API] Erro ao remover paciente:', err);
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
    console.warn('[TemFyla API] Erro no pedido de checkout:', err);
    return null;
  }
}

// -------------------------------------------------------------
// ConexÃ£o WebSocket para NotificaÃ§Ãµes e Eventos Live
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
      console.log('[TemFyla WS] Conectado ao servidor WebSocket FastAPI em tempo real.');
      // Envia comando de inscriÃ§Ã£o de sala da empresa e fila
      try {
        socket.send(JSON.stringify({
          type: 'subscribe',
          companyId: companyId,
          queueId: 'clinica-vida',
          token: token
        }));
      } catch (e) {}

      // Ping a cada 25s para manter a conexÃ£o WebSocket ativa no backend
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
        console.error('[TemFyla WS] Erro ao processar mensagem recebida:', e);
      }
    };

    socket.onerror = (err) => {
      console.warn('[TemFyla WS] ConexÃ£o WebSocket offline ou instÃ¡vel');
    };

    socket.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
      console.log('[TemFyla WS] ConexÃ£o WebSocket encerrada.');
    };
  } catch (e) {
    console.warn('[TemFyla WS] WebSocket nÃ£o pÃ´de ser iniciado:', e);
  }

  return socket;
}


// -------------------------------------------------------------
// AutenticaÃ§Ã£o e Perfil de Paciente / Cliente Mobile
// -------------------------------------------------------------

export async function loginPatientApi(emailOrName, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/patient/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrName, password })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Credenciais de paciente incorretas');
    }

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      if (data.user) {
        setStoredUser(data.user);
        localStorage.setItem('TemFyla_client_user', JSON.stringify(data.user));
        localStorage.setItem('TemFyla_client_is_auth', 'true');
      }
    }
    return data;
  } catch (err) {
    console.warn('[TemFyla API] Erro no login de paciente:', err.message);
    throw err;
  }
}

export async function registerPatientApi(patientData) {
  try {
    const res = await fetch(`${API_BASE}/auth/patient/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Erro ao realizar cadastro de paciente');
    }

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      if (data.user) {
        setStoredUser(data.user);
        localStorage.setItem('TemFyla_client_user', JSON.stringify(data.user));
        localStorage.setItem('TemFyla_client_is_auth', 'true');
      }
    }
    return data;
  } catch (err) {
    console.warn('[TemFyla API] Erro ao cadastrar paciente:', err.message);
    throw err;
  }
}

export async function socialLoginPatientApi(provider = 'google', email = 'rafael.silva@email.com', name = 'Rafael Silva') {
  try {
    const res = await fetch(`${API_BASE}/auth/patient/social-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, name })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Falha no login social');
    }

    const data = await res.json();
    if (data.access_token) {
      setToken(data.access_token);
      if (data.user) {
        setStoredUser(data.user);
        localStorage.setItem('TemFyla_client_user', JSON.stringify(data.user));
        localStorage.setItem('TemFyla_client_is_auth', 'true');
      }
    }
    return data;
  } catch (err) {
    console.warn('[TemFyla API] Erro no login social:', err.message);
    throw err;
  }
}

export async function updatePatientProfileApi(profileData) {
  try {
    const res = await fetchWithAuth(`${API_BASE}/auth/patient/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Erro ao atualizar perfil do paciente');
    }
    return await res.json();
  } catch (err) {
    console.warn('[TemFyla API] Erro ao atualizar perfil:', err.message);
    throw err;
  }
}


