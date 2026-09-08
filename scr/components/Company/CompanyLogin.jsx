import React, { useState } from 'react';
import { Layers, Mail, Lock, ArrowRight, Sparkles, Building2 } from 'lucide-react';

export default function CompanyLogin({
  onLoginSuccess,
  onGoToSignup,
  onCancel
}) {
  const [email, setEmail] = useState('atendimento@clinicavida.com.br');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess({
      companyName: 'Clínica Vida',
      unitName: 'Unidade Centro',
      attendantName: 'Dr. Carlos Mendes',
      category: 'Clínica'
    });
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      companyName: 'Clínica Vida',
      unitName: 'Unidade Centro',
      attendantName: 'Dr. Carlos Mendes',
      category: 'Clínica'
    });
  };

  return (
    <div className="ff-auth-page">
      <div className="ff-login-card">
        <div className="ff-logo-mark" style={{ width: 44, height: 44, margin: '0 auto' }}>
          <Layers size={24} />
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
              <a href="#forgot" style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
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
                placeholder="••••••••"
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
            gap: 8
          }}
        >
          <Sparkles size={16} />
          <span>Acesso Rápido Demo: Clínica Vida</span>
        </button>

        <div style={{ marginTop: 20, fontSize: 13, color: '#64748b' }}>
          Sua empresa ainda não usa o FilaFlow?{' '}
          <button
            onClick={onGoToSignup}
            style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'underline' }}
          >
            Cadastrar Gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
}
