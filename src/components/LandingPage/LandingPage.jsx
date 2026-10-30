import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Building2,
  QrCode,
  Clock,
  CheckCircle2,
  ShieldCheck,
  BarChart3,
  Users,
  TrendingUp,
  Layers,
  ChevronRight,
  Stethoscope,
  Utensils,
  Scissors,
  FlaskConical,
  Wrench,
  Landmark,
  Laptop,
  Zap,
  Bell,
  Smartphone,
  Check,
  Star
} from 'lucide-react';
import BrandLogo from '../Common/BrandLogo';
import InteractiveHeroPhone from './InteractiveHeroPhone';
import { CATEGORIES_LIST } from '../../data/mockData';

export default function LandingPage({
  activeQueue,
  onOpenSignup,
  onOpenLogin,
  onOpenPricing
}) {
  const [selectedCategory, setSelectedCategory] = useState('clinic');

  const demoQueues = {
    clinic: {
      companyName: 'Clínica Bem Estar',
      unitName: 'Consultório 04 • Dra. Camila',
      ticketNumber: 'A-47',
      position: 3,
      service: 'Consulta Cardiologia Clínica',
      estimatedWaitText: '18-22 min',
      staffNote: 'Ritmo da Dra. Camila: ~7 min por consulta',
      chipTopText: 'Sua vez em 5 min • Sala 04',
      chipBottomText: 'IA: Fluxo +18% mais ágil hoje',
      aheadList: [
        { ticket: '#A-44', name: 'Maria Silva', status: 'Em atendimento' },
        { ticket: '#A-45', name: 'João Santos', status: 'Aguardando' },
        { ticket: '#A-46', name: 'Ana Costa', status: 'Próximo a chamar' },
        { ticket: '#A-47', name: 'Você (Rafael)', status: 'Sua vez em breve', isUser: true },
      ]
    },
    restaurant: {
      companyName: 'Bistrô & Parrilla Paris',
      unitName: 'Salão Principal & Varanda',
      ticketNumber: 'M-14',
      position: 2,
      service: 'Mesa para 4 Pessoas',
      estimatedWaitText: '10-14 min',
      staffNote: 'Mesa liberando na varanda em instantes',
      chipTopText: 'Mesa 14 pronta em ~3 min',
      chipBottomText: 'Tempo médio de rotação: 45 min',
      aheadList: [
        { ticket: '#M-12', name: 'Família Rocha', status: 'Ocupando mesa' },
        { ticket: '#M-13', name: 'Gabriel & Carla', status: 'Próximo a chamar' },
        { ticket: '#M-14', name: 'Você (Rafael)', status: 'Sua vez em breve', isUser: true },
      ]
    },
    beauty: {
      companyName: 'Don Corleone Barber Club',
      unitName: 'Cadeira 02 • Marcos Barbeiro',
      ticketNumber: 'B-09',
      position: 1,
      service: 'Corte Degradê + Barba Terapia',
      estimatedWaitText: '4-7 min',
      staffNote: 'Barbeiro finalizando acabamento com toalha quente',
      chipTopText: 'Você é o próximo na cadeira!',
      chipBottomText: 'Pontualidade de hoje: 99.1%',
      aheadList: [
        { ticket: '#B-08', name: 'Lucas Moreira', status: 'Em atendimento' },
        { ticket: '#B-09', name: 'Você (Rafael)', status: 'Próximo a sentar', isUser: true },
      ]
    },
    lab: {
      companyName: 'Vital Diagnósticos & Exames',
      unitName: 'Box 03 • Coleta Especial',
      ticketNumber: 'EX-88',
      position: 4,
      service: 'Exames de Sangue + Curva Glicêmica',
      estimatedWaitText: '12-16 min',
      staffNote: 'Triagem rápida com jejum prioritário',
      chipTopText: 'Box 03 liberando em instantes',
      chipBottomText: 'Resultados digitais sincronizados',
      aheadList: [
        { ticket: '#EX-85', name: 'Teresa Souza', status: 'Em coleta' },
        { ticket: '#EX-86', name: 'Carlos Dias', status: 'Aguardando' },
        { ticket: '#EX-87', name: 'Fernanda Luz', status: 'Próximo a chamar' },
        { ticket: '#EX-88', name: 'Você (Rafael)', status: 'Aguardando', isUser: true },
      ]
    },
    public: {
      companyName: '2º Cartório de Registro Civil',
      unitName: 'Guichê 05 • Autenticação',
      ticketNumber: 'CRT-31',
      position: 2,
      service: 'Reconhecimento de Firma & Procuração',
      estimatedWaitText: '8-11 min',
      staffNote: 'Guichê expresso com chamada automatizada',
      chipTopText: 'Dirija-se ao Guichê 05 em breve',
      chipBottomText: 'Fila 100% digital e sem papéis',
      aheadList: [
        { ticket: '#CRT-29', name: 'Roberto Mendes', status: 'Em atendimento' },
        { ticket: '#CRT-30', name: 'Juliana Pires', status: 'Próximo a chamar' },
        { ticket: '#CRT-31', name: 'Você (Rafael)', status: 'Sua vez em breve', isUser: true },
      ]
    }
  };

  const categoryIcons = {
    Stethoscope: <Stethoscope size={22} />,
    Utensils: <Utensils size={22} />,
    Scissors: <Scissors size={22} />,
    FlaskConical: <FlaskConical size={22} />,
    Sparkles: <Sparkles size={22} />,
    Wrench: <Wrench size={22} />,
    Landmark: <Landmark size={22} />,
    Laptop: <Laptop size={22} />
  };

  const steps = [
    {
      num: '01',
      title: 'Escaneamento do QR Code',
      desc: 'O cliente chega ao local e apenas aponta a câmera do celular para o totem ou adesivo de balcão. Sem download, sem senhas impressas em papel.',
      tag: 'Check-in Instantâneo',
      preview: '📸 QR Code Dinâmico • Sem Instalação de App'
    },
    {
      num: '02',
      title: 'Pré-Checkin & Escolha de Serviço',
      desc: 'Seleciona o procedimento desejado, informa seu nome ou WhatsApp e opta por atendimento comum ou prioritário resguardado por lei.',
      tag: 'Triagem Rápida',
      preview: '✓ Comum ou Prioritário (Lei 10.048)'
    },
    {
      num: '03',
      title: 'Previsão de Espera por IA',
      desc: 'Nosso algoritmo analisa o ritmo dos atendentes em tempo real, calculando a janela exata de chamada em vez de uma estimativa estática.',
      tag: 'Algoritmo v2.4',
      preview: '⚡ Precisão de 96.4% na janela de horário'
    },
    {
      num: '04',
      title: 'Liberdade para Circular',
      desc: 'O cliente não precisa ficar preso na sala de espera sufocante. Pode tomar um café ou passear sabendo exatamente quando deve retornar.',
      tag: 'Zero Aglomeração',
      preview: '☕ Liberdade com GPS & Alerta de Proximidade'
    },
    {
      num: '05',
      title: 'Notificações & Multi-Filas',
      desc: 'Alertas automáticos avisam: "Sua vez se aproxima em 5 minutos!". E se tiver em outra fila (ex: médico e laboratório), a IA evita conflitos.',
      tag: 'Gestão Inteligente',
      preview: '🔔 Alerta de 5 min + Detecção de Choque'
    },
    {
      num: '06',
      title: 'Atendimento Ágil & Métricas',
      desc: 'O atendente chama a próxima senha com 1 clique, reduzindo salas vazias, faltas de clientes e gerando relatórios estratégicos.',
      tag: 'Controle B2B',
      preview: '📊 Chamada em 1s & Métricas de Produtividade'
    }
  ];

  return (
    <main className="ff-landing-page">
      {/* 1. Hero Section com Ambient Lighting & SaaS Polish */}
      <section className="ff-hero">
        <div className="ff-hero-glow ff-hero-glow-1"></div>
        <div className="ff-hero-glow ff-hero-glow-2"></div>
        <div className="ff-hero-grid-pattern"></div>

        <div className="ff-hero-content">
          {/* Tagline Pill */}
          <div className="ff-hero-tagline">
            <span className="ff-pulse-dot"></span>
            <Sparkles size={14} className="tagline-sparkle" />
            <span>IA Preditiva de Espera • TemFyla Engine 2.0</span>
            <span className="ff-tagline-badge">Ao Vivo</span>
          </div>

          {/* Main Title */}
          <h1 className="ff-hero-title">
            Sua vez chega mais rápido.{' '}
            <span className="ff-hero-title-accent">Sem stress, sem surpresas.</span>
          </h1>

          {/* Subtitle */}
          <p className="ff-hero-desc">
            O <strong>TemFyla</strong> transforma salas de espera sufocantes em experiências fluidas.
            Acompanhe atendimentos ao vivo, receba previsões calculadas por Inteligência Artificial
            e sincronize múltiplas filas direto no celular.
          </p>

          {/* Actions */}
          <div className="ff-hero-actions">
            <button className="btn-primary btn-hero-glow" onClick={onOpenSignup}>
              <span>Cadastrar Minha Empresa</span>
              <ArrowRight size={16} />
            </button>

            <button className="btn-outline-purple btn-hero-secondary" onClick={onOpenPricing}>
              <span>Ver Planos de Assinatura</span>
            </button>
          </div>

          {/* High-Impact Stat Chips */}
          <div className="ff-hero-stats-row">
            <div className="ff-hero-stat-item">
              <div className="stat-bullet green"></div>
              <span className="stat-text"><strong>-65%</strong> tempo de espera percebido</span>
            </div>
            <div className="ff-hero-stat-item">
              <div className="stat-bullet purple"></div>
              <span className="stat-text"><strong>4.9/5</strong> avaliação dos clientes</span>
            </div>
            <div className="ff-hero-stat-item">
              <div className="stat-bullet blue"></div>
              <span className="stat-text"><strong>100%</strong> em conformidade LGPD</span>
            </div>
          </div>

          {/* Social Proof Avatar Stack */}
          <div className="ff-hero-social-proof">
            <div className="ff-avatar-stack">
              <span className="ff-stack-avatar" style={{ background: '#7c3aed' }}>Dr</span>
              <span className="ff-stack-avatar" style={{ background: '#0284c7' }}>MC</span>
              <span className="ff-stack-avatar" style={{ background: '#10b981' }}>LS</span>
              <span className="ff-stack-avatar" style={{ background: '#f59e0b' }}>PF</span>
              <span className="ff-stack-avatar" style={{ background: '#ec4899' }}>+500</span>
            </div>
            <div className="ff-social-proof-text">
              <div className="ff-stars-row">
                <Star size={13} fill="#eab308" color="#eab308" />
                <Star size={13} fill="#eab308" color="#eab308" />
                <Star size={13} fill="#eab308" color="#eab308" />
                <Star size={13} fill="#eab308" color="#eab308" />
                <Star size={13} fill="#eab308" color="#eab308" />
                <span className="ff-stars-score">4.9 / 5</span>
              </div>
              <span className="ff-social-sub">Mais de 500 estabelecimentos no Brasil já usam TemFyla</span>
            </div>
          </div>

          {/* Category Strip with Interactive Switcher */}
          <div className="ff-category-strip">
            <span className="ff-category-label">
              Clique no seu segmento para simular ao vivo:
            </span>
            <div className="ff-category-pills">
              <button
                type="button"
                className={`ff-category-pill ${selectedCategory === 'clinic' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('clinic')}
              >
                🏥 Clínicas & Saúde
              </button>
              <button
                type="button"
                className={`ff-category-pill ${selectedCategory === 'restaurant' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('restaurant')}
              >
                🍽️ Gastronomia & Bares
              </button>
              <button
                type="button"
                className={`ff-category-pill ${selectedCategory === 'beauty' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('beauty')}
              >
                ✂️ Estética & Barbearias
              </button>
              <button
                type="button"
                className={`ff-category-pill ${selectedCategory === 'lab' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('lab')}
              >
                🧪 Laboratórios & Exames
              </button>
              <button
                type="button"
                className={`ff-category-pill ${selectedCategory === 'public' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('public')}
              >
                🏛️ Cartórios & Serviços
              </button>
            </div>
          </div>
        </div>

        {/* Hero Interactive Phone */}
        <div className="ff-hero-phone-col">
          <InteractiveHeroPhone
            activeQueue={demoQueues[selectedCategory] || activeQueue}
          />
        </div>
      </section>

      {/* Comparativo de Impacto: Antes vs Com o TemFyla */}
      <section className="ff-section ff-comparison-section">
        <header className="ff-section-center-header">
          <div className="ff-section-mini-badge">
            <Zap size={13} />
            <span>Comparativo de Impacto Operacional</span>
          </div>
          <h2 className="ff-section-title">
            O fim da espera caótica. <span>Antes vs Com o TemFyla</span>
          </h2>
          <p className="ff-section-subtitle">
            Veja a transformação que acontece no seu estabelecimento a partir do momento em que a fila se torna 100% digital e inteligente.
          </p>
        </header>

        <div className="ff-comparison-grid">
          {/* Card Antes (O Jeito Ultrapassado) */}
          <div className="ff-comparison-card before">
            <div className="comp-card-badge before">
              <span className="comp-badge-icon">✕</span>
              <span>A Fila Tradicional (O Jeito Ultrapassado)</span>
            </div>

            <h3 className="comp-card-title">Salas cheias, tensão e clientes perdendo a paciência</h3>
            <p className="comp-card-desc">
              Sistemas analógicos com papéis descartáveis tratam pessoas como números e deixam sua recepção vulnerável ao caos.
            </p>

            <ul className="comp-card-list">
              <li>
                <div className="comp-list-icon cross">✕</div>
                <div>
                  <strong>Senhas de papel amassadas e perdidas</strong>
                  <span>Custos recorrentes com impressoras térmicas, bobinas que travam e bilhetes jogados no chão.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon cross">✕</div>
                <div>
                  <strong>Recepção lotada e barulhenta</strong>
                  <span>Pessoas espremidas na sala de espera, calor, ruído de conversas e clima de ansiedade constante.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon cross">✕</div>
                <div>
                  <strong>Prisão física à cadeira</strong>
                  <span>O cliente não pode ir tomar um café ou ir ao banheiro com medo de perder a chamada de voz.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon cross">✕</div>
                <div>
                  <strong>Recepção interrompida a cada 2 minutos</strong>
                  <span>Secretárias perdem tempo respondendo repetidamente "falta muito?" em vez de atender.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon cross">✕</div>
                <div>
                  <strong>Desistências invisíveis</strong>
                  <span>Clientes vão embora frustrados sem avisar ninguém, gerando ociosidade e perda de faturamento.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Card Depois (A Experiência TemFyla) */}
          <div className="ff-comparison-card after">
            <div className="comp-card-badge after">
              <span className="ff-pulse-dot"></span>
              <span>Com o TemFyla (A Nova Geração)</span>
            </div>

            <h3 className="comp-card-title">Ambiente calmo, previsão exata e liberdade total</h3>
            <p className="comp-card-desc">
              Tecnologia em nuvem que sincroniza totens, painéis e celulares com inteligência artificial preditiva.
            </p>

            <ul className="comp-card-list">
              <li>
                <div className="comp-list-icon check">✓</div>
                <div>
                  <strong>Check-in instantâneo via QR Code</strong>
                  <span>O cliente aponta a câmera e entra na fila em 5 segundos, sem precisar baixar app na loja.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon check">✓</div>
                <div>
                  <strong>Previsão dinâmica calculada por IA</strong>
                  <span>Algoritmo aprende o ritmo dos profissionais e recalcula a espera em tempo real.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon check">✓</div>
                <div>
                  <strong>Liberdade para aguardar onde quiser</strong>
                  <span>O cliente toma um café, espera no carro ou passeia sabendo exatamente a hora de retornar.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon check">✓</div>
                <div>
                  <strong>Alerta automático 5 minutos antes</strong>
                  <span>Notificação discreta no celular avisa que a vez está chegando, com orientações da sala.</span>
                </div>
              </li>
              <li>
                <div className="comp-list-icon check">✓</div>
                <div>
                  <strong>Recepção tranquila e NPS nas alturas</strong>
                  <span>Zero aglomeração, secretárias focadas, total respeito à LGPD e avaliação máxima dos clientes.</span>
                </div>
              </li>
            </ul>

            <div className="comp-after-cta">
              <button className="btn-primary btn-comp-cta" onClick={onOpenSignup}>
                <span>Experimentar TemFyla Agora</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 6 Steps Process Section (Modern Bento Grid) */}
      <section id="como-funciona" className="ff-section">
        <header className="ff-section-center-header">
          <div className="ff-section-mini-badge">
            <Sparkles size={13} />
            <span>Fluxo Operacional sem Atrito</span>
          </div>
          <h2 className="ff-section-title">
            Simples para o cliente, <span>inteligente por dentro</span>
          </h2>
          <p className="ff-section-subtitle">
            Como a tecnologia TemFyla elimina o estresse da recepção em 6 passos intuitivos e 100% digitais.
          </p>
        </header>

        <div className="ff-steps-bento-grid">
          {steps.map((step, idx) => (
            <article key={idx} className="ff-bento-step-card">
              <div className="bento-step-top">
                <div className="bento-step-badge">{step.num}</div>
                <span className="bento-step-tag">{step.tag}</span>
              </div>

              <div className="bento-step-body">
                <h3 className="bento-step-title">{step.title}</h3>
                <p className="bento-step-desc">{step.desc}</p>
              </div>

              <div className="bento-step-preview">
                <span className="preview-indicator"></span>
                <span className="preview-text">{step.preview}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Deep Obsidian Cyber Showcase ("Não é apenas uma fila") */}
      <div className="ff-purple-banner-container">
        <section className="ff-purple-banner">
          <div className="ff-banner-ambient-orb"></div>
          <div className="ff-banner-grid-overlay"></div>

          <header className="ff-banner-header">
            <div className="ff-banner-tagline">
              <Zap size={14} />
              <span>Diferencial Tecnológico TemFyla</span>
            </div>
            <h2 className="ff-banner-title">
              Não é apenas uma fila.{' '}
              <span className="ff-banner-highlight">É uma experiência fluida.</span>
            </h2>
            <p className="ff-banner-desc">
              Tradicionais sistemas de senhas apenas imprimem papéis descartáveis e deixam o cliente às escuras.
              O TemFyla conecta dados em tempo real para devolver o tempo e a tranquilidade das pessoas.
            </p>
          </header>

          <div className="ff-banner-cards-grid">
            <div className="ff-glass-card">
              <div className="ff-glass-card-icon icon-cyan">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="ff-glass-card-title">Previsão Dinâmica por Inteligência Artificial</h4>
                <p className="ff-glass-card-desc">
                  Se um atendimento demorar mais, o sistema recalcula imediatamente a previsão de todos
                  os clientes subsequentes e envia atualizações discretas em tempo real.
                </p>
              </div>
            </div>

            <div className="ff-glass-card">
              <div className="ff-glass-card-icon icon-purple">
                <Layers size={22} />
              </div>
              <div>
                <h4 className="ff-glass-card-title">Multi-Filas com Detecção de Conflitos</h4>
                <p className="ff-glass-card-desc">
                  Seu cliente precisa passar no médico e depois fazer exame de sangue? Ele acompanha
                  ambas as senhas no mesmo app, e a IA avisa caso os horários entrem em rota de colisão.
                </p>
              </div>
            </div>

            <div className="ff-glass-card">
              <div className="ff-glass-card-icon icon-emerald">
                <Users size={22} />
              </div>
              <div>
                <h4 className="ff-glass-card-title">Salas de Espera Limpas e Desafogadas</h4>
                <p className="ff-glass-card-desc">
                  Redução de até 75% na aglomeração física da recepção, eliminando a sobrecarga dos
                  atendentes e elevando a nota de satisfação (NPS) da sua marca.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Segments Grid Section */}
      <section id="segmentos" className="ff-section">
        <header className="ff-section-center-header">
          <div className="ff-section-mini-badge">
            <Building2 size={13} />
            <span>Flexibilidade por Nicho</span>
          </div>
          <h2 className="ff-section-title">
            Criado sob medida para o seu <span>segmento de atendimento</span>
          </h2>
          <p className="ff-section-subtitle">
            Fluxos ajustáveis para clínicas, consultórios, salões, gastronomia e serviços com alto volume.
          </p>
        </header>

        <div className="ff-segments-grid">
          {CATEGORIES_LIST.map((cat, idx) => (
            <div key={idx} className="ff-segment-box" onClick={onOpenSignup}>
              <div className="ff-segment-icon">
                {categoryIcons[cat.icon] || <Sparkles size={22} />}
              </div>
              <h3 className="ff-segment-label">{cat.label}</h3>
              <p className="ff-segment-desc">{cat.desc}</p>
              <div className="ff-segment-footer">
                <span>Ativar modelo</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Intelligence & Management Section (Cockpit Dashboard) */}
      <section id="gestao-ia" className="ff-section ff-management-section">
        <div className="ff-management-content">
          <div className="ff-hero-tagline">
            <BarChart3 size={14} />
            <span>Dashboard Gerencial da Empresa</span>
          </div>

          <h2 className="ff-section-title">
            Inteligência na gestão, <span>clareza nas decisões</span>
          </h2>

          <p className="ff-management-desc">
            Acompanhe o ritmo dos seus atendentes, identifique gargalos operacionais e
            tome decisões com base em dados consolidados de fluxo e tempo de permanência.
          </p>

          <div className="ff-management-checklist">
            <div className="ff-check-item">
              <div className="ff-check-icon">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span>Painel de chamada de senhas direto pelo navegador em qualquer tela</span>
            </div>

            <div className="ff-check-item">
              <div className="ff-check-icon">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span>Controle integrado de senhas comuns e prioritárias (Lei 10.048)</span>
            </div>

            <div className="ff-check-item">
              <div className="ff-check-icon">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span>Relatórios diários de tempo médio, picos de fluxo e desistências evitadas</span>
            </div>

            <div className="ff-check-item">
              <div className="ff-check-icon">
                <CheckCircle2 size={16} strokeWidth={2.5} />
              </div>
              <span>Geração instantânea de QR Code para balcões, totens ou comandas físicas</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn-primary" onClick={onOpenSignup}>
              <span>Criar Conta da Empresa</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className="ff-dashboard-card-mockup">
          <div className="ff-dash-card-header">
            <div>
              <div className="ff-dash-greeting">Clínica Vida • Painel de Controle</div>
              <div className="ff-dash-time">Hoje às 14:35 • 3 salas de atendimento ativas</div>
            </div>
            <div className="ff-dash-status-pill">
              <span className="dot-green-pulse"></span>
              <span>Operação Normal</span>
            </div>
          </div>

          <div className="ff-dash-metrics-grid">
            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <Clock size={16} className="ff-metric-icon" />
                <span className="ff-metric-badge green">-18% vs ontem</span>
              </div>
              <div className="ff-metric-value">14 min</div>
              <div className="ff-metric-label">Tempo Médio de Espera</div>
            </div>

            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <Users size={16} className="ff-metric-icon" />
                <span className="ff-metric-badge green">99.2% retidos</span>
              </div>
              <div className="ff-metric-value">48</div>
              <div className="ff-metric-label">Clientes Atendidos Hoje</div>
            </div>

            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <TrendingUp size={16} className="ff-metric-icon" />
                <span className="ff-metric-badge green">Zero tumulto</span>
              </div>
              <div className="ff-metric-value">100%</div>
              <div className="ff-metric-label">Check-ins Virtuais</div>
            </div>

            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <Sparkles size={16} className="ff-metric-icon" />
                <span className="ff-metric-badge green">IA Ativa</span>
              </div>
              <div className="ff-metric-value">96.4%</div>
              <div className="ff-metric-label">Acurácia Preditiva</div>
            </div>
          </div>

          <div className="ff-dash-insight-box">
            <div className="ff-insight-sparkle-circle">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="ff-insight-title">Insight de IA Operacional</div>
              <p className="ff-insight-desc">
                O fluxo está 20% mais rápido que o previsto para o Consultório 04.
                A IA ajustou os horários dos próximos 4 pacientes automaticamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security & LGPD Banner */}
      <section className="ff-section" style={{ paddingTop: 0 }}>
        <div className="ff-security-banner">
          <div className="ff-security-icon-circle">
            <ShieldCheck size={28} />
          </div>

          <h3 className="ff-security-title">Privacidade e Proteção de Dados (LGPD)</h3>

          <p className="ff-security-desc">
            Seus clientes não precisam expor dados sensíveis. O sistema exibe apenas o primeiro nome e
            o número do bilhete digital. Todos os dados são criptografados de ponta a ponta e descartados
            conforme as diretrizes da LGPD (Lei 13.709/2018).
          </p>

          <div className="ff-security-badges">
            <div className="ff-sec-badge-item">
              <CheckCircle2 size={16} />
              <span>Conforme Lei 13.709/2018 (LGPD)</span>
            </div>
            <div className="ff-sec-badge-item">
              <CheckCircle2 size={16} />
              <span>Conexão Segura SSL 256-bit</span>
            </div>
            <div className="ff-sec-badge-item">
              <CheckCircle2 size={16} />
              <span>Anonimização Total de Pacientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials / Depoimentos de Clientes Reais */}
      <section className="ff-section ff-testimonials-section">
        <header className="ff-section-center-header">
          <div className="ff-section-mini-badge">
            <Star size={13} fill="#eab308" color="#eab308" />
            <span>Casos Reais de Sucesso</span>
          </div>
          <h2 className="ff-section-title">
            Quem experimentou o TemFyla, <span>não volta para o papel</span>
          </h2>
          <p className="ff-section-subtitle">
            Mais de 500 estabelecimentos em todo o Brasil já transformaram a espera em vantagem competitiva.
          </p>
        </header>

        <div className="ff-testimonials-grid">
          <div className="ff-testimonial-card">
            <div className="ff-test-stars">⭐⭐⭐⭐⭐</div>
            <p className="ff-test-quote">
              "Reduzimos as queixas na nossa recepção a zero na primeira semana. Os pacientes adoram poder tomar um café enquanto aguardam a consulta. A previsão da IA é incrivelmente precisa."
            </p>
            <div className="ff-test-author">
              <div className="ff-test-avatar clinic-av">MV</div>
              <div className="ff-test-author-info">
                <strong>Dra. Mariana Vasconcelos</strong>
                <span>Diretora Médica • Centro Alpha Saúde</span>
              </div>
            </div>
          </div>

          <div className="ff-testimonial-card highlight">
            <div className="ff-test-stars">⭐⭐⭐⭐⭐</div>
            <p className="ff-test-quote">
              "Nosso sábado era puro tumulto. Hoje o cliente chega, escaneia o QR Code no balcão e vai até a loja vizinha. Quando faltam 2 pessoas, ele recebe o aviso. A rotatividade aumentou 40%."
            </p>
            <div className="ff-test-author">
              <div className="ff-test-avatar barber-av">RM</div>
              <div className="ff-test-author-info">
                <strong>Rodrigo Mendes</strong>
                <span>Sócio Fundador • Don Corleone Barber Club</span>
              </div>
            </div>
          </div>

          <div className="ff-testimonial-card">
            <div className="ff-test-stars">⭐⭐⭐⭐⭐</div>
            <p className="ff-test-quote">
              "Economizamos quase R$ 800 por mês só em bobinas térmicas e manutenção de impressoras antigas. O TemFyla é intuitivo tanto para os atendentes quanto para quem tem mais de 60 anos."
            </p>
            <div className="ff-test-author">
              <div className="ff-test-avatar bistro-av">CF</div>
              <div className="ff-test-author-info">
                <strong>Carlos Ferreira</strong>
                <span>Gerente Operacional • Vital Diagnósticos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="ff-cta-section">
        <div className="ff-cta-ambient-glow"></div>
        <div className="ff-cta-content">
          <div className="ff-cta-sparkle">
            <Sparkles size={24} />
          </div>

          <h2 className="ff-cta-title">
            Pronto para revolucionar o atendimento do seu negócio?
          </h2>

          <p className="ff-cta-desc">
            Crie sua primeira fila virtual em menos de 2 minutos. Sem taxas de instalação,
            sem totens caros, pronto para qualquer tela.
          </p>

          <div className="ff-cta-buttons">
            <button className="btn-cta-white" onClick={onOpenSignup}>
              <span>Cadastrar Empresa Agora</span>
              <ArrowRight size={16} />
            </button>

            <button className="btn-cta-ghost" onClick={onOpenPricing}>
              <span>Ver Planos e Preços</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ff-footer">
        <div className="ff-footer-inner">
          <div className="ff-footer-brand">
            <BrandLogo size={36} textColor="#ffffff" />
          </div>

          <div className="ff-footer-nav">
            <button onClick={onOpenPricing}>Planos & Preços</button>
            <button onClick={onOpenSignup}>Cadastrar Empresa</button>
            <button onClick={onOpenLogin}>Acessar Painel</button>
          </div>

          <div className="ff-footer-copy">
            © {new Date().getFullYear()} TemFyla Tecnologia de Atendimento Inteligente. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
