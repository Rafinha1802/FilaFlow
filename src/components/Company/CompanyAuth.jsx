import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  User, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  CreditCard,
  Users,
  Stethoscope,
  Briefcase
} from 'lucide-react';
import { loginCompany, setPendingCompanyRegistration } from '../../services/authService';
import BrandLogo from '../Common/BrandLogo';

export default function CompanyAuth({
  initialTab = 'login',
  onLoginSuccess,
  onGoToCheckout,
  onGoToProfessionalLogin,
  onBackToSite,
  onGoToClient
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [registerStep, setRegisterStep] = useState(1); // 1: Empresa & Admin, 2: Profissionais & Horários, 3: Resumo & Pagamento

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register Step 1: Empresa & Responsável
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [category, setCategory] = useState('Clínica');
  const [unitName, setUnitName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminName, setAdminName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');

  // Register Step 2: Lista de Profissionais da Empresa (inicia vazia para cadastro real)
  const [professionalsList, setProfessionalsList] = useState([]);

  // Form para adicionar novo profissional
  const [newProName, setNewProName] = useState('');
  const [newProEmail, setNewProEmail] = useState('');
  const [newProPassword, setNewProPassword] = useState('');
  const [newProSpecialty, setNewProSpecialty] = useState('');
  const [newProRoom, setNewProRoom] = useState('');
  const [newProMaxHours, setNewProMaxHours] = useState(8);
  const [newProStart, setNewProStart] = useState('08:00');
  const [newProEnd, setNewProEnd] = useState('18:00');
  const [newProAvgMinutes, setNewProAvgMinutes] = useState(20);
  const [proAddError, setProAddError] = useState('');

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

  // Login handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const res = loginCompany(loginEmail, loginPassword);
    if (res.success) {
      setLoginSuccess(`Bem-vindo ao Painel da ${res.company.companyName}!`);
      setTimeout(() => {
        onLoginSuccess(res.company);
      }, 400);
    } else {
      setLoginError(res.message);
    }
  };

  // Adicionar profissional à lista da empresa
  const handleAddProfessional = (e) => {
    e.preventDefault();
    setProAddError('');

    if (!newProName.trim()) {
      setProAddError('Informe o nome do profissional.');
      return;
    }
    if (!newProEmail.trim() || !newProEmail.includes('@')) {
      setProAddError('Informe um e-mail válido para o profissional conseguir se logar no sistema.');
      return;
    }

    // Verifica se já existe um profissional com esse e-mail na lista
    const alreadyExists = professionalsList.some(
      p => p.email.toLowerCase() === newProEmail.trim().toLowerCase()
    );
    if (alreadyExists) {
      setProAddError('Já existe um profissional cadastrado com este e-mail nesta equipe.');
      return;
    }

    const proToAdd = {
      id: 'pro-temp-' + Date.now(),
      name: newProName.trim(),
      email: newProEmail.trim().toLowerCase(),
      password: newProPassword.trim() || '123456',
      specialty: newProSpecialty.trim() || 'Atendimento Geral',
      room: newProRoom.trim() || `Consultório 0${professionalsList.length + 1}`,
      avatar: newProName.toLowerCase().includes('dra') ? '👩‍⚕️' : '👨‍⚕️',
      maxDailyHours: Number(newProMaxHours) || 8,
      workHoursStart: newProStart || '08:00',
      workHoursEnd: newProEnd || '18:00',
      breakTime: '12:00 às 13:00',
      targetConsultationMinutes: Number(newProAvgMinutes) || 20
    };

    setProfessionalsList([...professionalsList, proToAdd]);

    // Limpa os campos
    setNewProName('');
    setNewProEmail('');
    setNewProPassword('');
    setNewProSpecialty('');
    setNewProRoom('');
  };

  const handleRemovePro = (proId) => {
    setProfessionalsList(professionalsList.filter(p => p.id !== proId));
  };

  // Ao finalizar o cadastro: navega direto para a área de pagamento!
  const handleProceedToPayment = () => {
    if (professionalsList.length === 0) {
      alert('Por favor, cadastre ao menos 1 profissional que atenderá seus clientes.');
      setRegisterStep(2);
      return;
    }

    const pendingData = {
      companyData: {
        companyName,
        cnpj,
        unitName,
        category,
        phone,
        adminName,
        email: companyEmail,
        password: companyPassword,
        attendantName: professionalsList[0]?.name || adminName,
        room: professionalsList[0]?.room || 'Consultório 01'
      },
      professionalsList
    };

    // Salva estado pendente
    setPendingCompanyRegistration(pendingData);

    // Redireciona imediatamente para o Checkout / Área de Pagamento!
    if (onGoToCheckout) {
      onGoToCheckout(pendingData);
    }
  };

  return (
    <div className="ff-auth-layout">
      {/* Top Bar */}
      <header className="ff-auth-topbar">
        <button 
          onClick={onBackToSite} 
          className="ff-auth-nav-link"
          title="Retornar à página inicial"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Site</span>
        </button>

        <div className="ff-auth-logo-center" onClick={onBackToSite} style={{ cursor: 'pointer' }}>
          <BrandLogo size={36} textColor="#ffffff" />
        </div>

        <button 
          onClick={onGoToProfessionalLogin} 
          className="ff-auth-nav-link"
          style={{ borderColor: 'rgba(124, 58, 237, 0.4)', background: 'rgba(124, 58, 237, 0.15)', color: '#ddd6fe' }}
          title="Ir para o login do Profissional / Consultório"
        >
          <Stethoscope size={15} />
          <span>Sou Profissional</span>
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
              <Building2 size={16} />
              <span>Entrar como Empresa</span>
            </button>

            <button
              className={`ff-auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <Briefcase size={16} />
              <span>Cadastrar Empresa</span>
            </button>
          </div>

          {/* TAB 1: LOGIN DA EMPRESA */}
          {activeTab === 'login' && (
            <div className="ff-auth-content-pane">
              <div className="ff-auth-header-text">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', color: '#7c3aed', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
                  <Building2 size={13} />
                  <span>PAINEL ADMINISTRATIVO & OPERACIONAL</span>
                </div>
                <h1 className="ff-auth-title">Acessar Painel da Empresa</h1>
                <p className="ff-auth-subtitle">
                  Controle suas filas em tempo real, chame senhas de balcão e gerencie a equipe de profissionais.
                </p>
              </div>

              {loginError && (
                <div className="ff-auth-alert-box error">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="ff-auth-alert-box success">
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{loginSuccess}</span>
                </div>
              )}

              {/* Standard Login Form */}
              <form onSubmit={handleLoginSubmit} className="ff-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                      onClick={(e) => { e.preventDefault(); alert('Para redefinir sua senha, entre em contato com o suporte ou utilize o link de recuperação enviado ao e-mail cadastrado.'); }}
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
                Sua empresa ainda não utiliza o TemFyla?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
                >
                  Cadastre-se Agora
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CADASTRO COMPLETO DA EMPRESA (COM PROFISSIONAIS & PAGAMENTO) */}
          {activeTab === 'register' && (
            <div className="ff-auth-content-pane">
              {/* Stepper Header */}
              <div className="ff-register-stepper">
                <div 
                  className={`ff-reg-step ${registerStep >= 1 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(1)}
                >
                  <span className="step-num">1</span>
                  <span className="step-label">Empresa</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 2 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(2)}
                >
                  <span className="step-num">2</span>
                  <span className="step-label">Profissionais & Horários</span>
                </div>
                <div className="step-line" />
                <div 
                  className={`ff-reg-step ${registerStep >= 3 ? 'active' : ''}`}
                  onClick={() => setRegisterStep(3)}
                >
                  <span className="step-num">3</span>
                  <span className="step-label">Planos & Pagamento</span>
                </div>
              </div>

              {/* STEP 1: DADOS DA EMPRESA & RESPONSÁVEL */}
              {registerStep === 1 && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Passo 1: Dados do Estabelecimento</h2>
                    <p style={{ fontSize: 12.5, color: '#64748b' }}>Informe os dados da sua empresa e o responsável administrativo.</p>
                  </div>

                  <div className="ff-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">Nome Fantasia do Estabelecimento *</label>
                      <div className="ff-input-wrapper">
                        <Building2 size={16} className="ff-input-icon" />
                        <input
                          type="text"
                          className="ff-input"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex: Clínica Saúde Total, Dom Bistrô, etc."
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="ff-form-group">
                        <label className="ff-form-label">CNPJ ou CPF *</label>
                        <input
                          type="text"
                          className="ff-input"
                          value={cnpj}
                          onChange={(e) => setCnpj(e.target.value)}
                          placeholder="00.000.000/0001-00"
                          style={{ paddingLeft: 12 }}
                          required
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="ff-form-group">
                        <label className="ff-form-label">Nome do Responsável *</label>
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="ff-form-group">
                        <label className="ff-form-label">E-mail do Administrador *</label>
                        <div className="ff-input-wrapper">
                          <Mail size={16} className="ff-input-icon" />
                          <input
                            type="email"
                            className="ff-input"
                            value={companyEmail}
                            onChange={(e) => setCompanyEmail(e.target.value)}
                            placeholder="gestao@empresa.com"
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
                            placeholder="Mínimo 8 dígitos"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!companyName || !companyEmail) {
                            alert('Preencha os campos obrigatórios da empresa.');
                            return;
                          }
                          setRegisterStep(2);
                        }}
                        className="btn-primary"
                        style={{ background: '#7c3aed' }}
                      >
                        <span>Próximo: Cadastrar Profissionais</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: CADASTRO DOS PROFISSIONAIS DA EMPRESA & HORÁRIOS MÁXIMOS */}
              {registerStep === 2 && (
                <div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f2fe', color: '#0369a1', padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 800, marginBottom: 6 }}>
                      <Users size={13} />
                      <span>EQUIPE DE ATENDIMENTO DA EMPRESA</span>
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                      Passo 2: Cadastrar Profissionais & Limite de Horários
                    </h2>
                    <p style={{ fontSize: 12.5, color: '#64748b' }}>
                      Adicione os profissionais que atenderão seus clientes. <strong>O e-mail cadastrado aqui será usado pelo profissional para se logar no sistema.</strong>
                    </p>
                  </div>

                  {/* Lista de Profissionais Já Adicionados */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                        Profissionais Adicionados ({professionalsList.length})
                      </span>
                      <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                        {professionalsList.length === 0 ? 'Nenhum profissional ainda' : 'Prontos para login'}
                      </span>
                    </div>

                    {professionalsList.length === 0 ? (
                      <div style={{ padding: '16px', background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: 12, textAlign: 'center', color: '#64748b', fontSize: 12.5 }}>
                        Nenhum profissional adicionado. Preencha o formulário abaixo para adicionar o primeiro membro da equipe.
                      </div>
                    ) : (
                      <div className="ff-team-cards-list">
                        {professionalsList.map((pro) => (
                          <div key={pro.id} className="ff-team-pro-card">
                            <span className="ff-team-pro-avatar">{pro.avatar || '👨‍⚕️'}</span>
                            <div className="ff-team-pro-content">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ff-team-pro-name">{pro.name}</span>
                                <span style={{ fontSize: 11, color: '#64748b', background: '#e2e8f0', padding: '1px 6px', borderRadius: 4 }}>
                                  {pro.room || 'Consultório'}
                                </span>
                              </div>
                              <span className="ff-team-pro-role">{pro.specialty}</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                <span className="ff-team-pro-email-tag" title="Este e-mail é utilizado no login do profissional">
                                  <Mail size={11} />
                                  <span>Login: <strong>{pro.email}</strong></span>
                                </span>
                                <span className="ff-team-pro-hours-tag">
                                  <Clock size={11} />
                                  <span>Máx: <strong>{pro.maxDailyHours}h/dia</strong> ({pro.workHoursStart} - {pro.workHoursEnd})</span>
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePro(pro.id)}
                              className="ff-btn-remove-pro"
                              title="Remover profissional"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formulário para Adicionar Novo Profissional */}
                  <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <Plus size={16} color="#c026d3" />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#86198f' }}>
                        Adicionar Novo Profissional à Equipe
                      </span>
                    </div>

                    {proAddError && (
                      <div className="ff-auth-alert-box error" style={{ padding: '8px 12px', marginBottom: 10 }}>
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        <span>{proAddError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div className="ff-form-group">
                          <label className="ff-form-label">Nome Completo *</label>
                          <input
                            type="text"
                            className="ff-input"
                            value={newProName}
                            onChange={(e) => setNewProName(e.target.value)}
                            placeholder="Ex: Dr. André Ribeiro"
                            style={{ paddingLeft: 12 }}
                          />
                        </div>

                        <div className="ff-form-group">
                          <label className="ff-form-label">E-mail do Profissional (Para Login) *</label>
                          <input
                            type="email"
                            className="ff-input"
                            value={newProEmail}
                            onChange={(e) => setNewProEmail(e.target.value)}
                            placeholder="andre@suaempresa.com"
                            style={{ paddingLeft: 12 }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        <div className="ff-form-group">
                          <label className="ff-form-label">Especialidade / Cargo</label>
                          <input
                            type="text"
                            className="ff-input"
                            value={newProSpecialty}
                            onChange={(e) => setNewProSpecialty(e.target.value)}
                            placeholder="Ex: Oftalmologia"
                            style={{ paddingLeft: 12 }}
                          />
                        </div>

                        <div className="ff-form-group">
                          <label className="ff-form-label">Sala / Consultório</label>
                          <input
                            type="text"
                            className="ff-input"
                            value={newProRoom}
                            onChange={(e) => setNewProRoom(e.target.value)}
                            placeholder="Ex: Consultório 03"
                            style={{ paddingLeft: 12 }}
                          />
                        </div>

                        <div className="ff-form-group">
                          <label className="ff-form-label">Senha de Acesso</label>
                          <input
                            type="password"
                            className="ff-input"
                            value={newProPassword}
                            onChange={(e) => setNewProPassword(e.target.value)}
                            placeholder="Padrão: 123456"
                            style={{ paddingLeft: 12 }}
                          />
                        </div>
                      </div>

                      {/* Configuração de Horários & Limite Máximo de Atendimento */}
                      <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <Clock size={15} color="#7c3aed" />
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#4c1d95' }}>
                            Limite Máximo de Atendimento & Turno
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                              <span style={{ color: '#475569' }}>Carga Máxima de Atendimento:</span>
                              <strong style={{ color: '#7c3aed' }}>{newProMaxHours} horas / dia</strong>
                            </div>
                            <input
                              type="range"
                              min="2"
                              max="12"
                              value={newProMaxHours}
                              onChange={(e) => setNewProMaxHours(Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#7c3aed' }}
                            />
                            <span style={{ fontSize: 10.5, color: '#64748b' }}>
                              A IA recalcula o limite de senhas para evitar estresse e sobrecarga.
                            </span>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                              <span style={{ color: '#475569' }}>Tempo Médio por Consulta:</span>
                              <strong style={{ color: '#7c3aed' }}>{newProAvgMinutes} min</strong>
                            </div>
                            <input
                              type="range"
                              min="5"
                              max="60"
                              step="5"
                              value={newProAvgMinutes}
                              onChange={(e) => setNewProAvgMinutes(Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#7c3aed' }}
                            />
                            <span style={{ fontSize: 10.5, color: '#64748b' }}>
                              Janela prevista por atendimento.
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Início do Turno</label>
                            <input
                              type="time"
                              className="ff-input"
                              value={newProStart}
                              onChange={(e) => setNewProStart(e.target.value)}
                              style={{ padding: '6px 10px', fontSize: 12 }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Término do Turno</label>
                            <input
                              type="time"
                              className="ff-input"
                              value={newProEnd}
                              onChange={(e) => setNewProEnd(e.target.value)}
                              style={{ padding: '6px 10px', fontSize: 12 }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddProfessional}
                        className="btn-primary"
                        style={{
                          background: '#a21caf',
                          boxShadow: '0 4px 12px rgba(162, 28, 175, 0.3)',
                          padding: '10px 16px',
                          fontSize: 13,
                          justifyContent: 'center',
                          gap: 8
                        }}
                      >
                        <Plus size={16} />
                        <span>Adicionar Profissional à Lista</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
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
                        if (professionalsList.length === 0) {
                          alert('Por favor, adicione pelo menos 1 profissional à equipe.');
                          return;
                        }
                        setRegisterStep(3);
                      }}
                      className="btn-primary"
                      style={{ background: '#7c3aed' }}
                    >
                      <span>Próximo: Escolha de Planos & Pagamento</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: RESUMO & REDIRECIONAMENTO IMEDIATO PARA O CHECKOUT / PAGAMENTO */}
              {registerStep === 3 && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#065f46', padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 800, marginBottom: 6 }}>
                      <CheckCircle2 size={13} />
                      <span>CADASTRO CONCLUÍDO COM SUCESSO</span>
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                      Passo 3: Finalizar Contratação & Pagamento
                    </h2>
                    <p style={{ fontSize: 12.5, color: '#64748b' }}>
                      Seu estabelecimento e equipe de profissionais foram configurados. Agora selecione seu plano na área segura de pagamento para ativar o sistema.
                    </p>
                  </div>

                  {/* Resumo da Empresa e Equipe */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div className="ff-logo-mark" style={{ width: 36, height: 36 }}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{companyName}</h3>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          {unitName} • {category} • CNPJ: {cnpj}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: '#334155' }}>
                          Equipe de Profissionais ({professionalsList.length}):
                        </span>
                        <span style={{ fontSize: 11, color: '#059669', fontWeight: 700, background: '#ecfdf5', padding: '2px 8px', borderRadius: 999 }}>
                          ✓ E-mails de login prontos
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {professionalsList.map((pro, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #f1f5f9', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span>{pro.avatar || '👨‍⚕️'}</span>
                              <strong style={{ color: '#1e293b' }}>{pro.name}</strong>
                              <span style={{ color: '#64748b' }}>({pro.specialty})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: '#0284c7', fontWeight: 600 }}>{pro.email}</span>
                              <span style={{ color: '#7c3aed', fontWeight: 700 }}>• Máx: {pro.maxDailyHours}h</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Banner de Garantia */}
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#1e40af', marginBottom: 18 }}>
                    <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                    <span>
                      <strong>Ativação Imediata & Segura:</strong> Seus consultórios e profissionais são configurados com suporte 24/7, garantia de estabilidade e emissão de nota fiscal.
                    </span>
                  </div>

                  {/* Botão de Avanço para Pagamento */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setRegisterStep(2)}
                      className="btn-ghost"
                      style={{ border: '1px solid #e2e8f0' }}
                    >
                      <ArrowLeft size={16} />
                      <span>Voltar aos Profissionais</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                        padding: '12px 22px',
                        fontSize: 14,
                        fontWeight: 800
                      }}
                    >
                      <CreditCard size={18} />
                      <span>Avançar para Escolha de Planos & Pagamento</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                Já possui cadastro da sua empresa?{' '}
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
