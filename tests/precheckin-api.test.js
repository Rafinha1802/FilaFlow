import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import { getToken, setToken } from '../src/services/api.js';
import {
  clearClientSession, getClientToken, loginClient, restoreClientSession,
  submitPrecheckin, fetchClientTickets, confirmPrecheckin,
} from '../src/services/precheckinApi.js';

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
