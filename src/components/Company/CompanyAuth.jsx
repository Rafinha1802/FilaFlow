import React, { useState } from 'react';
import { 
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
  ShieldCheck,
  Plus,
  Trash2,
  Stethoscope,
  Briefcase,
  KeyRound,
  Users
} from 'lucide-react';

import { REGISTERED_PROFESSIONALS } from '../../data/mockData';

export default function CompanyAuth({
  initialTab = 'login',
  initialRole = 'company', // 'company' | 'professional'
  onLoginSuccess,
  onProfessionalLoginSuccess,
  onRegisterSuccess,
  onBackToLanding,
  onGoToClient,
  registeredProfessionals = REGISTERED_PROFESSIONALS
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [loginRole, setLoginRole] = useState(initialRole || 'company'); // 'company' | 'professional'
  const [registerStep, setRegisterStep] = useState(1); // 1: Conta, 2: Empresa, 3: Profissionais & Acesso, 4: Fila & IA

  // Login Form State (Company)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Professional Login State
  const [proEmail, setProEmail] = useState('');
  const [proPassword, setProPassword] = useState('');
  const [proLoginError, setProLoginError] = useState('');

  // Register Form State - Step 1: Conta
  const [adminName, setAdminName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  
  // Step 2: Empresa
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [category, setCategory] = useState('Clínica');
  const [unitName, setUnitName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 3: Profissionais da Equipe (com E-mail individual de acesso para cada um)
  const [registeredProfessionalsList, setRegisteredProfessionalsList] = useState([
    {
      id: 'pro-init-1',
      name: 'Dr. Carlos Mendes',
      email: 'dr.carlos@clinicavida.com.br',
      password: '123',
      role: 'Médico Oftalmologista',
      specialty: 'Oftalmologia Clínica',
      crm: 'CRM/SP 148.920',
      room: 'Consultório 04',
      avatar: '👨‍⚕️',
      targetConsultationMinutes: 20
    }
  ]);

  // Form para adicionar outro profissional
  const [newProName, setNewProName] = useState('');
  const [newProEmail, setNewProEmail] = useState('');
  const [newProPassword, setNewProPassword] = useState('123456');
  const [newProSpecialty, setNewProSpecialty] = useState('Clínica Geral');
  const [newProCrm, setNewProCrm] = useState('');
  const [newProRoom, setNewProRoom] = useState('Consultório 02');
  const [newProMinutes, setNewProMinutes] = useState(15);
  const [isAddingProFormVisible, setIsAddingProFormVisible] = useState(false);
  const [proFormError, setProFormError] = useState('');

  // Step 4: Fila Inicial & IA
  const [queueName, setQueueName] = useState('Consultório Principal - Triagem & Atendimento');
  const [selectedPrimaryProId, setSelectedPrimaryProId] = useState('');
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

  // ==========================================
  // Handlers de Login
  // ==========================================
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Por favor, informe seu e-mail corporativo.');
      return;
    }

    onLoginSuccess({
      companyName: companyName || 'Clínica Vida',
      unitName: unitName || 'Unidade Centro',
      attendantName: adminName || 'Administrador',
      category: category || 'Clínica',
      room: 'Consultório 04',
      email: loginEmail.trim().toLowerCase()
    });
  };

  const handleProfessionalLoginSubmit = (e) => {
    e.preventDefault();
    setProLoginError('');
    if (!proEmail.trim()) {
      setProLoginError('Por favor, informe seu e-mail de profissional.');
      return;
    }

    const cleanEmail = proEmail.trim().toLowerCase();
    
    // Procura em todos os profissionais cadastrados
    const allPros = registeredProfessionals && registeredProfessionals.length > 0 
      ? registeredProfessionals 
      : REGISTERED_PROFESSIONALS;

    const found = allPros.find(
      p => p.email.toLowerCase() === cleanEmail
    );

    if (found) {
      onProfessionalLoginSuccess(found);
    } else {
      // Cria profissional dinâmico caso seja um e-mail válido para não travar demonstrações
      const nameFromEmail = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = nameFromEmail
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const dynamicPro = {
        id: 'pro-user-' + Date.now(),
        email: cleanEmail,
        name: `Dr(a). ${formattedName}`,
        role: 'Profissional / Atendente',
        specialty: 'Atendimento Clínico Especializado',
        category: 'Clínica',
        companyName: companyName || 'Clínica & Centro de Atendimento',
        unitName: unitName || 'Unidade Principal',
        room: 'Consultório 01',
        avatar: '🩺',
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
          { ticket: '#31', name: 'Ana Beatriz Lima', service: 'Consulta Especializada', time: '~10 min', isPriority: true, status: 'saguao', phone: '(11) 98765-4321', priorityReason: 'Gestante' },
          { ticket: '#32', name: 'Marcos Vinicius', service: 'Retorno de Consulta', time: '~22 min', isPriority: false, status: 'a_caminho', phone: '(11) 91234-5678', priorityReason: null }
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

  // ==========================================
  // Handlers de Cadastro e Equipe
  // ==========================================
  const handleAddNewProfessional = (e) => {
    e.preventDefault();
    setProFormError('');

    if (!newProName.trim()) {
      setProFormError('Informe o nome completo do profissional.');
      return;
    }
    if (!newProEmail.trim() || !newProEmail.includes('@')) {
      setProFormError('Informe um e-mail válido para o acesso do profissional.');
      return;
    }

    const emailClean = newProEmail.trim().toLowerCase();
    if (registeredProfessionalsList.some(p => p.email.toLowerCase() === emailClean)) {
      setProFormError('Já existe um profissional cadastrado com este e-mail.');
      return;
    }

    const avatars = ['👨‍⚕️', '👩‍⚕️', '🩺', '👨‍💼', '👩‍💼'];
    const chosenAvatar = avatars[registeredProfessionalsList.length % avatars.length];

    const newPro = {
      id: 'pro-' + Date.now(),
      name: newProName.trim(),
      email: emailClean,
      password: newProPassword || '123456',
      role: newProSpecialty || 'Especialista',
      specialty: newProSpecialty || 'Atendimento Geral',
      crm: newProCrm.trim() || 'Registro Ativo',
      room: newProRoom.trim() || `Consultório 0${registeredProfessionalsList.length + 1}`,
      avatar: chosenAvatar,
      targetConsultationMinutes: Number(newProMinutes) || 15,
      companyName: companyName || 'Sua Empresa',
      unitName: unitName || 'Unidade Principal',
      waitingList: [],
      historyToday: [],
      currentTicket: null
    };

    setRegisteredProfessionalsList(prev => [...prev, newPro]);
    setNewProName('');
    setNewProEmail('');
    setNewProPassword('123456');
    setNewProCrm('');
    setNewProRoom(`Consultório 0${registeredProfessionalsList.length + 2}`);
    setIsAddingProFormVisible(false);
  };

  const handleRemoveProfessional = (id) => {
    if (registeredProfessionalsList.length <= 1) {
      alert('É necessário manter pelo menos 1 profissional cadastrado para sua empresa.');
      return;
    }
    setRegisteredProfessionalsList(prev => prev.filter(p => p.id !== id));
  };

  const handleFillDemoRegister = () => {
    setAdminName('Dr. Carlos Mendes');
    setCompanyEmail('gestao@clinicavida.com.br');
    setCompanyPassword('SenhaSegura123!');
    setCompanyName('Clínica Vida');
    setCnpj('28.749.123/0001-44');
    setUnitName('Unidade Centro');
    setCategory('Clínica');
    setPhone('(11) 98765-4321');
    setQueueName('Consultório 04 - Oftalmologia Geral');
    setAvgWaitMin(20);

    setRegisteredProfessionalsList([
      {
        id: 'pro-carlos',
        name: 'Dr. Carlos Mendes',
        email: 'dr.carlos@clinicavida.com.br',
        password: '123',
        role: 'Médico Oftalmologista',
        specialty: 'Oftalmologia Clínica & Cirúrgica',
        crm: 'CRM/SP 148.920',
        room: 'Consultório 04',
        avatar: '👨‍⚕️',
        targetConsultationMinutes: 20
      },
      {
        id: 'pro-beatriz',
        name: 'Dra. Beatriz Santos',
        email: 'dra.beatriz@novocentro.com.br',
        password: '123',
        role: 'Clínica Geral & Triagem',
        specialty: 'Medicina da Família & Check-up',
        crm: 'CRM/SP 192.340',
        room: 'Consultório 01',
        avatar: '👩‍⚕️',
        targetConsultationMinutes: 15
      }
    ]);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registeredProfessionalsList.length === 0) {
      alert('Por favor, adicione ao menos um profissional com e-mail para continuar.');
      setRegisterStep(3);
      return;
    }

    const primaryPro = registeredProfessionalsList[0];

    onRegisterSuccess({
      companyName: companyName || 'Minha Empresa',
      unitName: unitName || 'Unidade Principal',
      category: category || 'Clínica',
      cnpj,
      phone,
      adminName: adminName || primaryPro.name,
      email: companyEmail || primaryPro.email,
      attendantName: primaryPro.name,
      queueName: queueName || primaryPro.room,
      avgWaitMin,
      professionals: registeredProfessionalsList,
      room: primaryPro.room
    });
  };

  const allAvailableDemoPros = registeredProfessionals && registeredProfessionals.length > 0
    ? registeredProfessionals
    : REGISTERED_PROFESSIONALS;

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
          <div className="ff-logo-mark" style={{ width: 36, height: 36 }}>
            <img src="/temfyla-icon.png" alt="TemFyla Logo" className="ff-logo-img" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit' }}>
            Tem<span style={{ color: '#7c3aed' }}>Fyla</span>
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
        <div className="ff-auth-card" style={{ maxWidth: activeTab === 'register' ? 620 : 520 }}>
          {/* Tabs: Entrar vs Cadastrar */}
          <div className="ff-auth-tabs">
            <button
              className={`ff-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              <KeyRound size={16} />
              <span>Entrar na Conta</span>
            </button>

            <button
              className={`ff-auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <Building2 size={16} />
              <span>Cadastrar Empresa</span>
              <span className="ff-tab-badge">Grátis 14 dias</span>
            </button>
          </div>

          {/* =========================================================
              TAB 1: LOGIN (PROFISSIONAL OU GESTOR)
              ========================================================= */}
          {activeTab === 'login' && (
            <div className="ff-auth-content-pane">
              {/* Role Switcher: Profissional vs Gestor da Empresa */}
              <div className="ff-login-role-switch">
                <button
                  type="button"
                  className={`ff-role-btn ${loginRole === 'professional' ? 'active' : ''}`}
                  onClick={() => {
                    setLoginRole('professional');
                    setLoginError('');
                    setProLoginError('');
                  }}
                >
                  <span className="role-icon">🩺</span>
                  <div className="role-text-box">
                    <span className="role-title">Sou Profissional</span>
                    <span className="role-sub">Médico, Dentista, Especialista</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`ff-role-btn ${loginRole === 'company' ? 'active' : ''}`}
                  onClick={() => {
                    setLoginRole('company');
                    setLoginError('');
                    setProLoginError('');
                  }}
                >
                  <span className="role-icon">💼</span>
                  <div className="role-text-box">
                    <span className="role-title">Gestor da Empresa</span>
                    <span className="role-sub">Painel Administrativo / B2B</span>
                  </div>
                </button>
              </div>

              {loginRole === 'professional' ? (
                <>
                  <div className="ff-auth-header-text">
                    <h1 className="ff-auth-title">Área do Profissional</h1>
                    <p className="ff-auth-subtitle">
                      Digite seu <strong>e-mail corporativo cadastrado</strong> para gerenciar suas consultas, cronômetro de atendimento e chamar pacientes.
                    </p>
                  </div>

                  {/* Fast 1-Click Demo Pills for Professionals */}
                  <div className="ff-fast-demo-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Sparkles size={16} color="#7c3aed" />
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Acesso Rápido para Teste (1 Clique)
                      </span>
                    </div>
                    <div className="ff-pro-demo-pills">
                      {allAvailableDemoPros.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="ff-pro-demo-pill"
                          onClick={() => handleFastDemoProfessional(p)}
                          title={`Entrar diretamente como ${p.name}`}
                        >
                          <span className="pro-emoji">{p.avatar || '🩺'}</span>
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
                    <span>ou acesse com seu e-mail</span>
                  </div>

                  {proLoginError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
                      {proLoginError}
                    </div>
                  )}

                  {/* Professional Form */}
                  <form onSubmit={handleProfessionalLoginSubmit} className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">E-mail Cadastrado pela Empresa *</label>
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
                      <span style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>
                        Utilize o e-mail cadastrado pelo administrador da sua clínica/empresa.
                      </span>
                    </div>

                    <div className="ff-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="ff-form-label">Senha de Acesso</label>
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                          ✓ Acesso com senha ou código
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
                      <Stethoscope size={16} />
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
                      Faça login para controlar suas filas, chamar senhas, cadastrar sua equipe e acompanhar métricas em tempo real.
                    </p>
                  </div>

                  {/* Fast 1-Click Demo Login */}
                  <div className="ff-fast-demo-box">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Sparkles size={16} color="#7c3aed" />
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Acesso Demonstrativo Rápido (1 Clique)
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                      Quer testar o sistema? Entre imediatamente como gestor da <strong>Clínica Vida</strong>.
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

                  {loginError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14 }}>
                      {loginError}
                    </div>
                  )}

                  {/* Standard Login Form */}
                  <form onSubmit={handleLoginSubmit} className="ff-form" style={{ gap: 16 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">E-mail Corporativo do Administrador *</label>
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
                        <label className="ff-form-label">Senha de Acesso</label>
                        <a 
                          href="#esqueceu" 
                          onClick={(e) => { e.preventDefault(); alert('Em ambiente de demonstração, utilize o botão "Acessar Demo" para entrar imediatamente sem senha.'); }}
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
                Sua empresa ainda não utiliza o TemFyla?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegisterStep(1);
                  }}
                  style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  Cadastre-se Gratuitamente
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 2: CADASTRO COMPLETO DA EMPRESA & PROFISSIONAIS
              ========================================================= */}
          {activeTab === 'register' && (
            <div className="ff-auth-content-pane">
              {/* Stepper Header (4 Etapas) */}
              <div className="ff-register-stepper">
                <div 
                  className={`ff-reg-step ${registerStep >= 1 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(1)}
                  title="Etapa 1: Conta do Administrador"
                >
                  <span className="step-num">1</span>
                  <span className="step-label">Conta</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 2 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(2)}
                  title="Etapa 2: Dados da Empresa"
                >
                  <span className="step-num">2</span>
                  <span className="step-label">Empresa</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 3 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(3)}
                  title="Etapa 3: Equipe & Profissionais"
                >
                  <span className="step-num">3</span>
                  <span className="step-label">Equipe</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 4 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(4)}
                  title="Etapa 4: Fila Inicial & IA"
                >
                  <span className="step-num">4</span>
                  <span className="step-label">Ativação</span>
                </div>
              </div>

              {/* Demo auto-fill helper */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={handleFillDemoRegister}
                  className="ff-btn-autofill"
                  title="Preencher com dados de exemplo completos"
                >
                  <Sparkles size={13} />
                  <span>Preencher dados de exemplo</span>
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                {/* ----------------------------------------------------
                    ETAPA 1: CONTA DO GESTOR
                    ---------------------------------------------------- */}
                {registerStep === 1 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div style={{ marginBottom: 4 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>1. Conta do Administrador</h2>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Crie o acesso do responsável principal pela empresa.</p>
                    </div>

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
                      <label className="ff-form-label">E-mail Profissional do Gestor *</label>
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
                      <label className="ff-form-label">Criar Senha de Administrador *</label>
                      <div className="ff-input-wrapper">
                        <Lock size={16} className="ff-input-icon" />
                        <input
                          type="password"
                          className="ff-input"
                          value={companyPassword}
                          onChange={(e) => setCompanyPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!adminName.trim() || !companyEmail.trim()) {
                            alert('Por favor, informe seu nome e e-mail.');
                            return;
                          }
                          setRegisterStep(2);
                        }}
                        className="btn-primary"
                        style={{ background: '#7c3aed' }}
                      >
                        <span>Próximo: Dados da Empresa</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------
                    ETAPA 2: DADOS DA EMPRESA
                    ---------------------------------------------------- */}
                {registerStep === 2 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div style={{ marginBottom: 4 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>2. Dados da Empresa</h2>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Informações públicas exibidas no check-in dos clientes.</p>
                    </div>

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
                      <label className="ff-form-label">WhatsApp de Contato para Suporte</label>
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
                        onClick={() => {
                          if (!companyName.trim()) {
                            alert('Por favor, informe o nome da sua empresa.');
                            return;
                          }
                          setRegisterStep(3);
                        }}
                        className="btn-primary"
                        style={{ background: '#7c3aed' }}
                      >
                        <span>Próximo: Cadastrar Equipe</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------
                    ETAPA 3: EQUIPE DE PROFISSIONAIS & E-MAIL DE ACESSO
                    (Funcionalidade melhorada solicitada pelo usuário!)
                    ---------------------------------------------------- */}
                {registerStep === 3 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🩺</span>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          3. Equipe de Profissionais & Acesso ao Site
                        </h2>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.45 }}>
                        Cadastre os médicos ou especialistas que atenderão as senhas. 
                        <strong> Cada um terá um e-mail próprio para fazer login na "Área do Profissional".</strong>
                      </p>
                    </div>

                    {/* Lista de Profissionais Já Adicionados */}
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <label className="ff-form-label" style={{ margin: 0 }}>
                          Profissionais Cadastrados ({registeredProfessionalsList.length})
                        </label>
                        <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                          ✓ Acessos prontos para o consultório
                        </span>
                      </div>

                      <div className="ff-pro-register-list">
                        {registeredProfessionalsList.map((pro, idx) => (
                          <div key={pro.id || idx} className="ff-pro-register-card">
                            <div className="ff-pro-card-avatar">
                              {pro.avatar || '🩺'}
                            </div>

                            <div className="ff-pro-card-info">
                              <div className="ff-pro-card-top">
                                <span className="ff-pro-card-name">{pro.name}</span>
                                <span className="ff-pro-card-room">{pro.room}</span>
                                {pro.crm && <span style={{ fontSize: 11, color: '#64748b' }}>({pro.crm})</span>}
                              </div>

                              <div>
                                <span className="ff-pro-card-email-badge" title="E-mail que o profissional usará para entrar">
                                  <Mail size={12} />
                                  <span>Login: {pro.email}</span>
                                </span>
                              </div>

                              <div className="ff-pro-card-meta">
                                <span>{pro.specialty || pro.role} • Tempo médio: {pro.targetConsultationMinutes || 15} min</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveProfessional(pro.id)}
                              className="ff-pro-card-del-btn"
                              title="Remover profissional"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Formulário Expansível para Cadastrar Novo Profissional */}
                    {!isAddingProFormVisible ? (
                      <button
                        type="button"
                        onClick={() => setIsAddingProFormVisible(true)}
                        className="ff-btn-toggle-add-pro"
                      >
                        <Plus size={16} />
                        <span>+ Adicionar Outro Profissional com E-mail</span>
                      </button>
                    ) : (
                      <div className="ff-add-pro-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Stethoscope size={16} color="#7c3aed" />
                            <strong style={{ fontSize: 14, color: '#0f172a' }}>Novo Profissional da Equipe</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddingProFormVisible(false)}
                            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Cancelar
                          </button>
                        </div>

                        {proFormError && (
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
                            {proFormError}
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                          <div>
                            <label className="ff-form-label">Nome Completo do Profissional *</label>
                            <input
                              type="text"
                              className="ff-input"
                              value={newProName}
                              onChange={(e) => setNewProName(e.target.value)}
                              placeholder="Ex: Dra. Mariana Alencar"
                              style={{ paddingLeft: 12, fontSize: 13 }}
                            />
                          </div>

                          {/* Campo crucial de E-MAIL para acesso do profissional */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <label className="ff-form-label">E-mail para Acesso à Área do Profissional *</label>
                              <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>
                                🔑 Usado para Login
                              </span>
                            </div>
                            <div className="ff-input-wrapper">
                              <Mail size={15} className="ff-input-icon" />
                              <input
                                type="email"
                                className="ff-input"
                                value={newProEmail}
                                onChange={(e) => setNewProEmail(e.target.value)}
                                placeholder="mariana.alencar@suaempresa.com.br"
                                style={{ fontSize: 13 }}
                              />
                            </div>
                            <span style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                              O profissional usará este e-mail para acessar o seu consultório e chamar senhas no site.
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                              <label className="ff-form-label">Especialidade / Cargo</label>
                              <input
                                type="text"
                                className="ff-input"
                                value={newProSpecialty}
                                onChange={(e) => setNewProSpecialty(e.target.value)}
                                placeholder="Ex: Oftalmologia, Dentista"
                                style={{ paddingLeft: 12, fontSize: 13 }}
                              />
                            </div>

                            <div>
                              <label className="ff-form-label">CRM / Registro (Opcional)</label>
                              <input
                                type="text"
                                className="ff-input"
                                value={newProCrm}
                                onChange={(e) => setNewProCrm(e.target.value)}
                                placeholder="Ex: CRM/SP 148.920"
                                style={{ paddingLeft: 12, fontSize: 13 }}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                              <label className="ff-form-label">Sala ou Consultório</label>
                              <input
                                type="text"
                                className="ff-input"
                                value={newProRoom}
                                onChange={(e) => setNewProRoom(e.target.value)}
                                placeholder="Ex: Consultório 02"
                                style={{ paddingLeft: 12, fontSize: 13 }}
                              />
                            </div>

                            <div>
                              <label className="ff-form-label">Senha Inicial</label>
                              <input
                                type="text"
                                className="ff-input"
                                value={newProPassword}
                                onChange={(e) => setNewProPassword(e.target.value)}
                                placeholder="123456"
                                style={{ paddingLeft: 12, fontSize: 13 }}
                              />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label className="ff-form-label">Tempo Médio Estimado</label>
                              <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 13 }}>
                                {newProMinutes} min
                              </span>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="60"
                              step="5"
                              value={newProMinutes}
                              onChange={(e) => setNewProMinutes(Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleAddNewProfessional}
                            className="btn-primary"
                            style={{ background: '#7c3aed', width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13, marginTop: 4 }}
                          >
                            <Plus size={15} />
                            <span>Confirmar e Salvar Profissional na Equipe</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
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
                        type="button"
                        onClick={() => {
                          if (registeredProfessionalsList.length === 0) {
                            alert('Por favor, cadastre ao menos um profissional com e-mail.');
                            return;
                          }
                          setRegisterStep(4);
                        }}
                        className="btn-primary"
                        style={{ background: '#7c3aed' }}
                      >
                        <span>Próximo: Ativação & Fila</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------
                    ETAPA 4: FILA PRINCIPAL, IA & ATIVAÇÃO
                    ---------------------------------------------------- */}
                {registerStep === 4 && (
                  <div className="ff-form" style={{ gap: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>4. Ativação da Fila & IA</h2>
                      <p style={{ fontSize: 13, color: '#64748b' }}>Configure seu primeiro ponto de atendimento e finalize o cadastro.</p>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Identificação da Fila Principal de Atendimento *</label>
                      <input
                        type="text"
                        className="ff-input"
                        value={queueName}
                        onChange={(e) => setQueueName(e.target.value)}
                        placeholder="Ex: Consultório 01, Triagem & Consulta"
                        style={{ paddingLeft: 12 }}
                        required
                      />
                    </div>

                    <div className="ff-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="ff-form-label">Ritmo de Atendimento Previsto pela IA</label>
                        <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: 15 }}>
                          {avgWaitMin} min
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={avgWaitMin}
                        onChange={(e) => setAvgWaitMin(Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', marginTop: 6 }}
                      />
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        A IA recalcula dinamicamente os tempos dos pacientes com base nos atendimentos ao vivo.
                      </span>
                    </div>

                    {/* Resumo da Equipe Pronta para Acessar */}
                    <div style={{ 
                      background: '#f8fafc', 
                      border: '1.5px solid #e2e8f0', 
                      borderRadius: 14, 
                      padding: '14px 16px' 
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>
                        <Users size={16} color="#7c3aed" />
                        <span>Resumo da sua Equipe Pronta:</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {registeredProfessionalsList.map((p, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span><strong>{p.name}</strong> ({p.room})</span>
                            <span style={{ color: '#6d28d9', fontWeight: 600 }}>{p.email}</span>
                          </div>
                        ))}
                      </div>
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
                        Seu Totem, QR Code e os acessos individuais dos {registeredProfessionalsList.length} profissionais serão ativados imediatamente.
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(3)}
                        className="btn-ghost"
                        style={{ border: '1px solid #e2e8f0' }}
                      >
                        <ArrowLeft size={16} />
                        <span>Voltar</span>
                      </button>

                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ background: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Concluir Cadastro & Abrir Painel</span>
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
                  style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
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
