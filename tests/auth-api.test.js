import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import {
  AUTH_CLEARED_EVENT, clearAuth, fetchCurrentUser, fetchMyQueues,
  getStoredUser, getToken, loginApi, setStoredUser, setToken,
  addManualTicketApi,
  callNextTicketApi, fetchQueueStateApi,
  setupQueueWebSocket,
} from '../src/services/api.js';

const user = { id: 'demo-company', email: 'test@example.invalid', role: 'company' };
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWebSocket = Object.getOwnPropertyDescriptor(globalThis, 'WebSocket');

beforeEach(() => {
  const values = new Map();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  } });
  mock.method(console, 'warn', () => {});
});

afterEach(() => {
  mock.restoreAll();
  mock.timers.reset();
  if (originalWebSocket) Object.defineProperty(globalThis, 'WebSocket', originalWebSocket);
  else delete globalThis.WebSocket;
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else delete globalThis.window;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
});

test('login envia somente as credenciais informadas e guarda a sessão recebida', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/auth/login');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { email: user.email, password: 'test-only' });
    return Response.json({ access_token: 'test-token', token_type: 'bearer', user });
  });
  const result = await loginApi(user.email, 'test-only');
  assert.equal(result.user.email, user.email);
  assert.equal(getToken(), 'test-token');
  assert.deepEqual(getStoredUser(), user);
  assert.equal(fetchMock.mock.callCount(), 1);
});

for (const [status, message] of [
  [401, /E-mail ou senha incorretos/], [503, /Login indisponível/],
  [422, /Confira o e-mail/], [500, /Não foi possível entrar/],
]) {
  test(`login HTTP ${status} não libera acesso nem mantém sessão anterior`, async () => {
    setToken('old-token');
    setStoredUser(user);
    mock.method(globalThis, 'fetch', async () => Response.json({ detail: 'erro' }, { status }));
    await assert.rejects(loginApi(user.email, 'test-only'), message);
    assert.equal(getToken(), null);
    assert.equal(getStoredUser(), null);
  });
}

test('servidor offline apresenta erro de conexão sem sucesso simulado', async () => {
  mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(loginApi(user.email, 'test-only'), /conectar ao servidor/);
  assert.equal(getToken(), null);
});

test('resposta sem token não libera acesso', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ user }));
  await assert.rejects(loginApi(user.email, 'test-only'), /Resposta de autenticação inválida/);
  assert.equal(getToken(), null);
});

test('consulta sem token não tenta autenticação automática', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => assert.fail('Não deve chamar fetch'));
  assert.equal(await fetchCurrentUser(), null);
  assert.equal(await fetchMyQueues(), null);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('restauração consulta o servidor em vez de confiar no usuário salvo', async () => {
  setToken('test-token');
  setStoredUser({ email: 'untrusted@example.invalid' });
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/auth/me');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return Response.json(user);
  });
  assert.deepEqual(await fetchCurrentUser(), user);
  assert.deepEqual(getStoredUser(), user);
});

test('401 limpa a sessão e não repete a requisição nem faz novo login', async () => {
  setToken('expired-token');
  setStoredUser(user);
  let cleared = 0;
  window.addEventListener(AUTH_CLEARED_EVENT, () => cleared++);
  const fetchMock = mock.method(globalThis, 'fetch', async () => new Response(null, { status: 401 }));
  await assert.rejects(fetchCurrentUser(), /sessão expirou/);
  assert.equal(fetchMock.mock.callCount(), 1);
  assert.equal(getToken(), null);
  assert.equal(getStoredUser(), null);
  assert.equal(cleared, 1);
});

test('logout apaga somente a sessão empresarial', () => {
  setToken('test-token');
  setStoredUser(user);
  localStorage.setItem('filaflow_client_user', 'client-demo');
  clearAuth();
  assert.equal(getToken(), null);
  assert.equal(getStoredUser(), null);
  assert.equal(localStorage.getItem('filaflow_client_user'), 'client-demo');
});

test('resposta atrasada de login não restaura sessão após logout', async () => {
  let complete;
  mock.method(globalThis, 'fetch', () => new Promise((resolve) => { complete = resolve; }));
  const pending = loginApi(user.email, 'test-only');
  clearAuth();
  complete(Response.json({ access_token: 'late-token', user }));
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(getToken(), null);
});

test('cancelar o formulário impede persistência de resposta atrasada', async () => {
  const controller = new AbortController();
  mock.method(globalThis, 'fetch', async () => {
    controller.abort();
    return Response.json({ access_token: 'late-token', user });
  });
  await assert.rejects(loginApi(user.email, 'test-only', { signal: controller.signal }), { name: 'AbortError' });
  assert.equal(getToken(), null);
});

