import React, { useState } from 'react';
import { X, User, Phone, FileText, CreditCard, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function ReceptionDeskModal({ isOpen, onClose, onAddPatient }) {
  const [patientName, setPatientName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [insuranceName, setInsuranceName] = useState('Unimed');
  const [cardNumber, setCardNumber] = useState('');
  const [procedure, setProcedure] = useState('Consulta Oftalmologia Geral');
  const [isPriority, setIsPriority] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;

    onAddPatient({
      patient_name: patientName,
      document,
      phone,
      insurance_name: insuranceName,
      card_number: cardNumber,
      procedure,
      is_priority: isPriority,
      notes
    });

    // Reset
    setPatientName('');
    setDocument('');
    setPhone('');
    setCardNumber('');
    setNotes('');
    setIsPriority(false);
    onClose();
  };

  const insuranceOptions = [
    'Unimed',
    'Bradesco Saúde',
    'Amil',
    'SulAmérica',
    'NotreDame Intermédica',
    'Porto Seguro Saúde',
    'Cassi',
    'Particular / Reembolso'
  ];

  return (
    <div className="ff-modal-backdrop" onClick={onClose}>
      <div 
        className="ff-modal-card" 
        style={{ maxWidth: 540, width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Entrada na Recepção / Convênio
              </h3>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Cadastre o paciente na lista de espera para validação e autorização do plano.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Nome Completo do Paciente *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Ex: Roberto Albuquerque"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                CPF / Documento
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="000.000.000-00"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Convênio / Plano de Saúde
              </label>
              <select
                value={insuranceName}
                onChange={(e) => setInsuranceName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  background: 'white',
                  boxSizing: 'border-box'
                }}
              >
                {insuranceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Número da Carteirinha
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Ex: 0048.2910.4431"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Procedimento / Tipo de Consulta
            </label>
            <input
              type="text"
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="Ex: Consulta Oftalmologia Geral"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Observações / Informações de Balcão
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paciente aguarda no lounge principal"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <input
              type="checkbox"
              id="pref-check"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
            />
            <label htmlFor="pref-check" style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
              Atendimento Preferencial (Lei Federal / Prioridade de Triagem)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>Inserir na Lista de Espera</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
