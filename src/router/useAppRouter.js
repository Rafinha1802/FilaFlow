import { useState, useEffect, useCallback } from 'react';

/**
 * Custom lightweight history-based router for FilaFlow
 * Supports seamless navigation between:
 * - / (Institutional Site / Landing Page)
 * - /app (Mobile App Experience)
 * - /empresa (Company Auth)
 * - /empresa/dashboard (Company SaaS Panel)
 */
export function useAppRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path || '/';
      setCurrentPath(cleanPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((targetPath, options = {}) => {
    const cleanPath = targetPath.endsWith('/') && targetPath.length > 1 ? targetPath.slice(0, -1) : targetPath || '/';
    
    if (window.location.pathname !== cleanPath) {
      if (options.replace) {
        window.history.replaceState({}, '', cleanPath);
      } else {
        window.history.pushState({}, '', cleanPath);
      }
    }
    setCurrentPath(cleanPath);
    window.scrollTo(0, 0);
  }, []);

  const isCheckoutRoute = currentPath === '/checkout' || currentPath === '/pagamento';
  const isAppRoute = currentPath === '/app' || currentPath.startsWith('/app/');
  const isCompanyRoute = currentPath === '/empresa' || currentPath === '/empresa/dashboard';
  const isProfessionalRoute = currentPath === '/profissional' || currentPath.startsWith('/profissional');
  const isSiteRoute = !isAppRoute && !isCompanyRoute && !isCheckoutRoute && !isProfessionalRoute;

  return {
    currentPath,
    navigate,
    isAppRoute,
    isCompanyRoute,
    isCheckoutRoute,
    isProfessionalRoute,
    isSiteRoute
  };
}
