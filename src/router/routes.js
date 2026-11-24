export const COMPANY_TAB_PATHS = Object.freeze({
  reception: '/empresa/recepcao',
  operational: '/empresa/dashboard',
  metrics: '/empresa/metricas',
  totem: '/empresa/totem',
  team: '/empresa/equipe',
  profile: '/empresa/perfil',
});

export function normalizePath(path = '/') {
  return path.replace(/\/+$/, '') || '/';
}

export function companyTabForPath(path) {
  return Object.keys(COMPANY_TAB_PATHS).find((tab) => COMPANY_TAB_PATHS[tab] === normalizePath(path)) || 'operational';
}

export function resolveRoute(path) {
  const currentPath = normalizePath(path);
  const inArea = (base) => currentPath === base || currentPath.startsWith(base + '/');
  const isCheckoutRoute = ['/checkout', '/pagamento'].includes(currentPath);
  const isAppRoute = inArea('/app');
  const isCompanyRoute = inArea('/empresa') || ['/login', '/cadastro'].includes(currentPath);
  const isProfessionalRoute = inArea('/profissional');
  return {
    currentPath, isCheckoutRoute, isAppRoute, isCompanyRoute, isProfessionalRoute,
    isSiteRoute: !isCheckoutRoute && !isAppRoute && !isCompanyRoute && !isProfessionalRoute,
    isCompanyLogin: currentPath === '/empresa/login',
    isCompanyRegister: currentPath === '/empresa/cadastro',
    isCompanyDashboard: currentPath === '/empresa/dashboard',
    isCompanyProfile: currentPath === '/empresa/perfil',
    isProfessionalLogin: currentPath === '/profissional/login',
    isProfessionalRegister: currentPath === '/profissional/cadastro',
    isProfessionalProfile: currentPath === '/profissional/perfil',
  };
}
