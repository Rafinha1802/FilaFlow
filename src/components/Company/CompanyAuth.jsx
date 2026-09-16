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

import { REGISTERED_PROFESSIONALS } from '../../data/mockData';

export default function CompanyAuth({
  initialTab = 'login',
  initialRole = 'company', // 'company' | 'professional'
  onLoginSuccess,
  onProfessionalLoginSuccess,
  onRegisterSuccess,
  onBackToLanding,
  onGoToClient
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [loginRole, setLoginRole] = useState(initialRole || 'company'); // 'company' | 'professional'
  const [registerStep, setRegisterStep] = useState(1); // 1: Conta, 2: Empresa, 3: Fila

  // Login Form State (Company)
  const [loginEmail, setLoginEmail] = useState('atendimento@clinicavida.com.br');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Professional Login State
  const [proEmail, setProEmail] = useState('dr.carlos@clinicavida.com.br');
  const [proPassword, setProPassword] = useState('••••••••');

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

  const handleProfessionalLoginSubmit = (e) => {
    e.preventDefault();
    const found = REGISTERED_PROFESSIONALS.find(
      p => p.email.toLowerCase() === proEmail.trim().toLowerCase()
    );

    if (found) {
      onProfessionalLoginSuccess(found);
    } else {
      // Create flexible dynamic professional with entered email
      const dynamicPro = {
        id: 'pro-dynamic-' + Date.now(),
        email: proEmail.trim(),
        name: proEmail.split('@')[0].replace('.', ' ').toUpperCase(),
        role: 'Profissional / Atendente',
        specialty: 'Atendimento Especializado',
        category: 'Clínica',
        companyName: 'Centro de Atendimento',
        unitName: 'Unidade Principal',
        room: 'Consultório 01',
        avatar: '👨‍⚕️',
        crm: 'Registro Ativo',
        targetConsultationMinutes: 20,
        currentTicket: {
          ticket: '#30',
          name: 'Paciente Demonstração',
          service: 'Consulta / Atendimento',
          age: '30 anos',
          convenio: 'Particular',
          timeJoined: '14:00',
          room: 'Consultório 01',
          status: 'attending',
          clientOnWay: true,
          notes: ''
        },
        waitingList: [
          { ticket: '#31', name: 'Ana Beatriz Lima', service: 'Consulta Especializada', time: '~12 min', isPriority: true, status: 'saguao', phone: '(11) 98765-4321', priorityReason: 'Gestante' },
          { ticket: '#32', name: 'Marcos Vinicius', service: 'Retorno de Consulta', time: '~25 min', isPriority: false, status: 'a_caminho', phone: '(11) 91234-5678', priorityReason: null }
        ],
        historyToday: [
          { ticket: '#29', name: 'Carlos Eduardo', service: 'Atendimento Inicial', duration: '17m 30s', completedAt: '13:45' }
        ]
      };
      onProfessionalLoginSuccess(dynamicPro);
    }
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

  const handleFastDemoProfessional = (pro) => {
    onProfessionalLoginSuccess(pro);
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
              {/* Role Switcher: Profissional vs Gestor da Empresa */}
              <div className="ff-login-role-switch">
                <button
                  type="button"
                  className={`ff-role-btn ${loginRole === 'professional' ? 'active' : ''}`}
                  onClick={() => setLoginRole('professional')}
                >
                  <span className="role-icon">🩺</span>
                  <div className="role-text-box">
                    <span className="role-title">Sou Profissional</span>
                    <span className="role-sub">Médico, Dentista, Chef, etc.</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`ff-role-btn ${loginRole === 'company' ? 'active' : ''}`}
                  onClick={() => setLoginRole('company')}
                >
                  <span className="role-icon">💼</span>
                  <div className="role-text-box">
                    <span className="role-title">Gestor da Empresa</span>
                    <span className="role-sub">Painel B2B / Admin</span>
                  </div>
                </button>
              </div>

              {loginRole === 'professional' ? (
                <>
                  <div className="ff-auth-header-text">
                    <h1 className="ff-auth-title">Acesso do Profissional / Consultório</h1>
                    <p className="ff-auth-subtitle">
                      Digite o <strong>e-mail corporativo cadastrado pela empresa</strong> para gerenciar suas consultas, cronômetro e chamar seus pacientes.
                    </p>
                  </div>

                  {/* Fast 1-Click Demo for Professionals */}
                  <div className="ff-fast-demo-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Sparkles size={16} color="#7c3aed" />
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Perfis de Demonstração (Acesso Imediato em 1 Clique)
                      </span>
                    </div>
                    <div className="ff-pro-demo-pills">
                      {REGISTERED_PROFESSIONALS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="ff-pro-demo-pill"
                          onClick={() => handleFastDemoProfessional(p)}
                        >
                          <span className="pro-emoji">{p.avatar}</span>
                          <div className="pro-info">
                            <span className="pro-name">{p.name}</span>
                            <span className="pro-unit">{p.companyName} • {p.room}</span>
                          </div>
                          <ArrowRight size={13} className="pro-arr" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ff-auth-divider">
                    <span>ou digite seu e-mail cadastrado</span>
                  </div>

                  {/* Professional Form */}
                  <form onSubmit={handleProfessionalLoginSubmit} className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">E-mail Cadastrado pela Empresa</label>
                      <div className="ff-input-wrapper">
                        <Mail size={16} className="ff-input-icon" />
                        <input
                          type="email"
                          className="ff-input"
                          value={proEmail}
                          onChange={(e) => setProEmail(e.target.value)}
                          placeholder="ex: dr.carlos@clinicavida.com.br"
                          required
                        />
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        Dica: use qualquer e-mail dos profissionais acima ou o seu e-mail cadastrado.
                      </span>
                    </div>

                    <div className="ff-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="ff-form-label">Senha de Acesso</label>
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          ✓ Acesso rápido liberado
                        </span>
                      </div>
                      <div className="ff-input-wrapper">
                        <Lock size={16} className="ff-input-icon" />
                        <input
                          type="password"
                          className="ff-input"
                          value={proPassword}
                          onChange={(e) => setProPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ width: '100%', justifyContent: 'center', padding: '13px', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)' }}
                    >
                      <span>Entrar no Consultório Digital</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </>
              ) : (
                <>
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
                      <span>Acessar Demo: Clínica Vida (Gestão)</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="ff-auth-divider">
                    <span>ou acesse com seu e-mail corporativo</span>
                  </div>

                  {/* Standard Login Form */}
                  <form onSubmit={handleLoginSubmit} className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">E-mail Corporativo do Administrador</label>
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
                </>
              )}

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
