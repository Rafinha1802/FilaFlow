import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import BrandLogo from '../Common/BrandLogo';

export default function CompanyLogin({
  onLoginSuccess,
  onGoToSignup,
  onCancel
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onLoginSuccess({
      companyName: 'Minha Empresa',
      unitName: 'Unidade Principal',
      attendantName: email.split('@')[0],
      category: 'Clínica'
    });
  };

  return (
    <div className="ff-auth-page">
      <div className="ff-login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <BrandLogo size={42} textColor="#0f172a" />
        </div>

        <div className="ff-login-header">
          <h2 className="ff-login-title">Acessar Painel da Empresa</h2>
          <p className="ff-login-desc">
            Controle suas filas em tempo real, chame senhas e acompanhe métricas de atendimento.
          </p>
        </div>

        <form className="ff-form" onSubmit={handleSubmit}>
          <div className="ff-form-group">
            <label className="ff-form-label">E-mail Corporativo</label>
            <div className="ff-input-wrapper">
              <Mail size={16} className="ff-input-icon" />
              <input
                type="email"
                className="ff-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atendimento@suaempresa.com"
                required
              />
            </div>
          </div>

          <div className="ff-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="ff-form-label">Senha</label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Utilize o link de recuperação enviado ao seu e-mail corporativo cadastrado.'); }} 
                style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}
              >
                Esqueceu?
              </a>
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

          <button type="submit" className="ff-btn-submit" style={{ background: '#7c3aed' }}>
            <span>Entrar no Painel Operacional</span>
            <ArrowRight size={16} style={{ display: 'inline', marginLeft: 6 }} />
          </button>
        </form>

        <div className="ff-login-divider"></div>

        {/* Demo Fast Login */}
        <button
          type="button"
          className="ff-login-alt-btn"
          onClick={handleDemoLogin}
          style={{
            borderColor: '#ddd6fe',
            color: '#6d28d9',
            background: '#faf5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid #ddd6fe',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700
          }}
        >
          <Sparkles size={16} />
          <span>Acesso Rápido Demo: Clínica Vida</span>
        </button>

        <div style={{ marginTop: 20, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
          Sua empresa ainda não usa o TemFyla?{' '}
          <button
            onClick={onGoToSignup}
            style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cadastrar Gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
}
