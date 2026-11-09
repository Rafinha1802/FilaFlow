import React, { useState } from 'react';
import {
  User,
  Stethoscope,
  Building2,
  Mail,
  Phone,
  Clock,
  Award,
  Star,
  CheckCircle2,
  Save,
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
  Layers,
  Sliders,
  Calendar,
  Activity
} from 'lucide-react';

export default function ProfessionalProfileView({
  professional = {},
  onUpdateProfessional,
  onGoBack,
  showToast
}) {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(`temfyla_pro_profile_${professional.id || 'default'}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: professional.name || 'Dr. Carlos Mendes',
      email: professional.email || 'dr.carlos@clinicavida.com.br',
      phone: professional.phone || '(11) 98877-6655',
      crm: professional.crm || 'CRM/SP 148.920',
      role: professional.role || 'Médico Oftalmologista',
      specialty: professional.specialty || 'Oftalmologia Clínica & Cirúrgica',
      companyName: professional.companyName || 'Clínica Vida',
      room: professional.room || 'Consultório 04',
      avatar: professional.avatar || '👨‍⚕️',
      workHoursStart: professional.workHoursStart || '08:00',
      workHoursEnd: professional.workHoursEnd || '18:00',
      maxDailyHours: professional.maxDailyHours || 8,
      targetConsultationMinutes: professional.targetConsultationMinutes || 20,
      soundAnnouncement: true,
      voiceAnnouncement: true,
      onWayAlert: true,
      bio: 'Especialista em cirurgia refrativa e diagnóstico precoce de patologias oculares. Atendimento humanizado com suporte a filas inteligentes TemFyla.',
      services: ['Consulta Geral', 'Exame de Refração', 'Fundo de Olho', 'Retorno', 'Avaliação Cirúrgica']
    };
  });

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'schedule' | 'preferences'
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(`temfyla_pro_profile_${professional.id || 'default'}`, JSON.stringify(formData));
    } catch (e) {}

    if (onUpdateProfessional) {
      onUpdateProfessional({
        ...professional,
        ...formData
      });
    }

    setIsSaved(true);
    if (showToast) {
      showToast('✓ Perfil profissional atualizado com sucesso!');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="ff-pro-profile-page" style={{ padding: '24px 20px', maxWidth: 1050, margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          type="button"
          onClick={onGoBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Consultório</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isSaved && (
            <span style={{ fontSize: 13, color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={16} />
              <span>Salvo!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 18px',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
            }}
          >
            <Save size={16} />
            <span>Salvar Perfil</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81 60%, #4338ca)',
        borderRadius: 20,
        padding: '28px 24px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 12px 30px rgba(49, 46, 129, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar Icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 42,
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}>
            {formData.avatar}
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
                {formData.name}
              </h1>
              <span style={{
                background: '#10b981',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <ShieldCheck size={12} />
                <span>{formData.crm}</span>
              </span>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#c7d2fe', fontWeight: 600 }}>
              {formData.role} • {formData.specialty}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#a5b4fc' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={13} />
                <span>{formData.companyName} ({formData.room})</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} />
                <span>{formData.workHoursStart} às {formData.workHoursEnd} ({formData.maxDailyHours}h/dia)</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={13} color="#facc15" fill="#facc15" />
                <span style={{ color: '#fef08a', fontWeight: 700 }}>4.96 (100% Satisfação)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 12,
        marginBottom: 24
      }}>
        {[
          { id: 'general', label: 'Dados Pessoais & Sala', icon: User },
          { id: 'schedule', label: 'Jornada & Consultas', icon: Clock },
          { id: 'preferences', label: 'Áudio & Notificações', icon: Volume2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 12,
                border: isActive ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                background: isActive ? '#f5f3ff' : '#ffffff',
                color: isActive ? '#6d28d9' : '#475569',
                fontSize: 13,
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} color={isActive ? '#7c3aed' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {/* TAB 1: DADOS PESSOAIS & SALA */}
        {activeTab === 'general' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stethoscope size={18} color="#7c3aed" />
              <span>Informações do Profissional</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Dados exibidos nas telas de chamada, prontuário express e no aplicativo dos pacientes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Registro de Classe (CRM / CRO / CRP)
                </label>
                <input
                  type="text"
                  value={formData.crm}
                  onChange={(e) => handleChange('crm', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Especialidade / Cargo
                </label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Consultório / Sala Atribuída
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Telefone / WhatsApp Comercial
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Biografia / Apresentação Clínica
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Ícone / Avatar
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['👨‍⚕️', '👩‍⚕️', '🩺', '⚕️', '🔬', '🦷', '👨‍💼', '👩‍💼'].map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => handleChange('avatar', av)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      border: formData.avatar === av ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      background: formData.avatar === av ? '#f5f3ff' : '#ffffff',
                      fontSize: 22,
                      cursor: 'pointer'
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: JORNADA & CONSULTAS */}
        {activeTab === 'schedule' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#7c3aed" />
              <span>Jornada de Atendimento & Duração Média</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Parâmetros usados pela IA para calcular o tempo estimado de espera de cada paciente na fila.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={formData.workHoursStart}
                  onChange={(e) => handleChange('workHoursStart', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Horário de Término
                </label>
                <input
                  type="time"
                  value={formData.workHoursEnd}
                  onChange={(e) => handleChange('workHoursEnd', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Carga Máxima de Atendimento
                </label>
                <div style={{ display: 'flex', alignItems: 'center', height: 42, background: '#f8fafc', borderRadius: 8, border: '1.5px solid #cbd5e1', padding: '0 6px', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => handleChange('maxDailyHours', Math.max(2, formData.maxDailyHours - 1))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
                  >
                    -
                  </button>
                  <strong style={{ fontSize: 14, color: '#7c3aed' }}>{formData.maxDailyHours} horas/dia</strong>
                  <button
                    type="button"
                    onClick={() => handleChange('maxDailyHours', Math.min(14, formData.maxDailyHours + 1))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Meta de Tempo por Consulta
                </label>
                <div style={{ display: 'flex', alignItems: 'center', height: 42, background: '#f8fafc', borderRadius: 8, border: '1.5px solid #cbd5e1', padding: '0 6px', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => handleChange('targetConsultationMinutes', Math.max(5, formData.targetConsultationMinutes - 5))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
                  >
                    -
                  </button>
                  <strong style={{ fontSize: 14, color: '#7c3aed' }}>{formData.targetConsultationMinutes} minutos</strong>
                  <button
                    type="button"
                    onClick={() => handleChange('targetConsultationMinutes', Math.min(90, formData.targetConsultationMinutes + 5))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Capacity Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              borderRadius: 12,
              padding: '14px 18px',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="#059669" />
                <span style={{ fontSize: 13, color: '#065f46', fontWeight: 700 }}>
                  Capacidade Preditiva: ~{Math.floor((formData.maxDailyHours * 60) / formData.targetConsultationMinutes)} consultas/turno
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#047857', fontWeight: 700 }}>
                Calibração IA: Ativa
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: ÁUDIO & PREFERÊNCIAS */}
        {activeTab === 'preferences' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Volume2 size={18} color="#7c3aed" />
              <span>Preferências de Chamada & Áudio</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Controle como os pacientes são anunciados no saguão ao clicar em "Chamar Próximo".
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
              <div style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Gongo Sonoro de Notificação</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Toca sino sonoro sintetizado ao chamar o próximo paciente</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.soundAnnouncement}
                  onChange={(e) => handleChange('soundAnnouncement', e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: '#7c3aed', cursor: 'pointer' }}
                />
              </div>

              <div style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Chamada por Voz Sintetizada em Português</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Anuncia: "Senha número X, favor comparecer ao Consultório 04"</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.voiceAnnouncement}
                  onChange={(e) => handleChange('voiceAnnouncement', e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: '#7c3aed', cursor: 'pointer' }}
                />
              </div>

              <div style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ fontSize: 13.5, color: '#0f172a', display: 'block' }}>Alerta de Paciente "A Caminho"</strong>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Avisa no consultório quando o paciente aciona o botão no celular</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.onWayAlert}
                  onChange={(e) => handleChange('onWayAlert', e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: '#10b981', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12
        }}>
          <button
            type="button"
            onClick={onGoBack}
            style={{
              padding: '11px 20px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={{
              padding: '11px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Save size={16} />
            <span>Salvar Alterações do Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
}
