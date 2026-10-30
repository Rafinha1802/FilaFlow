import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Save,
  MessageCircle,
  Sparkles,
  FileText,
  CreditCard,
  Bell,
  ArrowLeft,
  Users,
  Sliders,
  Check,
  Smartphone
} from 'lucide-react';

export default function CompanyProfileView({
  businessData = {},
  onUpdateBusinessData,
  onGoBack,
  showToast
}) {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('temfyla_company_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      companyName: businessData.companyName || 'Clínica Vida Especializada',
      razaoSocial: 'Clínica Médica Vida & Saúde Ltda.',
      cnpj: '28.910.450/0001-82',
      category: businessData.category || 'Clínica Médica',
      unitName: businessData.unitName || 'Unidade Centro - Paulista',
      phone: '(11) 3456-7890',
      whatsapp: '(11) 98765-4321',
      email: 'contato@clinicavida.com.br',
      website: 'https://clinicavida.com.br',
      address: 'Av. Paulista, 1200 - Conjunto 402',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      cep: '01310-100',
      operatingHours: 'Segunda a Sexta: 07:00 às 19:00 • Sábado: 08:00 às 13:00',
      welcomeMessage: 'Bem-vindo à Clínica Vida! Sua senha foi gerada. Acompanhe a chamada pelo painel ou no seu WhatsApp.',
      toleranceMinutes: 10,
      autoWhatsappNotify: true,
      autoPushNotify: true,
      logoEmoji: '🏥',
      planName: 'Profissional I.A.',
      planCycle: 'Anual (5% OFF no PIX)',
      planStatus: 'Ativo • Renovação Automática'
    };
  });

  const [activeSection, setActiveSection] = useState('general'); // 'general' | 'contact' | 'operations' | 'subscription'
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('temfyla_company_profile', JSON.stringify(formData));
    } catch (e) {}

    if (onUpdateBusinessData) {
      onUpdateBusinessData({
        ...businessData,
        companyName: formData.companyName,
        unitName: formData.unitName,
        category: formData.category
      });
    }

    setIsSaved(true);
    if (showToast) {
      showToast('✓ Dados do perfil da empresa salvos com sucesso!');
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestWhatsApp = () => {
    const text = `🔔 *TemFyla Notificações - ${formData.companyName}*\n\n` +
      `Este é um teste de integração de mensageria da empresa para envio automático de senhas e previsão de fila aos clientes.\n` +
      `Status: Conectado e Operando com IA.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    if (showToast) {
      showToast('💬 WhatsApp aberto com mensagem de teste corporativa!');
    }
  };

  return (
    <div className="ff-company-profile-page" style={{ padding: '24px 20px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Top Breadcrumb & Actions */}
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
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Voltar ao Painel</span>
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
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 18px',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Save size={16} />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #2e1065, #4c1d95 60%, #581c87)',
        borderRadius: 20,
        padding: '28px 24px',
        color: '#ffffff',
        marginBottom: 24,
        boxShadow: '0 12px 30px rgba(76, 29, 149, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Logo / Avatar */}
          <div style={{
            width: 76,
            height: 76,
            borderRadius: 20,
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}>
            {formData.logoEmoji}
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
                {formData.companyName}
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
                <span>Empresa Verificada</span>
              </span>
            </div>

            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#e9d5ff', fontWeight: 500 }}>
              {formData.razaoSocial} • CNPJ: {formData.cnpj}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#d8b4fe' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Building2 size={13} />
                <span>{formData.unitName}</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} />
                <span>{formData.city}/{formData.state}</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} color="#facc15" />
                <span style={{ color: '#fef08a', fontWeight: 700 }}>{formData.planName}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 12,
        marginBottom: 24,
        overflowX: 'auto'
      }}>
        {[
          { id: 'general', label: 'Dados Cadastrais', icon: Building2 },
          { id: 'contact', label: 'Canais & Contato', icon: Phone },
          { id: 'operations', label: 'Fila & Atendimento', icon: Sliders },
          { id: 'subscription', label: 'Plano & Faturamento', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
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
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={15} color={isActive ? '#7c3aed' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* FORM SECTIONS */}
      <form onSubmit={handleSubmit}>
        {/* SEÇÃO 1: DADOS CADASTRAIS */}
        {activeSection === 'general' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={18} color="#7c3aed" />
              <span>Identificação da Empresa</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Informações visíveis aos pacientes no totem de autoatendimento e nos comprovantes de fila.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Nome Fantasia (Exibição Pública)
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Razão Social (Contratual)
                </label>
                <input
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => handleChange('razaoSocial', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Segmento / Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5, background: '#fff' }}
                >
                  <option value="Clínica Médica">Clínica Médica & Saúde</option>
                  <option value="Hospital / Pronto Atendimento">Hospital / Pronto Atendimento</option>
                  <option value="Laboratório de Análises">Laboratório de Análises</option>
                  <option value="Odontologia">Odontologia & Estética</option>
                  <option value="Restaurante & Gastronomia">Restaurante & Gastronomia</option>
                  <option value="Varejo & Serviços">Varejo & Serviços</option>
                  <option value="Cartório / Órgão Público">Cartório / Órgão Público</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Ícone / Logo Emoji
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['🏥', '⚕️', '🔬', '🦷', '🏢', '🍽️', '✂️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleChange('logoEmoji', emoji)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        border: formData.logoEmoji === emoji ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        background: formData.logoEmoji === emoji ? '#f5f3ff' : '#ffffff',
                        fontSize: 20,
                        cursor: 'pointer'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Nome da Unidade
                </label>
                <input
                  type="text"
                  value={formData.unitName}
                  onChange={(e) => handleChange('unitName', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 2: CONTATO & CANAIS */}
        {activeSection === 'contact' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={18} color="#059669" />
              <span>Contatos & Comunicação Oficial</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Canais usados para disparo de alertas de fila, WhatsApp aos clientes e suporte.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  WhatsApp Corporativo (Disparos da Fila)
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                  />
                  <button
                    type="button"
                    onClick={handleTestWhatsApp}
                    style={{
                      background: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <MessageCircle size={14} />
                    <span>Testar</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Telefone Fixo / Recepção
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  E-mail Oficial
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
                  Site Oficial
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#7c3aed" />
                <span>Endereço Físico do Estabelecimento</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Logradouro</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Bairro</label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Cidade / UF</label>
                  <input
                    type="text"
                    value={`${formData.city} - ${formData.state}`}
                    onChange={(e) => handleChange('city', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>CEP</label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={(e) => handleChange('cep', e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 3: OPERAÇÃO & FILAS */}
        {activeSection === 'operations' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sliders size={18} color="#7c3aed" />
              <span>Configurações da Fila & Tolerância</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Regras inteligentes calculadas pela IA para previsão e transição de pacientes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Horário Geral de Funcionamento
                </label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => handleChange('operatingHours', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Mensagem de Boas-vindas (Exibida no Totem e no Aplicativo)
                </label>
                <textarea
                  rows={3}
                  value={formData.welcomeMessage}
                  onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #cbd5e1', fontSize: 13.5, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Tolerância de Atraso para Pacientes Chamados
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[5, 10, 15, 20].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => handleChange('toleranceMinutes', min)}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: 10,
                        border: formData.toleranceMinutes === min ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        background: formData.toleranceMinutes === min ? '#f5f3ff' : '#ffffff',
                        color: formData.toleranceMinutes === min ? '#6d28d9' : '#334155',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {min} minutos
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
                <div style={{
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Avisos Automáticos via WhatsApp</strong>
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>Disparar mensagem quando faltar 2 pessoas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoWhatsappNotify}
                    onChange={(e) => handleChange('autoWhatsappNotify', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#10b981', cursor: 'pointer' }}
                  />
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#0f172a', display: 'block' }}>Notificações Push no App</strong>
                    <span style={{ fontSize: 11.5, color: '#64748b' }}>Emitir som e alerta visual na tela de espera</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoPushNotify}
                    onChange={(e) => handleChange('autoPushNotify', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#7c3aed', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 4: PLANO & FATURAMENTO */}
        {activeSection === 'subscription' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} color="#7c3aed" />
              <span>Assinatura & Plano Contratado</span>
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Detalhes da sua licença TemFyla, recursos ativos e faturamento corporativo.
            </p>

            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #edf2f7)',
              borderRadius: 14,
              padding: 20,
              border: '1.5px solid #e2e8f0',
              marginBottom: 20
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Plano Vigente
                  </span>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                    {formData.planName}
                  </h2>
                </div>
                <span style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 800
                }}>
                  {formData.planStatus}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, fontSize: 12.5, color: '#475569' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Ciclo de Cobrança:</span>
                  <strong>{formData.planCycle}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Capacidade:</span>
                  <strong>Até 10 consultórios simultâneos</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Módulos Inclusos:</span>
                  <strong>Totem QR, Painel TV, IA Preditiva & WhatsApp</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  if (showToast) showToast('🖨️ Abrindo comprovante de contrato para impressão/PDF...');
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <FileText size={15} />
                <span>Emitir Comprovante de Contrato</span>
              </button>
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
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
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
