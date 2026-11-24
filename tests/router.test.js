import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRoute, companyTabForPath, COMPANY_TAB_PATHS } from '../src/router/routes.js';
import { createHistoryRouter } from '../src/router/historyRouter.js';

// Simula apenas o contrato do navegador. O adaptador exercitado é o da aplicação.
function browserAt(path) {
  const browser = new EventTarget();
  const entries = [path];
  let index = 0;
  const update = () => { browser.location = new URL(entries[index], 'http://localhost'); };
  browser.scrollTo = () => {};
  browser.history = {
    pushState(_state, _title, target) { entries.splice(++index); entries.push(target); update(); },
    replaceState(_state, _title, target) { entries[index] = target; update(); },
    back() { if (index > 0) { index--; update(); browser.dispatchEvent(new Event('popstate')); } },
    forward() { if (index < entries.length - 1) { index++; update(); browser.dispatchEvent(new Event('popstate')); } },
    get length() { return entries.length; },
  };
  update();
  return browser;
}

test('links diretos e aliases continuam resolvendo uma única área', () => {
  for (const [area, paths] of [
    ['isSiteRoute', ['/']],
    ['isCompanyRoute', ['/empresa', '/empresa/login', '/empresa/cadastro', '/login', '/cadastro', ...Object.values(COMPANY_TAB_PATHS)]],
    ['isAppRoute', ['/app', '/app/perfil']],
    ['isProfessionalRoute', ['/profissional', '/profissional/login', '/profissional/cadastro', '/profissional/perfil']],
    ['isCheckoutRoute', ['/checkout', '/pagamento']],
  ]) {
    for (const path of paths) {
      const route = resolveRoute(path);
      assert.equal(route[area], true, path);
      assert.equal(['isSiteRoute', 'isCompanyRoute', 'isAppRoute', 'isProfessionalRoute', 'isCheckoutRoute'].filter((key) => route[key]).length, 1, path);
    }
  }
});

test('nomes parecidos não abrem outra área por coincidência de prefixo', () => {
  for (const path of ['/empresarial', '/profissionais', '/application', '/checkout-extra']) {
    assert.equal(resolveRoute(path).isSiteRoute, true, path);
  }
});

test('URLs das abas preservam a aba correta com barra final', () => {
  for (const [tab, path] of Object.entries(COMPANY_TAB_PATHS)) {
    assert.equal(companyTabForPath(path + '/'), tab);
  }
  assert.equal(companyTabForPath('/empresa'), 'operational');
});

test('acesso direto e recarga recuperam a rota pelo pathname', () => {
  const browser = browserAt('/empresa/recepcao/?origem=teste#pendentes');
  assert.equal(createHistoryRouter(browser).getPath(), '/empresa/recepcao');
  assert.equal(createHistoryRouter(browser).getPath(), '/empresa/recepcao');
});

test('voltar e avançar notificam a mudança e o cancelamento remove o ouvinte', () => {
  const browser = browserAt('/empresa/dashboard');
  const router = createHistoryRouter(browser);
  const observed = [];
  const unsubscribe = router.subscribe(() => observed.push(router.getPath()));
  assert.equal(router.navigate('/empresa/recepcao'), '/empresa/recepcao');
  router.navigate('/empresa/perfil');
  browser.history.back();
  browser.history.back();
  browser.history.forward();
  assert.deepEqual(observed, ['/empresa/recepcao', '/empresa/dashboard', '/empresa/recepcao']);
  unsubscribe();
  browser.history.forward();
  assert.equal(observed.length, 3);
});

test('replace e navegação repetida não acrescentam entradas ao histórico', () => {
  const browser = browserAt('/empresa/login');
  const router = createHistoryRouter(browser);
  router.navigate('/empresa/dashboard', { replace: true });
  router.navigate('/empresa/dashboard');
  router.navigate('/empresa/dashboard/');
  assert.equal(browser.history.length, 1);
  assert.equal(router.getPath(), '/empresa/dashboard');
});

test('query e fragmento são preservados na URL sem afetar a área renderizada', () => {
  const browser = browserAt('/');
  const router = createHistoryRouter(browser);
  assert.equal(router.navigate('/empresa/recepcao?origem=teste#pendentes'), '/empresa/recepcao');
  assert.equal(browser.location.search, '?origem=teste');
  assert.equal(browser.location.hash, '#pendentes');
  assert.equal(resolveRoute(router.getPath()).isCompanyRoute, true);
});
