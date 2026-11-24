import { useState, useEffect, useCallback } from 'react';
import { createHistoryRouter } from './historyRouter.js';
import { resolveRoute } from './routes.js';

export function useAppRouter() {
  const [router] = useState(() => createHistoryRouter(typeof window === 'undefined' ? null : window));
  const [currentPath, setCurrentPath] = useState(router.getPath);

  useEffect(() => router.subscribe(() => setCurrentPath(router.getPath())), [router]);

  const navigate = useCallback((targetPath, options = {}) => {
    setCurrentPath(router.navigate(targetPath, options));
  }, [router]);

  return { ...resolveRoute(currentPath), navigate };
}
