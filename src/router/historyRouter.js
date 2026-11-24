import { normalizePath } from './routes.js';

// Adaptador da History API usado pelo React e pelos testes de navegação.
export function createHistoryRouter(browser) {
  const getPath = () => normalizePath(browser?.location.pathname || '/');
  return {
    getPath,
    navigate(targetPath = '/', { replace = false } = {}) {
      if (!browser) return normalizePath(targetPath);
      const url = new URL(targetPath || '/', browser.location.href);
      const target = normalizePath(url.pathname) + url.search + url.hash;
      const current = browser.location.pathname + (browser.location.search || '') + (browser.location.hash || '');
      if (current !== target) {
        browser.history[replace ? 'replaceState' : 'pushState']({}, '', target);
      }
      browser.scrollTo(0, 0);
      return getPath();
    },
    subscribe(listener) {
      browser?.addEventListener('popstate', listener);
      return () => browser?.removeEventListener('popstate', listener);
    },
  };
}
