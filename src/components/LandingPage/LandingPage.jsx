import React from 'react';
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
  Laptop
} from 'lucide-react';
import InteractiveHeroPhone from './InteractiveHeroPhone';
import { CATEGORIES_LIST } from '../../data/mockData';

export default function LandingPage({
  activeQueue,
  onOpenSignup,
  onOpenLogin,
  onOpenPricing
}) {
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
      desc: 'O cliente chega ao local e apenas aponta a câmera do celular para o totem ou adesivo de balcão, sem necessidade de baixar apps pesados.'
    },
    {
      num: '02',
      title: 'Pré-Checkin & Escolha de Serviço',
      desc: 'Seleciona o procedimento desejado, informa seu nome ou WhatsApp e opta por atendimento comum ou preferencial por lei.'
    },
    {
      num: '03',
      title: 'Previsão de Espera por IA',
      desc: 'Nosso algoritmo analisa o ritmo dos atendentes em tempo real, calculando a janela exata de chamada em vez de um número estático.'
    },
    {
      num: '04',
      title: 'Liberdade para Circular',
      desc: 'O cliente não precisa ficar preso na sala de espera. Pode tomar um café ou passear sabendo exatamente quando deve retornar.'
    },
    {
      num: '05',
      title: 'Notificações & Multi-Filas',
      desc: 'Alertas automáticos avisam: "Sua vez se aproxima em 5 minutos!". E se tiver em outra fila (ex: médico e laboratório), o sistema avisa conflitos.'
    },
    {
      num: '06',
      title: 'Atendimento Ágil & Relatórios',
      desc: 'O atendente chama com um clique, reduzindo filas vazias, faltas de clientes e gerando métricas completas para a gestão.'
    }
  ];

  return (
    <main className="ff-landing-page">
      {/* 1. Hero Section */}
      <section className="ff-hero">
        <div className="ff-hero-content">
          <div className="ff-hero-tagline">
            <Sparkles size={14} />
            <span>IA Preditiva de Espera em Tempo Real</span>
          </div>

          <h1 className="ff-hero-title">
            Sua vez chega mais rápido.{' '}
            <span className="ff-hero-title-accent">Sem stress, sem surpresas.</span>
          </h1>

          <p className="ff-hero-desc">
            O FilaFlow transforma a espera em liberdade. Acompanhe atendimentos ao vivo, 
            receba previsões de tempo calculadas por Inteligência Artificial e gerencie múltiplas 
            filas simultâneas direto do seu celular.
          </p>

          <div className="ff-hero-actions">
            <button className="btn-primary" onClick={onOpenSignup}>
              <span>Cadastrar Minha Empresa</span>
              <ArrowRight size={16} />
            </button>

            <button className="btn-outline-purple" onClick={onOpenPricing}>
              <span>Ver Planos & Preços</span>
            </button>
          </div>

          {/* Category Strip */}
          <div className="ff-category-strip">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Feito para:
            </span>
            <div className="ff-category-item">🏥 Clínicas</div>
            <div className="ff-category-item">🍽️ Restaurantes</div>
            <div className="ff-category-item">✂️ Salões & Barbearias</div>
            <div className="ff-category-item">🧪 Laboratórios</div>
            <div className="ff-category-item">🏛️ Cartórios</div>
          </div>
        </div>

        {/* Hero Interactive Phone */}
        <div className="ff-hero-phone-col">
          <InteractiveHeroPhone 
            activeQueue={activeQueue} 
          />
        </div>
      </section>

      {/* 2. 6 Steps Process Section */}
      <section id="como-funciona" className="ff-section">
        <header className="ff-section-center-header">
          <h2 className="ff-section-title">
            Simples para o cliente, <span>inteligente por dentro</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, marginTop: 12 }}>
            Como a tecnologia FilaFlow elimina o estresse da recepção em apenas 6 passos intuitivos.
          </p>
        </header>

        <div className="ff-steps-grid">
          {steps.map((step, idx) => (
            <article key={idx} className="ff-step-card">
              <div className="ff-step-card-header">
                <div className="ff-step-badge">{step.num}</div>
                <div>
                  <span className="ff-step-number">ETAPA {step.num}</span>
                  <h3 className="ff-step-card-title">{step.title}</h3>
                </div>
              </div>
              <p className="ff-step-card-desc">{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 3. Deep Purple Banner Section */}
      <div className="ff-purple-banner-container">
        <section className="ff-purple-banner">
          <header className="ff-banner-header">
            <h2 className="ff-banner-title">
              Não é apenas uma fila. É uma experiência fluida.
            </h2>
            <p className="ff-banner-desc">
              Tradicionais sistemas de senhas apenas imprimem papéis e deixam o cliente cego. 
              O FilaFlow conecta dados em tempo real para devolver o tempo das pessoas.
            </p>
          </header>

          <div className="ff-banner-cards-grid">
            <div className="ff-glass-card">
              <div className="ff-glass-card-icon">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="ff-glass-card-title">Previsão Dinâmica por Inteligência Artificial</h4>
                <p className="ff-glass-card-desc">
                  Se um atendimento demorar mais, o sistema recalcula imediatamente a previsão de todos 
                  os clientes subsequentes e envia atualizações discretas.
                </p>
              </div>
            </div>

            <div className="ff-glass-card">
              <div className="ff-glass-card-icon">
                <Layers size={20} />
              </div>
              <div>
                <h4 className="ff-glass-card-title">Multi-Filas com Detecção de Conflitos</h4>
                <p className="ff-glass-card-desc">
                  Seu cliente precisa passar no médico e depois fazer exame de sangue? Ele acompanha 
                  ambas as senhas no mesmo app, e a IA avisa se os horários forem colidir.
                </p>
              </div>
            </div>

            <div className="ff-glass-card">
              <div className="ff-glass-card-icon">
                <Users size={20} />
              </div>
              <div>
                <h4 className="ff-glass-card-title">Salas de Espera Limpas e Desafogadas</h4>
                <p className="ff-glass-card-desc">
                  Redução de até 75% na aglomeração física da recepção, eliminando o estresse dos 
                  atendentes e melhorando a nota de satisfação (NPS).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Segments Grid Section */}
      <section id="segmentos" className="ff-section">
        <header className="ff-section-center-header">
          <h2 className="ff-section-title">
            Para qualquer negócio que <span>trabalhe com atendimento</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, marginTop: 12 }}>
            Configurado sob medida para a dinâmica de fluxo do seu segmento.
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
            </div>
          ))}
        </div>
      </section>

      {/* 5. Intelligence & Management Section */}
      <section id="gestao-ia" className="ff-section ff-management-section">
        <div className="ff-management-content">
          <div className="ff-hero-tagline">
            <BarChart3 size={14} />
            <span>Dashboard Gerencial da Empresa</span>
          </div>

          <h2 className="ff-section-title">
            Inteligência na gestão, <span>clareza nas decisões</span>
          </h2>

          <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6 }}>
            Acompanhe o ritmo dos seus atendentes, identifique gargalos operacionais e 
            tome decisões com base em dados consolidados de fluxo.
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
              <span>Geração instantânea de QR Code para balcões, totens ou comandas</span>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
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
              <div className="ff-dash-greeting">Clínica Vida • Painel Geral</div>
              <div className="ff-dash-time">Hoje às 14:35 • 3 salas ativas</div>
            </div>
            <div style={{ 
              background: '#ecfdf5', 
              color: '#065f46', 
              fontSize: 12, 
              fontWeight: 700, 
              padding: '4px 10px', 
              borderRadius: 999 
            }}>
              ● Operação Normal
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
                <span className="ff-metric-badge green">Zero filas físicas</span>
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
              <div className="ff-metric-label">Acurácia da Previsão</div>
            </div>
          </div>

          <div className="ff-dash-insight-box">
            <Sparkles size={18} className="ff-insight-icon" />
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
            <ShieldCheck size={26} />
          </div>

          <h3 className="ff-security-title">Privacidade e Proteção de Dados (LGPD)</h3>
          
          <p className="ff-security-desc">
            Seus clientes não precisam expor dados sensíveis. O sistema exibe apenas o primeiro nome e 
            o número do bilhete digital. Todos os dados são criptografados de ponta a ponta e descartados 
            conforme as diretrizes da LGPD.
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
              <span>Anonimização de Pacientes</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="ff-cta-section">
        <div className="ff-cta-content">
          <div className="ff-cta-sparkle">
            <Sparkles size={22} />
          </div>

          <h2 className="ff-cta-title">
            Pronto para revolucionar o atendimento do seu negócio?
          </h2>

          <p className="ff-cta-desc">
            Crie sua primeira fila virtual em menos de 2 minutos. Sem taxas de instalação, 
            sem equipamentos caros.
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
      <footer style={{ 
        background: '#0b1120', 
        color: '#94a3b8', 
        padding: '40px 24px 28px',
        borderTop: '1px solid #1e293b'
      }}>
        <div style={{ 
          maxWidth: 1240, 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 20 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="ff-logo-mark" style={{ width: 28, height: 28 }}>
              <Layers size={16} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
              Fila<span style={{ color: '#a78bfa' }}>Flow</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 500 }}>
            <button onClick={onOpenPricing} style={{ color: '#94a3b8' }}>Planos</button>
            <button onClick={onOpenSignup} style={{ color: '#94a3b8' }}>Cadastrar Empresa</button>
            <button onClick={onOpenLogin} style={{ color: '#94a3b8' }}>Acessar Painel</button>
          </div>

          <div style={{ fontSize: 12, color: '#64748b' }}>
            © {new Date().getFullYear()} FilaFlow Tecnologias de Atendimento. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
