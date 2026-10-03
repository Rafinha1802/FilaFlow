import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  LogIn,
  UserPlus,
  ShieldCheck,
  KeyRound,
  X,
  Check,
  Clock
} from 'lucide-react';
import { loginApi } from '../../services/api';

export default function MobileAuthView({
  initialMode = 'login', // 'login' | 'signup' | 'register' | 'recovery'
  onSuccess
}) {
  const normalizeMode = (m) => {
    if (m === 'signup' || m === 'register' || m === 'cadastro') return 'signup';
    if (m === 'recovery' || m === 'recuperacao') return 'recovery';
    return 'login';
  };

  const [authMode, setAuthMode] = useState(() => normalizeMode(initialMode));
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(normalizeMode(initialMode));
    }
  }, [initialMode]);

  // Estado do Formulário de Login (com valores demonstrativos amigáveis)
  const [loginEmailOrUser, setLoginEmailOrUser] = useState('rafael.silva@email.com');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Estado do Formulário de Cadastro
  const [signupName, setSignupName] = useState('Rafael Silva');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Estado de Recuperação de Senha
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Submissão do Login
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const identifier = loginEmailOrUser.trim() || 'Rafael Silva';
    setIsLoading(true);

    try {
      if (identifier.includes('@')) {
        await loginApi(identifier, loginPassword).catch(() => {});
      }

      const registeredUsers = JSON.parse(
        localStorage.getItem('filaflow_registered_clients') || '[]'
      );
      const foundUser = registeredUsers.find(
        (u) =>
          u.email?.toLowerCase() === identifier.toLowerCase() ||
          u.name?.toLowerCase() === identifier.toLowerCase()
      );

      let authenticatedUser = null;

      if (foundUser) {
        authenticatedUser = foundUser;
      } else {
        const isDefault = identifier.toLowerCase().includes('rafael') || identifier.toLowerCase().includes('silva');
        authenticatedUser = {
          id: isDefault ? 'usr_rafael' : 'usr_' + Date.now(),
          name: isDefault ? 'Rafael Silva' : (identifier.includes('@') ? identifier.split('@')[0] : identifier),
          email: identifier.includes('@') ? identifier : (isDefault ? 'rafael.silva@email.com' : `${identifier.toLowerCase().replace(/\s+/g, '.')}@email.com`),
          phone: '(11) 98765-4321',
          cpf: '345.678.901-22',
          insurance: 'Unimed Nacional',
          cardNumber: '0012.3456.7890.1234',
          avatarInitial: isDefault ? 'R' : identifier.charAt(0).toUpperCase(),
          role: 'patient'
        };
      }

      localStorage.setItem('filaflow_client_user', JSON.stringify(authenticatedUser));

      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) onSuccess(authenticatedUser);
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Erro ao realizar login.');
    }
  };

  // Submissão do Cadastro
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupEmail.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    if (!signupPassword) {
      setErrorMessage('Por favor, crie uma senha.');
      return;
    }
    if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = {
        id: 'usr_' + Date.now(),
        name: signupName.trim() || 'Rafael Silva',
        email: signupEmail.trim().toLowerCase(),
        phone: '(11) 98765-4321',
        cpf: '345.678.901-22',
        insurance: 'Unimed Nacional',
        cardNumber: '0012.3456.7890.1234',
        avatarInitial: (signupName.trim() || signupEmail).charAt(0).toUpperCase(),
        role: 'patient',
        createdAt: new Date().toISOString()
      };

      const existing = JSON.parse(
        localStorage.getItem('filaflow_registered_clients') || '[]'
      );
      existing.push(newUser);
      localStorage.setItem('filaflow_registered_clients', JSON.stringify(existing));
      localStorage.setItem('filaflow_client_user', JSON.stringify(newUser));

      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) onSuccess(newUser);
      }, 350);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Erro ao criar conta.');
    }
  };

  // Login Social (Apple / Google)
  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const socialUser = {
        id: `usr_${provider}_` + Date.now(),
        name: 'Rafael Silva',
        email: 'rafael.silva@email.com',
        phone: '(11) 98765-4321',
        cpf: '345.678.901-22',
        insurance: 'Unimed Nacional',
        cardNumber: '0012.3456.7890.1234',
        avatarInitial: 'R',
        role: 'patient'
      };
      localStorage.setItem('filaflow_client_user', JSON.stringify(socialUser));
      if (onSuccess) onSuccess(socialUser);
    }, 350);
  };

  return (
    <div className="ff-ref-auth-screen">
      {/* Brilho Ambiente e Ondas Decorativas */}
      <div className="ff-ref-bg-ambient" />
      <svg className="ff-ref-bg-waves" viewBox="0 0 400 240" fill="none" preserveAspectRatio="none">
        <path 
          d="M0,80 C120,160 220,10 400,90 L400,0 L0,0 Z" 
          fill="rgba(255, 255, 255, 0.12)" 
        />
        <path 
          d="M0,140 C140,40 260,180 400,120 L400,0 L0,0 Z" 
          fill="rgba(255, 255, 255, 0.08)" 
        />
      </svg>

      {/* 1. Barra Superior com Alternador Centralizado: Entrar | Cadastrar */}
      <div className="ff-ref-mode-bar">
        <div className="ff-ref-screen-segmented">
          <button
            type="button"
            className={`ff-ref-segment-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`ff-ref-segment-tab ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
            }}
          >
            Cadastrar
          </button>
        </div>
      </div>

      {/* ========================================================
          TELA 1: LOGIN (Entrar)
          ======================================================== */}
      {authMode === 'login' && (
        <>
          {/* Cabeçalho com Tipografia em Português & Mockup Inclinado */}
          <div className="ff-ref-hero-area">
            <div className="ff-ref-hero-text-col">
              <h1 className="ff-ref-hero-title">
                Acesse sua conta<br />
                para acompanhar<br />
                suas filas e consultas.
              </h1>
            </div>

            {/* Mockup Flutuante Inclinado */}
            <div className="ff-ref-hero-graphic-wrap">
              <svg className="ff-ref-gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>

              <div className="ff-ref-floating-card">
                <div className="ff-ref-card-screen-mini">
                  <span className="ff-ref-mini-pill">Ao Vivo</span>
                  <span className="ff-ref-mini-num">#47</span>
                </div>
                <div>
                  <div className="ff-ref-mini-bar purple" />
                  <div className="ff-ref-mini-bar short" />
                </div>
              </div>
            </div>
          </div>

          {/* Cartão Branco Curvado Inferior */}
          <div className="ff-ref-bottom-card">
            <div className="ff-ref-card-header">
              <h2 className="ff-ref-card-title">Entrar</h2>
              <p className="ff-ref-card-subtitle">
                Não tem uma conta?{' '}
                <button
                  type="button"
                  className="ff-ref-link-highlight"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                  }}
                >
                  Cadastre-se
                </button>
              </p>
            </div>

            {errorMessage && (
              <div className="ff-ref-error-banner">{errorMessage}</div>
            )}

            <form onSubmit={handleLoginSubmit}>
              {/* Campo 1: Usuário / E-mail */}
              <div className="ff-ref-input-group">
                <User size={18} className="ff-ref-input-icon" />
                <input
                  type="text"
                  className="ff-ref-input-field"
                  placeholder="Seu e-mail ou nome completo"
                  value={loginEmailOrUser}
                  onChange={(e) => setLoginEmailOrUser(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              {/* Campo 2: Senha */}
              <div className="ff-ref-input-group">
                <Lock size={18} className="ff-ref-input-icon" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="ff-ref-input-field"
                  placeholder="Digite sua senha"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="ff-ref-eye-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Linha de Opções: Lembrar de mim & Esqueceu a senha */}
              <div className="ff-ref-options-row">
                <label className="ff-ref-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>

                <button
                  type="button"
                  className="ff-ref-forgot-link"
                  onClick={() => setAuthMode('recovery')}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de Envio Pílula */}
              <button
                type="submit"
                className="ff-ref-btn-primary"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
              </button>
            </form>

            {/* Divisor */}
            <div className="ff-ref-divider">
              <span>Ou continue com</span>
            </div>

            {/* Botões Sociais: Apple & Google */}
            <div className="ff-ref-social-grid">
              <button
                type="button"
                className="ff-ref-social-btn apple"
                onClick={() => handleSocialLogin('apple')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.67-.82 1.13-1.96 1-3.11-1 .04-2.18.67-2.87 1.48-.6.7-1.13 1.83-1 2.96 1.11.08 2.21-.54 2.87-1.33z" />
                </svg>
                <span>Apple</span>
              </button>

              <button
                type="button"
                className="ff-ref-social-btn google"
                onClick={() => handleSocialLogin('google')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          TELA 2: CADASTRO (Criar Conta)
          ======================================================== */}
      {authMode === 'signup' && (
        <>
          {/* Cabeçalho com Tipografia em Português & Mockup Inclinado */}
          <div className="ff-ref-hero-area">
            <div className="ff-ref-hero-text-col">
              <h1 className="ff-ref-hero-title">
                Crie sua Conta<br />
                e simplifique o seu<br />
                tempo de espera.
              </h1>
            </div>

            {/* Mockup Flutuante Inclinado */}
            <div className="ff-ref-hero-graphic-wrap">
              <svg className="ff-ref-gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>

              <div className="ff-ref-floating-card">
                <div className="ff-ref-card-screen-mini">
                  <span className="ff-ref-mini-pill">VIP</span>
                  <span className="ff-ref-mini-num">#48</span>
                </div>
                <div>
                  <div className="ff-ref-mini-bar purple" />
                  <div className="ff-ref-mini-bar short" />
                </div>
              </div>
            </div>
          </div>

          {/* Cartão Branco Curvado Inferior */}
          <div className="ff-ref-bottom-card">
            <div className="ff-ref-card-header">
              <h2 className="ff-ref-card-title">Criar Conta</h2>
              <p className="ff-ref-card-subtitle">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  className="ff-ref-link-highlight"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                >
                  Entrar
                </button>
              </p>
            </div>

            {errorMessage && (
              <div className="ff-ref-error-banner">{errorMessage}</div>
            )}

            <form onSubmit={handleSignupSubmit}>
              {/* Campo 1: Nome Completo */}
              <div className="ff-ref-input-group">
                <User size={18} className="ff-ref-input-icon" />
                <input
                  type="text"
                  className="ff-ref-input-field"
                  placeholder="Seu nome completo"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              {/* Campo 2: E-mail */}
              <div className="ff-ref-input-group">
                <Mail size={18} className="ff-ref-input-icon" />
                <input
                  type="email"
                  className="ff-ref-input-field"
                  placeholder="Digite seu e-mail"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Campo 3: Senha */}
              <div className="ff-ref-input-group">
                <Lock size={18} className="ff-ref-input-icon" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  className="ff-ref-input-field"
                  placeholder="Crie uma senha"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="ff-ref-eye-btn"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  tabIndex={-1}
                >
                  {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Campo 4: Confirmação de Senha */}
              <div className="ff-ref-input-group">
                <Lock size={18} className="ff-ref-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="ff-ref-input-field"
                  placeholder="Confirme sua senha"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="ff-ref-eye-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Linha de Opções */}
              <div className="ff-ref-options-row">
                <label className="ff-ref-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>

                <button
                  type="button"
                  className="ff-ref-forgot-link"
                  onClick={() => setAuthMode('recovery')}
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Botão de Envio Pílula */}
              <button
                type="submit"
                className="ff-ref-btn-primary"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Criando conta...' : 'Cadastrar'}</span>
              </button>
            </form>

            {/* Divisor */}
            <div className="ff-ref-divider">
              <span>Ou continue com</span>
            </div>

            {/* Botões Sociais */}
            <div className="ff-ref-social-grid">
              <button
                type="button"
                className="ff-ref-social-btn apple"
                onClick={() => handleSocialLogin('apple')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.67-.82 1.13-1.96 1-3.11-1 .04-2.18.67-2.87 1.48-.6.7-1.13 1.83-1 2.96 1.11.08 2.21-.54 2.87-1.33z" />
                </svg>
                <span>Apple</span>
              </button>

              <button
                type="button"
                className="ff-ref-social-btn google"
                onClick={() => handleSocialLogin('google')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          TELA 3: RECUPERAÇÃO DE SENHA
          ======================================================== */}
      {authMode === 'recovery' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="ff-ref-hero-area" style={{ minHeight: 90 }}>
            <h1 className="ff-ref-hero-title">
              Recuperar Acesso<br />
              à sua Conta
            </h1>
          </div>

          <div className="ff-ref-bottom-card" style={{ flex: 1 }}>
            <div className="ff-ref-card-header">
              <h2 className="ff-ref-card-title">Esqueceu a senha?</h2>
              <p className="ff-ref-card-subtitle">
                Digite seu e-mail cadastrado e enviaremos um link de redefinição imediato.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`Link de redefinição enviado com sucesso para ${recoveryEmail || 'seu e-mail'}`);
              setAuthMode('login');
            }}>
              <div className="ff-ref-input-group">
                <Mail size={18} className="ff-ref-input-icon" />
                <input
                  type="email"
                  className="ff-ref-input-field"
                  placeholder="Digite seu e-mail cadastrado"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="ff-ref-btn-primary"
                style={{ marginTop: 12 }}
              >
                <KeyRound size={16} />
                <span>Enviar Link de Recuperação</span>
              </button>

              <button
                type="button"
                className="ff-ref-link-highlight"
                style={{ display: 'block', margin: '18px auto 0', textAlign: 'center' }}
                onClick={() => setAuthMode('login')}
              >
                ← Voltar para Entrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
