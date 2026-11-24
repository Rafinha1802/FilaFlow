import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readdir } from 'node:fs/promises';

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

async function renderModule(path, props = {}) {
  const { default: Component } = await server.ssrLoadModule('/src/' + path);
  return renderToStaticMarkup(React.createElement(Component, props));
}

test('páginas de cliente e profissional aguardam a restauração da sessão', async () => {
  for (const path of ['pages/cliente/app/ClientAppPage.jsx', 'pages/profissional/consultorio/ProfessionalWorkspacePage.jsx']) {
    const html = await renderModule(path);
    assert.match(html, /Verificando sessão/);
    assert.doesNotMatch(html, /Enviar pré-check-in|Concluir atendimento/);
  }
});

test('páginas de login utilizam o formulário operacional compartilhado', async () => {
  for (const [path, props] of [
    ['pages/empresa/login/CompanyLoginPage.jsx', { session: { sessionError: '' } }],
    ['pages/profissional/login/ProfessionalLoginPage.jsx', { initialError: '' }],
  ]) {
    const html = await renderModule(path, props);
    assert.match(html, /type="email"/);
    assert.match(html, /type="password"/);
  }
});

test('recepção sem permissão informa o limite e não renderiza confirmação', async () => {
  const html = await renderModule('pages/empresa/recepcao/ReceptionPage.jsx', { queueId: 'fila-teste', canConfirm: false });
  assert.match(html, /Seu papel nesta unidade/);
  assert.doesNotMatch(html, /Confirmar entrada na fila/);
});

test('lista da recepção apresenta a mesma senha e impede confirmação durante envio', async () => {
  const html = await renderModule('components/exclusivos/empresa/recepcao/PendingPrecheckins.jsx', {
    tickets: [{ id: 10, ticket_number: '#10', customer_name: 'Cliente fictício', service_name: 'Atendimento', issued_at: '2026-11-24T15:00:00Z' }],
    priority: { 10: true }, canConfirm: true, loaded: true, busy: 10,
  });
  assert.match(html, /#10/);
  assert.match(html, /Confirmando/);
  assert.match(html, /type="checkbox"[^>]*disabled=""[^>]*checked=""/);
});

test('lista individual mantém os estados e horários da senha persistida', async () => {
  const html = await renderModule('components/exclusivos/cliente/app/ClientTicketList.jsx', {
    queues: [{ id: 'fila-teste', companyName: 'Empresa fictícia', unitName: 'Unidade teste' }],
    tickets: [{ id: 10, queue_id: 'fila-teste', ticket_number: '#10', status: 'finished',
      confirmed_at: '2026-11-24T15:00:00Z', called_at: '2026-11-24T15:01:00Z', finished_at: '2026-11-24T15:02:00Z' }],
  });
  assert.match(html, /#10/);
  assert.match(html, /Atendimento concluído/);
  assert.match(html, /Confirmada em/);
  assert.match(html, /Chamada em/);
  assert.match(html, /Concluída em/);
});

test('consultório aguarda a consulta oficial antes de mostrar operação', async () => {
  const html = await renderModule('components/exclusivos/profissional/consultorio/Consultation.jsx', {
    queue: { id: 'fila-teste', serviceName: 'Atendimento' }, onBusyChange() {},
  });
  assert.match(html, /Carregando fila/);
  assert.doesNotMatch(html, /Concluir atendimento/);
});

test('página pública e checkout compõem os componentes nas novas localizações', async () => {
  const landing = await renderModule('App.jsx');
  assert.match(landing, /TemFyla/);
  const checkout = await renderModule('pages/publico/checkout/CheckoutPage.jsx', { initialPlanName: 'Profissional', initialBillingCycle: 'monthly' });
  assert.match(checkout, /Profissional/);
});

test('todos os componentes preservados resolvem seus imports após a reorganização', async () => {
  const files = await readdir(new URL('../src/', import.meta.url), { recursive: true });
  for (const file of files.filter((name) => name.endsWith('.jsx') && /^(components|pages)[\\/]/.test(name))) {
    await server.ssrLoadModule('/src/' + file.replaceAll('\\', '/'));
  }
});