test('401 de uma sessão antiga não apaga uma sessão mais recente', async () => {
  setToken('old-token');
  mock.method(globalThis, 'fetch', async () => {
    setToken('new-token');
    return new Response(null, { status: 401 });
  });
  await assert.rejects(fetchCurrentUser(), /sessão expirou/);
  assert.equal(getToken(), 'new-token');
});

test('falha ao guardar token impede a entrada no painel', async () => {
  mock.method(localStorage, 'setItem', () => { throw new Error('Storage blocked'); });
  mock.method(globalThis, 'fetch', async () => Response.json({ access_token: 'test-token', user }));
  await assert.rejects(loginApi(user.email, 'test-only'), /armazenamento no navegador/);
  assert.equal(getToken(), null);
});

const manualPayload = { queue_id: 'clinica-vida', customer_name: 'Teste', service_name: 'Consulta', is_priority: true };

test('emissão usa Bearer e retorna o número e a prioridade do servidor', async () => {
  setToken('test-token');
  const ticket = { ...manualPayload, ticket_number: '#49', estimated_wait_text: 'Aguardando' };
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/tickets/manual');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.deepEqual(JSON.parse(options.body), manualPayload);
    return Response.json(ticket, { status: 201 });
  });
  assert.deepEqual(await addManualTicketApi(manualPayload), ticket);
});

for (const status of [401, 404, 422, 500]) {
  test(`emissão HTTP ${status} rejeita a operação sem retornar senha local`, async () => {
    setToken('test-token');
    const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({}, { status }));
    await assert.rejects(addManualTicketApi(manualPayload));
    assert.equal(fetchMock.mock.callCount(), 1);
    if (status === 401) assert.equal(getToken(), null);
  });
}

test('falha de conexão na emissão é informada sem repetir o POST', async () => {
  setToken('test-token');
  const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(addManualTicketApi(manualPayload), /confirmar a emissão/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test('resposta incompleta não é aceita como senha emitida', async () => {
  setToken('test-token');
  mock.method(globalThis, 'fetch', async () => Response.json({ ticket_number: '#49' }, { status: 201 }));
  await assert.rejects(addManualTicketApi(manualPayload), /confirmar os dados/);
});

test('consulta autenticada restaura atendimento e fila do servidor', async () => {
  setToken('test-token');
  const state = { active_ticket: null, remaining_queue: [{ ...manualPayload, ticket_number: '#49' }] };
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/tickets?queue_id=clinica-vida');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return Response.json(state);
  });
  assert.deepEqual(await fetchQueueStateApi(), state);
});

test('chamada confirma a senha e a fila restante devolvidas pelo servidor', async () => {
  setToken('test-token');
  const ticket = { ...manualPayload, ticket_number: '#49' };
  const state = { active_ticket: ticket, called_ticket: ticket, remaining_queue: [] };
  mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/tickets/next?queue_id=clinica-vida');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return Response.json(state);
  });
  assert.deepEqual(await callNextTicketApi(), state);
});

test('fila vazia preserva o atendimento atual, sem chamada simulada', async () => {
  setToken('test-token');
  const state = { active_ticket: { ...manualPayload, ticket_number: '#49' }, called_ticket: null, remaining_queue: [] };
  mock.method(globalThis, 'fetch', async () => Response.json(state));
  assert.deepEqual(await callNextTicketApi(), state);
});

