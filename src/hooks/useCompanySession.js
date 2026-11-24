import { useEffect, useState } from 'react';
import { fetchCurrentUser, clearAuth, AUTH_CLEARED_EVENT } from '../services/api';

export function useCompanySession(currentPath, isCompanyRoute) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authCheckedPath, setAuthCheckedPath] = useState(null);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    let active = true;
    const resetSession = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
    };
    const validateSession = async () => {
      if (!isCompanyRoute) return;
      setAuthCheckedPath(null);
      setSessionError('');
      try {
        const user = await fetchCurrentUser();
        if (active) {
          setCurrentUser(user);
          setIsAuthenticated(Boolean(user));
        }
      } catch (err) {
        if (active) {
          resetSession();
          setSessionError('Não foi possível validar sua sessão. Entre novamente.');
        }
      } finally {
        if (active) setAuthCheckedPath(currentPath);
      }
    };
    const onStorage = (event) => {
      if (event.key === 'filaflow_token' || event.key === null) {
        resetSession();
        validateSession();
      }
    };
    window.addEventListener(AUTH_CLEARED_EVENT, resetSession);
    window.addEventListener('storage', onStorage);
    validateSession();
    return () => {
      active = false;
      window.removeEventListener(AUTH_CLEARED_EVENT, resetSession);
      window.removeEventListener('storage', onStorage);
    };
  }, [currentPath, isCompanyRoute]);
  const acceptUser = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(Boolean(user));
    setSessionError('');
    setAuthCheckedPath('/empresa/dashboard');
  };
  const logout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };
  return { isAuthenticated, currentUser, authCheckedPath, sessionError, acceptUser, logout };
}
