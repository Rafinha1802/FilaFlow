import React, { useState } from 'react';
import { X, Sparkles, Building2, Clock, CheckCircle2, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function PreCheckinModal({
  isOpen,
  business,
  onClose,
  onConfirmCheckin
}) {
  const [userName, setUserName] = useState('Rafael Silva');
  const [userPhone, setUserPhone] = useState('(11) 98765-4321');
  const [document, setDocument] = useState('123.456.789-00');
  const [insuranceName, setInsuranceName] = useState('Unimed');
  const [cardNumber, setCardNumber] = useState('0048.2910.4431');
  const [selectedService, setSelectedService] = useState('');
  const [isPriority, setIsPriority] = useState(false);

  if (!isOpen || !business) return null;

  const services = business.services || [
    'Consulta Oftalmologia Geral',
    'Exame de Fundo de Olho',
    'Retorno de Consulta',
    'Avaliação Cirúrgica'
  ];

  const insuranceOptions = [
    'Unimed',
    'Bradesco Saúde',
    'Amil',
    'SulAmérica',
    'NotreDame Intermédica',
    'Porto Seguro Saúde',
    'Particular / Sem Convênio'
  ];

  const currentService = selectedService || services[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmCheckin({
      business,
      serviceName: currentService,
      userName: userName.trim() || 'Você',
      userPhone,
      document,
      insuranceName,
      cardNumber: insuranceName.includes('Particular') ? 'Particular' : cardNumber,
      isPriority
    });
  };

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div 
        className="ff-modal-dialog" 
        style={{ maxWidth: 480, width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ff-modal-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ 
                fontSize: 10, 
                fontWeight: 800, 
                color: '#7c3aed', 
                textTransform: 'uppercase',
                background: '#ede9fe',
                padding: '2px 8px',
                borderRadius: 999
              }}>
                Etapa 1 de 2 • Recepção
              </span>
            </div>
            <h3 className="ff-modal-title" style={{ marginTop: 4 }}>
              Check-in de Chegada • {business.companyName}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: '#64748b', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 22px 24px' }}>
          {/* Flow explanation alert */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1.5px solid #a7f3d0',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: '#065f46', lineHeight: 1.45 }}>
              <strong style={{ display: 'block', color: '#047857', marginBottom: 2 }}>
                Como funciona a sua entrada:
              </strong>
              Ao confirmar, você entra na <strong>Fila de Espera da Recepção</strong>. A equipe fará a conferência do seu convênio/documento e aprovará sua transferência direta para a <strong>Fila do Médico</strong>.
            </div>
          </div>

          <div className="ff-form" style={{ gap: 14 }}>
            {/* Service selection */}
            <div className="ff-form-group">
              <label className="ff-form-label">Procedimento ou Consulta *</label>
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
              <label className="ff-form-label">Nome Completo do Paciente *</label>
              <input
                type="text"
                className="ff-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ex: Rafael Silva"
                style={{ paddingLeft: 12 }}
                required
              />
            </div>

            {/* CPF & WhatsApp in 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ff-form-group">
                <label className="ff-form-label">CPF / Documento *</label>
                <input
                  type="text"
                  className="ff-input"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="000.000.000-00"
                  style={{ paddingLeft: 12 }}
                  required
                />
              </div>

              <div className="ff-form-group">
                <label className="ff-form-label">WhatsApp de Aviso *</label>
                <input
                  type="tel"
                  className="ff-input"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  style={{ paddingLeft: 12 }}
                  required
                />
              </div>
            </div>

            {/* Insurance & Card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="ff-form-group">
                <label className="ff-form-label">Convênio / Plano *</label>
                <select
                  className="ff-input"
                  value={insuranceName}
                  onChange={(e) => setInsuranceName(e.target.value)}
                  style={{ paddingLeft: 12 }}
                >
                  {insuranceOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="ff-form-group">
                <label className="ff-form-label">
                  {insuranceName.includes('Particular') ? 'Modalidade' : 'Nº da Carteirinha *'}
                </label>
                <input
                  type="text"
                  className="ff-input"
                  disabled={insuranceName.includes('Particular')}
                  value={insuranceName.includes('Particular') ? 'Atendimento Particular' : cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000.0000.0000"
                  style={{ paddingLeft: 12 }}
                  required={!insuranceName.includes('Particular')}
                />
              </div>
            </div>

            {/* Priority Checkbox */}
            <div style={{ 
              background: isPriority ? '#fef2f2' : '#f8fafc', 
              border: isPriority ? '1.5px solid #fecaca' : '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '10px 12px',
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
                style={{ width: 17, height: 17, accentColor: '#ef4444', marginTop: 2, cursor: 'pointer' }}
                onClick={(e) => e.stopPropagation()}
              />
              <div>
                <label 
                  htmlFor="checkPriority" 
                  style={{ fontSize: 12, fontWeight: 700, color: isPriority ? '#991b1b' : '#334155', cursor: 'pointer' }}
                >
                  Atendimento Preferencial por Lei
                </label>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>
                  60+ anos, gestantes, pessoas com deficiência ou autismo.
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
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                marginTop: 6,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
              }}
            >
              <UserCheck size={16} />
              <span>Entrar na Fila de Espera da Recepção</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
