import React, { useState } from 'react';
import { X, Sparkles, Building2, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PreCheckinModal({
  isOpen,
  business,
  onClose,
  onConfirmCheckin
}) {
  const [userName, setUserName] = useState('Rafael');
  const [userPhone, setUserPhone] = useState('(11) 98765-4321');
  const [selectedService, setSelectedService] = useState('');
  const [isPriority, setIsPriority] = useState(false);

  if (!isOpen || !business) return null;

  const services = business.services || [
    'Atendimento Geral',
    'Retorno',
    'Avaliação Rápida'
  ];

  const currentService = selectedService || services[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmCheckin({
      business,
      serviceName: currentService,
      userName: userName.trim() || 'Você',
      userPhone,
      isPriority
    });
  };

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div 
        className="ff-modal-dialog" 
        style={{ maxWidth: 460, width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header">
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
              Pré-Check-in Virtual
            </span>
            <h3 className="ff-modal-title" style={{ marginTop: 2 }}>
              {business.companyName}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {/* Quick info banner */}
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)',
            border: '1.5px solid #dbeafe',
            borderRadius: 14,
            padding: '12px 16px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1e3a8a' }}>
                {business.unitName}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {business.category} • Atendente: {business.attendantName || 'Equipe de Plantão'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309' }}>
                Previsão IA
              </div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#b45309' }}>
                ~{business.avgWait || '20 min'}
              </div>
            </div>
          </div>

          <div className="ff-form" style={{ gap: 16 }}>
            {/* Service selection */}
            <div className="ff-form-group">
              <label className="ff-form-label">Selecione o Serviço / Procedimento *</label>
              <select
                className="ff-input"
                value={currentService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ paddingLeft: 12 }}
              >
                {services.map((srv, idx) => (
                  <option key={idx} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            {/* User Name */}
            <div className="ff-form-group">
              <label className="ff-form-label">Seu Nome *</label>
              <input
                type="text"
                className="ff-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Como prefere ser chamado"
                style={{ paddingLeft: 12 }}
                required
              />
            </div>

            {/* WhatsApp */}
            <div className="ff-form-group">
              <label className="ff-form-label">WhatsApp (para receber aviso de chamada)</label>
              <input
                type="tel"
                className="ff-input"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                style={{ paddingLeft: 12 }}
              />
            </div>

            {/* Priority Checkbox */}
            <div style={{ 
              background: isPriority ? '#fef2f2' : '#f8fafc', 
              border: isPriority ? '1.5px solid #fecaca' : '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 12,
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 10,
              cursor: 'pointer'
            }}
            onClick={() => setIsPriority(!isPriority)}
            >
              <input
                type="checkbox"
                id="checkPriority"
                checked={isPriority}
                onChange={(e) => setIsPriority(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#ef4444', marginTop: 2, cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <label 
                  htmlFor="checkPriority" 
                  style={{ fontSize: 13, fontWeight: 700, color: isPriority ? '#991b1b' : '#334155', cursor: 'pointer' }}
                >
                  Atendimento Prioritário por Lei
                </label>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  Lei Federal 10.048: 60+ anos, gestantes, lactantes, pessoas com deficiência ou autismo.
                </p>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px',
                fontSize: 14,
                background: '#7c3aed',
                marginTop: 8
              }}
            >
              <span>Confirmar Entrada na Fila e Gerar Senha</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
