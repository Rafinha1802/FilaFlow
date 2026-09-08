import React, { useState } from 'react';
import { 
  Building2, 
  Layers, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  QrCode, 
  Clock, 
  Sparkles, 
  Download, 
  Printer,
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export default function CompanyOnboarding({
  onFinishOnboarding,
  onGoToLogin,
  onTestMobileQr
}) {
  const [step, setStep] = useState(1);

  // Step 1 Form Data
  const [companyName, setCompanyName] = useState('Centro Médico Aurora');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [category, setCategory] = useState('Clínica');
  const [unitName, setUnitName] = useState('Unidade Jardins');
  const [phone, setPhone] = useState('(11) 98765-4321');

  // Step 2 Form Data
  const [queueName, setQueueName] = useState('Consultório 01 - Triagem & Consulta');
  const [attendantName, setAttendantName] = useState('Dra. Beatriz Santos');
  const [avgWaitMin, setAvgWaitMin] = useState(15);
  const [aiMode, setAiMode] = useState('smart'); // 'smart' | 'conservative' | 'fast'

  const categories = [
    'Clínica', 
    'Restaurante', 
    'Salão', 
    'Laboratório', 
    'Barbearia', 
    'Oficina', 
    'Cartório', 
    'Outro'
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onFinishOnboarding({
      companyName,
      cnpj,
      category,
      unitName,
      phone,
      queueName,
      attendantName,
      avgWaitMin
    });
  };

  return (
    <div className="ff-onboarding-container">
      {/* Sidebar with Steps Progress */}
      <aside className="ff-onboarding-sidebar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div className="ff-logo-mark">
              <Layers size={20} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
              Fila<span style={{ color: '#a78bfa' }}>Flow</span>
            </span>
          </div>

          <h2 className="ff-onboarding-sidebar-title">Cadastro da Empresa</h2>
          <p className="ff-onboarding-sidebar-desc">
            Configure sua primeira fila digital e gere o QR Code de balcão para seus clientes em menos de 2 minutos.
          </p>

          <div className="ff-steps-tracker">
            <div className="ff-step-track-item">
              <div className={`ff-step-track-circle ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
                {step > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
              </div>
              <div className={`ff-step-track-text ${step === 1 ? 'active' : ''}`}>
                Dados da Empresa
              </div>
            </div>

            <div className="ff-step-track-item">
              <div className={`ff-step-track-circle ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                {step > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
              </div>
              <div className={`ff-step-track-text ${step === 2 ? 'active' : ''}`}>
                Configuração da Fila & IA
              </div>
            </div>

            <div className="ff-step-track-item">
              <div className={`ff-step-track-circle ${step === 3 ? 'active' : ''}`}>
                3
              </div>
              <div className={`ff-step-track-text ${step === 3 ? 'active' : ''}`}>
                QR Code & Ativação
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#64748b' }}>
          Já tem uma conta?{' '}
          <button onClick={onGoToLogin} style={{ color: '#a78bfa', fontWeight: 700 }}>
            Fazer login
          </button>
        </div>
      </aside>

      {/* Main Content Form */}
      <main className="ff-onboarding-main">
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                Etapa 1 de 3
              </span>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                Informações do Estabelecimento
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Estes dados serão exibidos na tela do celular dos seus clientes ao realizarem o check-in.
              </p>
            </div>

            <div className="ff-form" style={{ gap: 20 }}>
              <div className="ff-form-group">
                <label className="ff-form-label">Nome Fantasia da Empresa *</label>
                <input
                  type="text"
                  className="ff-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Clínica Saúde Total"
                  style={{ paddingLeft: 14 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="ff-form-group">
                  <label className="ff-form-label">CNPJ ou CPF</label>
                  <input
                    type="text"
                    className="ff-input"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    style={{ paddingLeft: 14 }}
                  />
                </div>

                <div className="ff-form-group">
                  <label className="ff-form-label">Unidade ou Bairro *</label>
                  <input
                    type="text"
                    className="ff-input"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="Ex: Unidade Centro"
                    style={{ paddingLeft: 14 }}
                    required
                  />
                </div>
              </div>

              <div className="ff-form-group">
                <label className="ff-form-label">Segmento do Negócio</label>
                <div className="ff-segment-pills-row">
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
                <label className="ff-form-label">WhatsApp de Contato para Suporte ao Cliente</label>
                <input
                  type="tel"
                  className="ff-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  style={{ paddingLeft: 14 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  style={{ background: '#2563eb' }}
                >
                  <span>Continuar para Configurar Fila</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                Etapa 2 de 3
              </span>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                Configuração da Fila Inicial & IA
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Defina o ponto de chamada e o ritmo médio esperado para o cálculo inteligente de espera.
              </p>
            </div>

            <div className="ff-form" style={{ gap: 20 }}>
              <div className="ff-form-group">
                <label className="ff-form-label">Identificação da Fila ou Sala *</label>
                <input
                  type="text"
                  className="ff-input"
                  value={queueName}
                  onChange={(e) => setQueueName(e.target.value)}
                  placeholder="Ex: Consultório 01, Guichê 03, Balcão de Pedidos"
                  style={{ paddingLeft: 14 }}
                  required
                />
              </div>

              <div className="ff-form-group">
                <label className="ff-form-label">Nome do Atendente ou Profissional Responsável</label>
                <input
                  type="text"
                  className="ff-input"
                  value={attendantName}
                  onChange={(e) => setAttendantName(e.target.value)}
                  placeholder="Ex: Dra. Ana Paula / Guichê 01"
                  style={{ paddingLeft: 14 }}
                />
              </div>

              <div className="ff-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="ff-form-label">Tempo Médio Estimado por Atendimento</label>
                  <span style={{ fontWeight: 800, color: '#2563eb', fontSize: 16 }}>
                    {avgWaitMin} minutos
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={avgWaitMin}
                  onChange={(e) => setAvgWaitMin(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer', marginTop: 8 }}
                />
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  A IA calibrará esse valor automaticamente à medida que os atendimentos forem concluídos.
                </span>
              </div>

              <div className="ff-form-group">
                <label className="ff-form-label">Modo do Algoritmo de Previsão FilaFlow</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <div
                    onClick={() => setAiMode('smart')}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: aiMode === 'smart' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: aiMode === 'smart' ? '#eff6ff' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Equilibrado (IA)</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Ajuste contínuo por histórico
                    </div>
                  </div>

                  <div
                    onClick={() => setAiMode('conservative')}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: aiMode === 'conservative' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: aiMode === 'conservative' ? '#eff6ff' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Conservador</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Janela maior para evitar atrasos
                    </div>
                  </div>

                  <div
                    onClick={() => setAiMode('fast')}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: aiMode === 'fast' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: aiMode === 'fast' ? '#eff6ff' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>Rápido / Balcão</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Focado em rotação rápida
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleBack}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ArrowLeft size={16} />
                  <span>Voltar</span>
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                  style={{ background: '#2563eb' }}
                >
                  <span>Gerar QR Code de Balcão</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                background: '#dcfce7', 
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                Fila Criada com Sucesso!
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
                Seu QR Code de recepção já está pronto. Coloque-o no balcão ou envie aos clientes.
              </p>
            </div>

            {/* Generated QR Code Card */}
            <div style={{
              maxWidth: 380,
              margin: '0 auto 24px',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: 20,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                TOTEM DE ATENDIMENTO
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                {companyName}
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                {unitName} • {queueName}
              </p>

              {/* Graphic QR Code Simulation */}
              <div style={{
                width: 200,
                height: 200,
                margin: '0 auto',
                background: '#f8fafc',
                border: '2px solid #cbd5e1',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  {/* Outer corner blocks */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="#0f172a" />

                  {/* Random QR Pattern Dots */}
                  <circle cx="42" cy="12" r="3" fill="#7c3aed" />
                  <circle cx="52" cy="18" r="3" fill="#0f172a" />
                  <circle cx="40" cy="28" r="3" fill="#0f172a" />
                  <circle cx="56" cy="32" r="3" fill="#7c3aed" />
                  <circle cx="20" cy="46" r="3" fill="#0f172a" />
                  <circle cx="34" cy="44" r="3" fill="#0f172a" />
                  <circle cx="48" cy="48" r="4" fill="#7c3aed" />
                  <circle cx="64" cy="46" r="3" fill="#0f172a" />
                  <circle cx="80" cy="44" r="3" fill="#0f172a" />
                  <circle cx="40" cy="62" r="3" fill="#0f172a" />
                  <circle cx="54" cy="64" r="3" fill="#0f172a" />
                  <circle cx="44" cy="78" r="3" fill="#7c3aed" />
                  <circle cx="56" cy="82" r="3" fill="#0f172a" />
                  <circle cx="70" cy="76" r="3" fill="#0f172a" />
                  <circle cx="84" cy="80" r="3" fill="#0f172a" />
                  <circle cx="72" cy="62" r="3" fill="#7c3aed" />
                  <circle cx="86" cy="60" r="3" fill="#0f172a" />
                </svg>

                {/* Central Brand Badge */}
                <div style={{
                  position: 'absolute',
                  width: 38,
                  height: 38,
                  background: '#ffffff',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed'
                }}>
                  <Layers size={20} />
                </div>
              </div>

              <div style={{ 
                marginTop: 14, 
                fontSize: 12, 
                fontWeight: 600, 
                color: '#475569',
                background: '#f1f5f9',
                padding: '6px 10px',
                borderRadius: 8
              }}>
                Aponte a câmera para entrar na fila virtual
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380, margin: '0 auto' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleComplete}
                style={{
                  background: '#10b981',
                  justifyContent: 'center',
                  padding: 14,
                  fontSize: 15
                }}
              >
                <span>Acessar Meu Painel Operacional</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="btn-outline-purple"
                onClick={onTestMobileQr}
                style={{ justifyContent: 'center' }}
              >
                <Smartphone size={16} />
                <span>Testar Leitor no Celular do Cliente</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
