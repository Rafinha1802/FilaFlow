import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import {
  AUTH_CLEARED_EVENT, clearAuth, fetchCurrentUser, fetchMyQueues,
  getStoredUser, getToken, loginApi, setStoredUser, setToken,
} from '../src/services/api.js';

const user = { id: 'demo-company', email: 'test@example.invalid', role: 'company' };
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

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
