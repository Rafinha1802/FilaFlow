import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let server;
let CompanyDashboardPage;
before(async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  ({ default: CompanyDashboardPage } = await server.ssrLoadModule('/src/pages/empresa/painel/CompanyDashboardPage.jsx'));
});
after(async () => { await server?.close(); delete globalThis.localStorage; });

function render(session) {
  return renderToStaticMarkup(React.createElement(CompanyDashboardPage, {
    currentPath: '/empresa/dashboard', navigate() {}, session,
    businessData: {}, onUpdateBusinessData() {}, onNotify() {},
    onReportDelay() {}, onLogout() {}, onGoToSignup() {},
  }));
}

test('painel aguarda a validação da sessão antes de renderizar conteúdo operacional', () => {
  const html = render({ isAuthenticated: true, authCheckedPath: null });
  assert.match(html, /Verificando sessão/);
  assert.doesNotMatch(html, /Sua conta não possui filas/);
});

test('acesso direto sem sessão renderiza o formulário de login compartilhado', () => {
  const html = render({ isAuthenticated: false, authCheckedPath: '/empresa/dashboard', sessionError: '' });
  assert.match(html, /type="password"/);
  assert.match(html, /type="email"/);
  assert.doesNotMatch(html, /Sua conta não possui filas/);
});

test('sessão validada compõe o painel sem referências ou imports quebrados', () => {
  const html = render({ isAuthenticated: true, authCheckedPath: '/empresa/dashboard' });
  assert.match(html, /Sua conta não possui filas disponíveis/);
  assert.doesNotMatch(html, /type="password"/);
});