for (const status of [401, 404, 500]) {
  test(`falha HTTP ${status} na chamada não retorna dados simulados nem repete o POST`, async () => {
    setToken('test-token');
    const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json({}, { status }));
    await assert.rejects(callNextTicketApi());
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

test('falha de conexão na chamada informa confirmação incerta', async () => {
  setToken('test-token');
  mock.method(globalThis, 'fetch', async () => { throw new TypeError('offline'); });
  await assert.rejects(callNextTicketApi(), /Recarregue a fila/);
});

test('resposta incompleta de chamada é rejeitada', async () => {
  setToken('test-token');
  mock.method(globalThis, 'fetch', async () => Response.json({ called_ticket: { ticket_number: '#49' } }));
  await assert.rejects(callNextTicketApi(), /Resposta da fila inválida/);
});

function mockWebSockets() {
  mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  window.location = { protocol: 'http:', host: 'localhost:5174' };
  const sockets = [];
  class FakeSocket {
    static OPEN = 1;
    static CLOSING = 2;
    readyState = 0;
    sent = [];
    constructor(url) { this.url = url; sockets.push(this); }
    send(data) { this.sent.push(JSON.parse(data)); }
    open() { this.readyState = 1; this.onopen(); }
    receive(data) { this.onmessage({ data: JSON.stringify(data) }); }
    close(code = 1000) { this.readyState = 3; this.onclose?.({ code }); }
  }
  Object.defineProperty(globalThis, 'WebSocket', { configurable: true, value: FakeSocket });
  return sockets;
}

test('WebSocket não conecta sem sessão e não inclui token na URL', () => {
  const sockets = mockWebSockets();
  assert.equal(setupQueueWebSocket(() => {}), null);
  assert.equal(sockets.length, 0);
  setToken('test-token');
  const connection = setupQueueWebSocket(() => {});
  assert.equal(sockets[0].url, 'ws://localhost:5174/ws');
  sockets[0].open();
  assert.deepEqual(sockets[0].sent, [{ type: 'subscribe', queue_id: 'clinica-vida', token: 'test-token' }]);
  connection.close();
});

test('READY e eventos da fila são entregues; pong e outra fila são ignorados', () => {
  const sockets = mockWebSockets();
  setToken('test-token');
  const received = [];
  const connection = setupQueueWebSocket(event => received.push(event.type));
  sockets[0].open();
  sockets[0].receive({ type: 'READY', queue_id: 'clinica-vida' });
  sockets[0].receive({ type: 'TICKET_CALLED', queue_id: 'other' });
  sockets[0].receive({ type: 'pong' });
  sockets[0].receive({ type: 'TICKET_CALLED', queue_id: 'clinica-vida' });
  assert.deepEqual(received, ['READY', 'TICKET_CALLED']);
  connection.close();
});

test('queda reconecta e novo READY permite recuperar estado perdido', () => {
  const sockets = mockWebSockets();
  setToken('test-token');
  const states = [];
  const connection = setupQueueWebSocket(() => {}, 'clinica-vida', state => states.push(state));
  sockets[0].open();
  sockets[0].receive({ type: 'READY', queue_id: 'clinica-vida' });
  sockets[0].close(1006);
  mock.timers.tick(2000);
  assert.equal(sockets.length, 2);
  sockets[1].open();
  sockets[1].receive({ type: 'READY', queue_id: 'clinica-vida' });
  assert.deepEqual(states, [true, false, true]);
  connection.close();
});

test('encerrar conexão cancela reconexão e heartbeat', () => {
  const sockets = mockWebSockets();
  setToken('test-token');
  const connection = setupQueueWebSocket(() => {});
  sockets[0].open();
  sockets[0].receive({ type: 'READY', queue_id: 'clinica-vida' });
  connection.close();
  mock.timers.tick(60000);
  assert.equal(sockets.length, 1);
  assert.equal(sockets[0].sent.length, 1);
});

test('recusa de autenticação limpa sessão e não reconecta', () => {
  const sockets = mockWebSockets();
  setToken('test-token');
  setupQueueWebSocket(() => {});
  sockets[0].open();
  sockets[0].close(1008);
  mock.timers.tick(60000);
  assert.equal(getToken(), null);
  assert.equal(sockets.length, 1);
});

test('ausência de pong fecha conexão para permitir recuperação', () => {
  const sockets = mockWebSockets();
  setToken('test-token');
  const connection = setupQueueWebSocket(() => {});
  sockets[0].open();
  sockets[0].receive({ type: 'READY', queue_id: 'clinica-vida' });
  mock.timers.tick(20000);
  assert.deepEqual(sockets[0].sent[1], { type: 'ping' });
  mock.timers.tick(10000);
  assert.equal(sockets[0].readyState, 3);
  connection.close();
});

test('sessão removida durante uma queda não é reaberta pelo WebSocket', () => {
  const sockets = mockWebSockets();
  setToken('test-token');
  const connection = setupQueueWebSocket(() => {});
  sockets[0].open();
  sockets[0].close(1006);
  clearAuth();
  mock.timers.tick(2000);
  assert.equal(sockets.length, 1);
  connection.close();
});

test('falha ao criar WebSocket não interrompe o painel e pode ser cancelada', () => {
  mockWebSockets();
  setToken('test-token');
  let attempts = 0;
  Object.defineProperty(globalThis, 'WebSocket', { configurable: true, value: class {
    constructor() { attempts++; throw new Error('Unavailable'); }
  } });
  const statuses = [];
  const connection = setupQueueWebSocket(() => {}, 'clinica-vida', status => statuses.push(status));
  assert.deepEqual(statuses, [false]);
  connection.close();
  mock.timers.tick(10000);
  assert.equal(attempts, 1);
});
