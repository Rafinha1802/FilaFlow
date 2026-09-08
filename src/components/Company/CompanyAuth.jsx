import React, { useState } from 'react';
import { 
  Layers, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  ShieldCheck
} from 'lucide-react';

export default function CompanyAuth({
  initialTab = 'login',
  onLoginSuccess,
  onRegisterSuccess,
  onBackToLanding,
  onGoToClient
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [registerStep, setRegisterStep] = useState(1); // 1: Conta, 2: Empresa, 3: Fila

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('atendimento@clinicavida.com.br');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [adminName, setAdminName] = useState('Dr. Carlos Mendes');
  const [companyEmail, setCompanyEmail] = useState('contato@novocentro.com.br');
  const [companyPassword, setCompanyPassword] = useState('SenhaForte123!');
  
  const [companyName, setCompanyName] = useState('Centro Médico Aurora');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [category, setCategory] = useState('Clínica');
  const [unitName, setUnitName] = useState('Unidade Jardins');
  const [phone, setPhone] = useState('(11) 98765-4321');

  const [queueName, setQueueName] = useState('Consultório 01 - Triagem & Atendimento');
  const [attendantName, setAttendantName] = useState('Dra. Beatriz Santos');
  const [avgWaitMin, setAvgWaitMin] = useState(15);
  const [aiMode, setAiMode] = useState('smart');

  const categories = [
    'Clínica', 
    'Restaurante', 
    'Salão', 
    'Laboratório', 
    'Barbearia', 
    'Oficina', 
    'Órgãos Públicos', 
    'Outro'
  ];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      companyName: 'Clínica Vida',
      unitName: 'Unidade Centro',
      attendantName: 'Dr. Carlos Mendes',
      category: 'Clínica',
      room: 'Consultório 04',
      email: loginEmail
    });
  };

  const handleFastDemoLogin = () => {
    onLoginSuccess({
      companyName: 'Clínica Vida',
      unitName: 'Unidade Centro',
      attendantName: 'Dr. Carlos Mendes',
      category: 'Clínica',
      room: 'Consultório 04',
      email: 'atendimento@clinicavida.com.br'
    });
  };

  const handleFillDemoRegister = () => {
    setAdminName('Dra. Beatriz Santos');
    setCompanyEmail('gestao@centromedicofila.com.br');
    setCompanyName('Centro Médico Aurora');
    setCnpj('28.749.123/0001-44');
    setUnitName('Unidade Jardins');
    setCategory('Clínica');
    setPhone('(11) 97123-4567');
    setQueueName('Consultório 01 - Triagem & Consulta');
    setAttendantName('Dra. Beatriz Santos');
    setAvgWaitMin(15);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onRegisterSuccess({
      companyName,
      unitName,
      category,
      cnpj,
      phone,
      attendantName: attendantName || adminName,
      queueName,
      avgWaitMin,
      email: companyEmail,
      room: queueName
    });
  };

  return (
    <div className="ff-auth-layout">
      {/* Top Bar for Navigation */}
      <header className="ff-auth-topbar">
        <button 
          onClick={onBackToLanding} 
          className="ff-auth-nav-link"
          title="Retornar à página inicial"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Site Institucional</span>
        </button>

        <div className="ff-auth-logo-center" onClick={onBackToLanding}>
          <div className="ff-logo-mark" style={{ width: 34, height: 34 }}>
            <Layers size={18} />
          </div>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
            Fila<span style={{ color: '#7c3aed' }}>Flow</span>
          </span>
        </div>

        <button 
          onClick={onGoToClient} 
          className="ff-auth-client-link"
          title="Ir para o celular e ver senhas ativas"
        >
          <Smartphone size={15} />
          <span>Sou Cliente / Minhas Filas</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="ff-auth-main-container">
        <div className="ff-auth-card">
          {/* Tabs: Entrar vs Cadastrar */}
          <div className="ff-auth-tabs">
            <button
              className={`ff-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              <span>Entrar na Conta</span>
            </button>

            <button
              className={`ff-auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <span>Cadastrar Empresa</span>
              <span className="ff-tab-badge">Grátis 14 dias</span>
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="ff-auth-content-pane">
              <div className="ff-auth-header-text">
                <h1 className="ff-auth-title">Painel Operacional da Empresa</h1>
                <p className="ff-auth-subtitle">
                  Faça login para controlar suas filas em tempo real, chamar senhas e monitorar métricas.
                </p>
              </div>

              {/* Fast 1-Click Demo Login */}
              <div className="ff-fast-demo-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Sparkles size={16} color="#7c3aed" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Acesso Demonstrativo Instantâneo
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  Quer apenas testar o sistema? Entre imediatamente como <strong>Clínica Vida</strong> com dados simulados ao vivo.
                </p>
                <button
                  type="button"
                  onClick={handleFastDemoLogin}
                  className="ff-btn-fast-demo"
                >
                  <Building2 size={16} />
                  <span>Acessar Demo: Clínica Vida (Dr. Carlos)</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="ff-auth-divider">
                <span>ou acesse com seu e-mail</span>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleLoginSubmit} className="ff-form" style={{ gap: 16 }}>
                <div className="ff-form-group">
                  <label className="ff-form-label">E-mail Corporativo</label>
                  <div className="ff-input-wrapper">
                    <Mail size={16} className="ff-input-icon" />
                    <input
                      type="email"
                      className="ff-input"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="atendimento@suaempresa.com.br"
                      required
                    />
                  </div>
                </div>

                <div className="ff-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="ff-form-label">Senha</label>
                    <a 
                      href="#esqueceu" 
                      onClick={(e) => { e.preventDefault(); alert('Em ambiente de demonstração, você pode clicar em "Acessar Demo" para entrar imediatamente.'); }}
                      style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="ff-input-wrapper">
                    <Lock size={16} className="ff-input-icon" />
                    <input
                      type="password"
                      className="ff-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#7c3aed', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="rememberMe" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                    Manter conectado neste navegador
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', background: '#7c3aed' }}>
                  <span>Entrar no Painel Operacional</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                Sua empresa ainda não utiliza o FilaFlow?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Cadastre-se Gratuitamente
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <div className="ff-auth-content-pane">
              {/* Stepper Header */}
              <div className="ff-register-stepper">
                <div 
                  className={`ff-reg-step ${registerStep >= 1 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(1)}
                >
                  <span className="step-num">1</span>
                  <span className="step-label">Conta</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 2 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(2)}
                >
                  <span className="step-num">2</span>
                  <span className="step-label">Empresa</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 3 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(3)}
                >
                  <span className="step-num">3</span>
                  <span className="step-label">Fila Inicial</span>
                </div>
              </div>

              {/* Demo auto-fill helper */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={handleFillDemoRegister}
                  className="ff-btn-autofill"
                  title="Preencher com dados de teste para acelerar"
                >
                  <Sparkles size={13} />
                  <span>Preencher dados de exemplo</span>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                {/* STEP 1: CONTA */}
                {registerStep === 1 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">Nome Completo do Responsável *</label>
                      <div className="ff-input-wrapper">
                        <User size={16} className="ff-input-icon" />
                        <input
                          type="text"
                          className="ff-input"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="Ex: Dra. Ana Paula Costa"
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">E-mail Profissional *</label>
                      <div className="ff-input-wrapper">
                        <Mail size={16} className="ff-input-icon" />
                        <input
                          type="email"
                          className="ff-input"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="gestao@suaempresa.com.br"
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Criar Senha de Acesso *</label>
                      <div className="ff-input-wrapper">
                        <Lock size={16} className="ff-input-icon" />
                        <input
                          type="password"
                          className="ff-input"
                          value={companyPassword}
                          onChange={(e) => setCompanyPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(2)}
                        className="btn-primary"
                        style={{ background: '#7c3aed' }}
                      >
                        <span>Próximo: Dados da Empresa</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: EMPRESA */}
                {registerStep === 2 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">Nome Fantasia do Estabelecimento *</label>
                      <div className="ff-input-wrapper">
                        <Building2 size={16} className="ff-input-icon" />
                        <input
                          type="text"
                          className="ff-input"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex: Clínica Saúde Total"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div className="ff-form-group">
                        <label className="ff-form-label">CNPJ ou CPF</label>
                        <input
                          type="text"
                          className="ff-input"
                          value={cnpj}
                          onChange={(e) => setCnpj(e.target.value)}
                          placeholder="00.000.000/0001-00"
                          style={{ paddingLeft: 12 }}
                        />
                      </div>

                      <div className="ff-form-group">
                        <label className="ff-form-label">Unidade / Bairro *</label>
                        <input
                          type="text"
                          className="ff-input"
                          value={unitName}
                          onChange={(e) => setUnitName(e.target.value)}
                          placeholder="Ex: Unidade Centro"
                          style={{ paddingLeft: 12 }}
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Segmento de Atuação</label>
                      <div className="ff-segment-pills-row" style={{ marginTop: 4 }}>
                        {categories.map((cat, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`ff-segment-pill-btn ${category === cat ? 'active' : ''}`}
                            onClick={() => setCategory(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">WhatsApp de Contato</label>
                      <div className="ff-input-wrapper">
                        <Phone size={16} className="ff-input-icon" />
                        <input
                          type="tel"
                          className="ff-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(11) 98765-4321"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        className="btn-ghost"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegisterStep(3)}
                        className="btn-primary"
                        style={{ background: '#7c3aed' }}
                      >
                        <span>Próximo: Configurar Fila</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: FILA & IA */}
                {registerStep === 3 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">Nome da Primeira Fila / Sala *</label>
                      <input
                        type="text"
                        className="ff-input"
                        value={queueName}
                        onChange={(e) => setQueueName(e.target.value)}
                        placeholder="Ex: Consultório 01, Guichê 03, Balcão"
                        style={{ paddingLeft: 12 }}
                        required
                      />
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Profissional / Atendente Responsável</label>
                      <input
                        type="text"
                        className="ff-input"
                        value={attendantName}
                        onChange={(e) => setAttendantName(e.target.value)}
                        placeholder="Ex: Dra. Beatriz Santos"
                        style={{ paddingLeft: 12 }}
                      />
                    </div>

                    <div className="ff-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="ff-form-label">Tempo Médio Previsto por Atendimento</label>
                        <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 16 }}>
                          {avgWaitMin} min
                        </span>
                      </div>
                      <input
                        type="range"
                        min="3"
                        max="60"
                        value={avgWaitMin}
                        onChange={(e) => setAvgWaitMin(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', marginTop: 6 }}
                      />
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        A IA irá recalibrar esse tempo automaticamente conforme os atendimentos forem concluídos.
                      </span>
                    </div>

                    <div style={{ 
                      background: '#ecfdf5', 
                      border: '1px solid #a7f3d0', 
                      borderRadius: 12, 
                      padding: '12px 14px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10,
                      fontSize: 12,
                      color: '#065f46'
                    }}>
                      <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                      <span>
                        Seu Totem e QR Code de balcão serão ativados automaticamente com 14 dias de teste grátis.
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(2)}
                        className="btn-ghost"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                      </button>

                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ background: '#10b981' }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Criar Conta & Abrir Painel</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                Já possui cadastro?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Fazer Login
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
