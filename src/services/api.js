// FilaFlow API Service Client
const API_BASE = '/api';

export async function fetchQueues() {
  try {
    const res = await fetch(`${API_BASE}/queues`);
    if (!res.ok) throw new Error('Falha ao buscar filas');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Backend offline ou erro, usando fallback local:', err);
    return null;
  }
}

export async function callNextTicketApi(queueId = 'clinica-vida') {
  try {
    const res = await fetch(`${API_BASE}/tickets/next?queue_id=${encodeURIComponent(queueId)}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Erro ao chamar próximo');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao chamar próximo:', err);
    return null;
  }
}

export async function reportDelayApi(queueId = 'clinica-vida', minutes = 5) {
  try {
    const res = await fetch(`${API_BASE}/tickets/delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/tickets/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/reception/waiting-list`);
    if (!res.ok) throw new Error('Erro ao buscar lista da recepção');
    return await res.json();
  } catch (err) {
    console.warn('[FilaFlow API] Erro ao buscar lista da recepção:', err);
    return null;
  }
}

export async function addReceptionPatientApi(patientData) {
  try {
    const res = await fetch(`${API_BASE}/reception/waiting-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}/status?status=${encodeURIComponent(status)}`, {
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
    const res = await fetch(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${API_BASE}/reception/waiting-list/${encodeURIComponent(patientId)}`, {
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
export function setupQueueWebSocket(onMessage) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  let socket = null;
  try {
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      console.log('[FilaFlow WS] Conectado ao servidor de eventos em tempo real.');
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error('[FilaFlow WS] Erro ao processar mensagem recebida:', e);
      }
    };
    socket.onerror = (err) => {
      console.warn('[FilaFlow WS] Alerta no socket:', err);
    };
    socket.onclose = () => {
      console.log('[FilaFlow WS] Conexão fechada.');
    };
  } catch (e) {
    console.warn('[FilaFlow WS] WebSocket não pôde ser iniciado:', e);
  }

  return socket;
}
