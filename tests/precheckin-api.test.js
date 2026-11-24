import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { getToken, setToken } from '../src/services/api.js';
import {
  clearClientSession, getClientToken, loginClient, restoreClientSession,
  submitPrecheckin, fetchClientTickets, confirmPrecheckin, setupTicketWebSocket,
} from '../src/services/precheckinApi.js';

const originalWebSocket = Object.getOwnPropertyDescriptor(globalThis, 'WebSocket');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const customer = { id: 'client-test', email: 'customer@example.invalid', role: 'client' };
const ticket = { id: 63, queue_id: 'north', ticket_number: '#63', status: 'pending' };

beforeEach(() => {
  const values = new Map();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  } });
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

async function signIn() {
  mock.method(globalThis, 'fetch', async () => Response.json({ access_token: 'client-token', user: customer }));
  await loginClient(customer.email, 'test-only');
}

test('sessão de cliente e logout preservam a sessão empresarial', async () => {
  setToken('company-token');
  await signIn();
  assert.equal(getClientToken(), 'client-token');
  assert.equal(getToken(), 'company-token');
  clearClientSession();
  assert.equal(getClientToken(), null);
  assert.equal(getToken(), 'company-token');
});

test('perfil operacional não é aceito como login de cliente', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({
    access_token: 'operator', user: { role: 'company' },
  }));
  await assert.rejects(loginClient('operator@example.invalid', 'test-only'), /conta de cliente/);
  assert.equal(getClientToken(), null);
});

test('resposta atrasada do login não restaura cliente após sair', async () => {
  let resolve;
  mock.method(globalThis, 'fetch', () => new Promise((done) => { resolve = done; }));
  const pending = loginClient(customer.email, 'test-only');
  clearClientSession();
  resolve(Response.json({ access_token: 'old-client', user: customer }));
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(getClientToken(), null);
});

test('repetição após perda da resposta usa o mesmo request_id', async () => {
  await signIn();
  const requests = [];
  globalThis.fetch.mock.mockImplementation(async (path, options) => {
    requests.push(JSON.parse(options.body));
    if (requests.length === 1) throw new TypeError('offline');
    return Response.json(ticket);
  });
  await assert.rejects(submitPrecheckin('north', customer.id), /mesmo pedido/);
  assert.deepEqual(await submitPrecheckin('north', customer.id), ticket);
  assert.equal(requests[0].request_id, requests[1].request_id);
  assert.equal(requests[0].queue_id, 'north');
  assert.equal(localStorage.getItem('temfyla_precheckin:client-test:north'), null);
});

test('consulta e expiração usam apenas a credencial do cliente', async () => {
  setToken('company-token');
  await signIn();
  globalThis.fetch.mock.mockImplementation(async (path, options) => {
    assert.equal(path, '/api/pre-checkins/me');
    assert.equal(options.headers.Authorization, 'Bearer client-token');
    return new Response('', { status: 401 });
  });
  await assert.rejects(fetchClientTickets(), /expirou/);
  assert.equal(getClientToken(), null);
  assert.equal(getToken(), 'company-token');
});

test('restauração valida a conta no servidor', async () => {
  await signIn();
  globalThis.fetch.mock.mockImplementation(async (path) => {
    assert.equal(path, '/api/auth/me');
    return Response.json(customer);
  });
  assert.deepEqual(await restoreClientSession(), customer);
});

test('recepção confirma a mesma senha e informa falha de autorização', async () => {
  setToken('reception-token');
  const fetchMock = mock.method(globalThis, 'fetch', async (path, options) => {
    assert.equal(path, '/api/pre-checkins/63/confirm');
    assert.equal(options.headers.Authorization, 'Bearer reception-token');
    assert.deepEqual(JSON.parse(options.body), { is_priority: true });
    return Response.json({ ...ticket, status: 'waiting' });
  });
  assert.equal((await confirmPrecheckin(63, true)).status, 'waiting');
  fetchMock.mock.mockImplementation(async () => new Response('', { status: 403 }));
  await assert.rejects(confirmPrecheckin(63, true), /confirmação falhou/);
});

function fakeSockets() {
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

test('cliente assina a própria senha com credencial independente e recupera READY após queda', async () => {
  await signIn();
  setToken('company-token');
  const sockets = fakeSockets();
  const events = [];
  const connection = setupTicketWebSocket(63, (event) => events.push(event.type));
  assert.equal(sockets[0].url, 'ws://localhost:5174/ws/tickets');
  sockets[0].open();
  assert.deepEqual(sockets[0].sent[0], { type: 'subscribe', ticket_id: 63, token: 'client-token' });
  sockets[0].receive({ type: 'READY', ticket_id: 63 });
  sockets[0].receive({ type: 'TICKET_UPDATED', ticket_id: 64 });
  sockets[0].receive({ type: 'TICKET_UPDATED', ticket_id: 63 });
  assert.deepEqual(events, ['READY', 'TICKET_UPDATED']);
  sockets[0].close(1006);
  mock.timers.tick(2000);
  assert.equal(sockets.length, 2);
  sockets[1].open();
  sockets[1].receive({ type: 'READY', ticket_id: 63 });
  assert.equal(events.at(-1), 'READY');
  connection.close();
  assert.equal(getToken(), 'company-token');
});

test('recusa da assinatura encerra somente a sessão do cliente', async () => {
  await signIn();
  setToken('company-token');
  const sockets = fakeSockets();
  setupTicketWebSocket(63, () => {});
  sockets[0].open();
  sockets[0].close(1008);
  mock.timers.tick(10000);
  assert.equal(getClientToken(), null);
  assert.equal(getToken(), 'company-token');
  assert.equal(sockets.length, 1);
});
