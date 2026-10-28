import React, { useState } from 'react';
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { getStoredProfessionals, loginProfessional } from '../../services/authService';
import BrandLogo from '../Common/BrandLogo';

export default function ProfessionalAuth({
  onLoginSuccess,
  onBackToSite,
  onGoToCompanyLogin,
  onGoToClient
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register_autonomous'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Autonomous Pro Registration State
  const [autoName, setAutoName] = useState('');
  const [autoEmail, setAutoEmail] = useState('');
  const [autoPassword, setAutoPassword] = useState('');
  const [autoSpecialty, setAutoSpecialty] = useState('Clínica Geral & Diagnóstico');
  const [autoRoom, setAutoRoom] = useState('Consultório Particular 01');
  const [autoMaxHours, setAutoMaxHours] = useState(6);
  const [autoAvgMinutes, setAutoAvgMinutes] = useState(20);

  // Load all registered professionals (both mock and created dynamically by companies)
  const registeredPros = getStoredProfessionals();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    const result = loginProfessional(email, password);
    if (result.success) {
      setSuccessMessage(`Bem-vindo(a) de volta, ${result.professional.name}!`);
      setTimeout(() => {
        onLoginSuccess(result.professional);
      }, 400);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterAutonomousSubmit = (e) => {
    e.preventDefault();
    if (!autoEmail || !autoName) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newAutoPro = {
      id: 'pro-auto-' + Date.now(),
      name: autoName.trim(),
      email: autoEmail.trim().toLowerCase(),
      password: autoPassword || '123456',
      role: autoSpecialty,
      specialty: autoSpecialty,
      category: 'Clínica',
      companyName: 'Consultório Autônomo',
      unitName: 'Unidade Própria',
      room: autoRoom || 'Consultório 01',
      avatar: autoName.toLowerCase().includes('dra') ? '👩‍⚕️' : '👨‍⚕️',
      crm: 'Registro Ativo',
      maxDailyHours: Number(autoMaxHours) || 6,
      workHoursStart: '08:00',
      workHoursEnd: '18:00',
      targetConsultationMinutes: Number(autoAvgMinutes) || 20,
      currentTicket: {
        ticket: '#01',
        name: 'Primeiro Paciente',
        service: autoSpecialty,
        age: '30 anos',
        convenio: 'Particular',
        timeJoined: '09:00',
        room: autoRoom || 'Consultório 01',
        status: 'attending',
        clientOnWay: true,
        notes: 'Consultório autônomo iniciado com sucesso.'
      },
      waitingList: [
        {
          ticket: '#02',
          name: 'Paciente em Espera',
          service: autoSpecialty,
          time: '~15 min',
          isPriority: false,
          status: 'saguao',
          phone: '(11) 98765-4321',
          priorityReason: null
        }
      ],
      historyToday: []
    };

    // Save to storage
    const currentList = getStoredProfessionals();
    const updated = [newAutoPro, ...currentList.filter(p => p.email.toLowerCase() !== newAutoPro.email.toLowerCase())];
    try {
      localStorage.setItem('filaflow_professionals_v1', JSON.stringify(updated));
    } catch (e) {}

    setSuccessMessage('Consultório criado com sucesso! Abrindo ambiente de atendimento...');
    setTimeout(() => {
      onLoginSuccess(newAutoPro);
    }, 500);
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
          onClick={onGoToCompanyLogin} 
          className="ff-auth-nav-link"
          style={{ borderColor: 'rgba(124, 58, 237, 0.4)', background: 'rgba(124, 58, 237, 0.15)', color: '#ddd6fe' }}
          title="Ir para o login da Empresa / Gestão"
        >
          <Building2 size={15} />
          <span>Sou Gestor de Empresa</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="ff-auth-main-container">
        <div className="ff-auth-card">
          {/* Header Tabs */}
          <div className="ff-auth-tabs">
            <button
              className={`ff-auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
              }}
            >
              <Stethoscope size={16} />
              <span>Login do Profissional</span>
            </button>

            <button
              className={`ff-auth-tab-btn ${activeTab === 'register_autonomous' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('register_autonomous');
                setErrorMessage('');
              }}
            >
              <User size={16} />
              <span>Consultório Autônomo</span>
              <span className="ff-tab-badge">Novo</span>
            </button>
          </div>

          <div className="ff-auth-content-pane">
            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <>
                <div className="ff-auth-header-text">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
                    <Stethoscope size={13} />
                    <span>CONSULTÓRIO & SALA DE ATENDIMENTO</span>
                  </div>
                  <h1 className="ff-auth-title">Acesso do Profissional</h1>
                  <p className="ff-auth-subtitle">
                    Digite o <strong>e-mail corporativo cadastrado pela empresa</strong> para gerenciar suas chamadas, cronômetro inteligente e fila de pacientes.
                  </p>
                </div>

                {errorMessage && (
                  <div className="ff-auth-alert-box error">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="ff-auth-alert-box success">
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="ff-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="ff-form-group">
                    <label className="ff-form-label">E-mail Cadastrado pela Empresa *</label>
                    <div className="ff-input-wrapper">
                      <Mail size={16} className="ff-input-icon" />
                      <input
                        type="email"
                        className="ff-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@empresa.com.br"
                        required
                      />
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Utilize o e-mail cadastrado pelo administrador da sua empresa.
                    </span>
                  </div>

                  <div className="ff-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="ff-form-label">Senha de Acesso *</label>
                    </div>
                    <div className="ff-input-wrapper">
                      <Lock size={16} className="ff-input-icon" />
                      <input
                        type="password"
                        className="ff-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '13px', 
                      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                      marginTop: 4
                    }}
                  >
                    <span>Entrar no Consultório Digital</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#64748b' }}>
                  É gestor ou dono de estabelecimento?{' '}
                  <button
                    type="button"
                    onClick={onGoToCompanyLogin}
                    style={{ color: '#7c3aed', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    Acessar Painel da Empresa
                  </button>
                </div>
              </>
            )}

            {/* TAB 2: AUTONOMOUS REGISTRATION */}
            {activeTab === 'register_autonomous' && (
              <>
                <div className="ff-auth-header-text">
                  <h1 className="ff-auth-title">Cadastro de Consultório Próprio</h1>
                  <p className="ff-auth-subtitle">
                    Atende por conta própria sem empresa vinculada? Cadastre seu consultório individual com limite de horas e agenda em 1 minuto.
                  </p>
                </div>

                {errorMessage && (
                  <div className="ff-auth-alert-box error">
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="ff-auth-alert-box success">
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{successMessage}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterAutonomousSubmit} className="ff-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="ff-form-group">
                    <label className="ff-form-label">Nome Completo do Profissional *</label>
                    <div className="ff-input-wrapper">
                      <User size={16} className="ff-input-icon" />
                      <input
                        type="text"
                        className="ff-input"
                        value={autoName}
                        onChange={(e) => setAutoName(e.target.value)}
                        placeholder="Ex: Dr. Lucas Medeiros"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">E-mail Profissional *</label>
                      <div className="ff-input-wrapper">
                        <Mail size={16} className="ff-input-icon" />
                        <input
                          type="email"
                          className="ff-input"
                          value={autoEmail}
                          onChange={(e) => setAutoEmail(e.target.value)}
                          placeholder="lucas@consultorio.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Senha *</label>
                      <div className="ff-input-wrapper">
                        <Lock size={16} className="ff-input-icon" />
                        <input
                          type="password"
                          className="ff-input"
                          value={autoPassword}
                          onChange={(e) => setAutoPassword(e.target.value)}
                          placeholder="Mínimo 6 dígitos"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="ff-form-group">
                      <label className="ff-form-label">Especialidade / Cargo</label>
                      <input
                        type="text"
                        className="ff-input"
                        value={autoSpecialty}
                        onChange={(e) => setAutoSpecialty(e.target.value)}
                        placeholder="Ex: Cardiologia"
                        style={{ paddingLeft: 12 }}
                      />
                    </div>

                    <div className="ff-form-group">
                      <label className="ff-form-label">Nome da Sala / Consultório</label>
                      <input
                        type="text"
                        className="ff-input"
                        value={autoRoom}
                        onChange={(e) => setAutoRoom(e.target.value)}
                        placeholder="Ex: Consultório 01"
                        style={{ paddingLeft: 12 }}
                      />
                    </div>
                  </div>

                  {/* Schedule & Limits */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px', marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Clock size={16} color="#7c3aed" />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#334155' }}>
                        Limites de Atendimento & Horários
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>Máximo Diário em Atendimento:</span>
                          <strong style={{ color: '#7c3aed' }}>{autoMaxHours} horas/dia</strong>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="12"
                          value={autoMaxHours}
                          onChange={(e) => setAutoMaxHours(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#7c3aed' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#64748b' }}>Duração Média Prevista:</span>
                          <strong style={{ color: '#7c3aed' }}>{autoAvgMinutes} minutos</strong>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="5"
                          value={autoAvgMinutes}
                          onChange={(e) => setAutoAvgMinutes(Number(e.target.value))}
                          style={{ width: '100%', accentColor: '#7c3aed' }}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      justifyContent: 'center', 
                      padding: '13px', 
                      background: '#10b981', 
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                      marginTop: 8
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Concluir Cadastro & Abrir Consultório</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
