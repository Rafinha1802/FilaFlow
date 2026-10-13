import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Navigation, 
  QrCode, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Zap, 
  Bell,
  Bookmark,
  Coffee,
  ShieldCheck,
  Flame,
  ArrowRight,
  SlidersHorizontal,
  Stethoscope,
  FlaskConical,
  Store
} from 'lucide-react';

export default function MobileDashboard({
  activeQueues,
  selectedQueueId,
  onSelectQueue,
  onOpenQrScanner,
  onOpenSearch,
  onRemoveQueue,
  onSecretaryCheckin,
  onClientImOnMyWay,
  onClientAskMoreTime,
  onApproveReceptionCheckin,
  hasConflict,
  onDismissConflict,
  onNavigateTab
}) {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Find currently selected queue or first queue
  const currentQueue = activeQueues.find((q) => q.id === selectedQueueId) || activeQueues[0] || null;

  // Find most urgent queue
  const urgentQueue = activeQueues.length > 0 
    ? [...activeQueues].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
    : null;

  // Selected queue to display
  const displayQueue = activeQueues.find((q) => q.id === selectedQueueId) || urgentQueue || activeQueues[0] || null;

  const handleSecretaryCheckinAction = (id) => {
    if (onSecretaryCheckin) {
      onSecretaryCheckin(id || displayQueue?.id);
    }
    showToast('✓ Check-in validado com a secretária! Liberado para a consulta.');
  };

  const handleAskMoreTime = (id) => {
    onClientAskMoreTime(id || displayQueue?.id);
    showToast('⏱️ Previsão recalculada: +5 min concedidos pela IA.');
  };

  // Disparo de notificação normal ao chegar/carregar fila em espera
  React.useEffect(() => {
    if (displayQueue && !displayQueue.isCheckedInWithSecretary) {
      const doc = displayQueue.attendantName?.startsWith('Dr') 
        ? `médico ${displayQueue.attendantName}` 
        : `médico ${displayQueue.attendantName || 'responsável'}`;
      showToast({
        title: 'Fila de Espera • Totem QR',
        message: `Você está na fila de espera, aguarde você ser aprovado para poder ir para a fila do ${doc}...`
      });
    }
  }, [displayQueue?.id]);

  return (
    <div className="ff-mob-clean-app">
      {/* Notificação Normal Mobile (Floating Push Notification Banner no Topo) */}
      {toastMessage && (
        <div className="ff-mob-toast-clean" onClick={() => setToastMessage(null)}>
          <div className="toast-icon-circle">
            <Bell size={16} />
          </div>
          <div className="toast-content-col">
            <div className="toast-top-row">
              <strong className="toast-title">
                {typeof toastMessage === 'object' ? toastMessage.title : 'FilaFlow'}
              </strong>
              <span className="toast-time">Agora</span>
            </div>
            <p className="toast-body-text">
              {typeof toastMessage === 'object' ? toastMessage.message : toastMessage}
            </p>
          </div>
          <button 
            className="toast-close-btn" 
            onClick={(e) => { e.stopPropagation(); setToastMessage(null); }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header estilo Screen 3 (Hello, Welcome + Avatar + Big Title) */}
      <header className="ff-mob-clean-header">
        <div className="header-user-row">
          <div className="header-greeting-col">
            <span className="greeting-sub">Olá, Bem-vindo 👋</span>
            <h3 className="greeting-name">Rafael Silva</h3>
          </div>

          <div className="header-avatar-group">
            <button 
              className="btn-icon-soft" 
              onClick={() => onNavigateTab && onNavigateTab('notifications')}
              title="Notificações"
            >
              <Bell size={18} />
              <span className="dot-badge"></span>
            </button>
            <div className="clean-avatar-circle">
              <span>R</span>
            </div>
          </div>
        </div>

        {/* Big Bold Clean Headline */}
        <div className="header-headline-row">
          <h1 className="header-headline">
            Sua Vez, <span className="headline-highlight">Sem Espera</span> Hoje!
          </h1>
          <p className="header-headline-sub">
            Acompanhe o seu lugar na fila e o tempo de espera em tempo real
          </p>
        </div>
      </header>

      {/* 2. Alerta Discreto de Choque de Horários (Se houver conflito ativo) */}
      {hasConflict && activeQueues.length > 1 && (
        <div className="clean-conflict-banner">
          <div className="conflict-banner-icon">
            <Zap size={16} />
          </div>
          <div className="conflict-banner-body">
            <strong>Choque de Horários Evitado</strong>
            <span>Médico e Exame chamariam juntos. IA recalculou +5m.</span>
          </div>
          <button className="conflict-banner-close" onClick={onDismissConflict}>✕</button>
        </div>
      )}

      {/* 3. Hero Card: O Próprio Lugar na Fila do Usuário */}
      {displayQueue ? (
        displayQueue.status === 'reception_waiting' ? (
          /* Card Pastel Suave de Recepção / Triagem */
          <div className="clean-hero-card reception-theme">
            <div className="hero-card-header">
              <span className="hero-category-chip amber">Etapa 1 • Fila da Recepção</span>
              <button className="hero-bookmark-btn" title="Salvo">
                <Bookmark size={18} />
              </button>
            </div>

            <div className="hero-card-body">
              <h2 className="hero-card-title">{displayQueue.companyName}</h2>
              <p className="hero-card-sub">{displayQueue.serviceName} • {displayQueue.insuranceName || 'Convênio'}</p>

              <div className="reception-status-box">
                <div className="reception-number-group">
                  <span className="reception-label">STATUS ATUAL</span>
                  <div className="reception-val">Aguardando Balcão</div>
                </div>
                <div className="reception-pos-pill">
                  {displayQueue.position}º na Triagem
                </div>
              </div>

              {/* Indicador de pessoas na frente na triagem */}
              <div className="reception-hint-row">
                <Clock size={13} />
                <span>
                  {displayQueue.position > 1 
                    ? `Há ${displayQueue.position - 1} ${displayQueue.position - 1 === 1 ? 'pessoa' : 'pessoas'} na sua frente no balcão.`
                    : 'Você é o próximo a ser chamado na recepção!'}
                </span>
              </div>

              {/* Stepper Super Limpo */}
              <div className="clean-stepper-row">
                <span className="step-point done">✓ QR Code</span>
                <span className="step-arrow">➔</span>
                <span className="step-point active">● Recepção</span>
                <span className="step-arrow">➔</span>
                <span className="step-point pending">○ Médico</span>
              </div>
            </div>
          </div>
        ) : (
          /* Card Hero Principal Escuro / Violeta Nobre: Lugar na Fila */
          <div className="clean-hero-card dark-theme">
            <div className="hero-card-glow"></div>
            
            <div className="hero-card-header">
              <div className="hero-live-badge">
                <span className="pulse-dot"></span>
                <span>SEU LUGAR NA FILA</span>
              </div>
              <button className="hero-bookmark-btn light" title="Favorito">
                <Bookmark size={18} />
              </button>
            </div>

            <div className="hero-card-body">
              <div className="hero-unit-tag">
                <MapPin size={12} />
                <span>{displayQueue.companyName} • {displayQueue.room || 'Consultório 04'}</span>
              </div>

              {/* Status da Fila */}
              <div className="hero-checkin-badge-row">
                {displayQueue.isCheckedInWithSecretary ? (
                  <span className="checkin-badge-status approved">
                    <CheckCircle2 size={12} color="#34d399" />
                    <span>Liberado para o Médico</span>
                  </span>
                ) : (
                  <span className="checkin-badge-status pending">
                    <Clock size={12} color="#fbbf24" />
                    <span>Fila de Espera • Aguardando aprovação</span>
                  </span>
                )}
              </div>

              <div className="hero-ticket-center">
                <span className="hero-ticket-label">SUA SENHA</span>
                <h1 className="hero-ticket-number">#{displayQueue.ticketNumber}</h1>
                <p className="hero-service-name">{displayQueue.serviceName}</p>
              </div>

              <div className="hero-wait-banner">
                <div className="wait-time-col">
                  <span className="wait-time-title">Tempo Estimado</span>
                  <div className="wait-time-display">
                    <Clock size={16} />
                    <span>{displayQueue.estimatedWaitText}</span>
                  </div>
                </div>

                <div className="wait-pos-col">
                  <span className="wait-pos-badge">
                    {displayQueue.position === 1 ? '🟢 SUA VEZ!' : `${displayQueue.position}º na fila`}
                  </span>
                </div>
              </div>

              {/* Detalhes do Lugar na Fila */}
              <div className="hero-position-details">
                <div className="hero-pos-summary">
                  {displayQueue.position === 1 ? (
                    <span className="pos-text-ready">
                      <CheckCircle2 size={14} color="#34d399" />
                      É a sua vez! Dirija-se ao local de atendimento
                    </span>
                  ) : (
                    <span className="pos-text-waiting">
                      <span className="pos-ahead-chip">
                        {displayQueue.position - 1} {displayQueue.position - 1 === 1 ? 'pessoa' : 'pessoas'} na frente
                      </span>
                      <span className="pos-ahead-hint">Aguarde sua chamada</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ações: Só pode pedir +5 min quando já estiver na fila do médico */}
            {displayQueue.isCheckedInWithSecretary && (
              <div className="hero-card-actions single-action">
                <button 
                  className="clean-pill-btn translucent"
                  style={{ width: '100%' }}
                  onClick={() => handleAskMoreTime(displayQueue.id)}
                  title="Solicitar tolerância de 5 min na previsão"
                >
                  <Clock size={15} />
                  <span>Pedir +5 min</span>
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* Estado vazio quando não houver filas */
        <div className="clean-hero-card dark-theme empty-queue-hero">
          <div className="hero-card-body" style={{ textAlign: 'center', padding: '24px 14px' }}>
            <div className="empty-squircle sky" style={{ margin: '0 auto 14px auto' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
              Nenhuma senha ativa no momento
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 18 }}>
              Escaneie o QR Code em um totem presencial ou busque um local para entrar na fila.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="clean-pill-btn primary" onClick={onOpenQrScanner}>
                <QrCode size={15} />
                <span>Escanear Totem</span>
              </button>
              <button className="clean-pill-btn translucent" onClick={onOpenSearch}>
                <Search size={15} />
                <span>Buscar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bento Grid de Serviços em Cores Pastéis */}
      <section className="clean-section-block">
        <div className="clean-section-header">
          <h3 className="section-title">Serviços & Filas</h3>
          <span className="section-subtitle">Acesso Rápido</span>
        </div>

        <div className="clean-pastel-bento-grid">
          {/* Card 1: Peach / Consulta */}
          <div 
            className={`pastel-bento-card peach ${displayQueue?.id === 'clinica-vida' ? 'is-selected' : ''}`}
            onClick={() => onSelectQueue && onSelectQueue('clinica-vida')}
          >
            <div className="card-top-icon">
              <div className="icon-squircle peach">
                <Stethoscope size={20} />
              </div>
              <span className="card-badge">Ativa</span>
            </div>
            <h4 className="card-title">Consulta Médica</h4>
            <p className="card-desc">Senha #47 • Dr. Carlos</p>
          </div>

          {/* Card 2: Mint / Exames */}
          <div 
            className={`pastel-bento-card mint ${displayQueue?.id === 'examelab' || displayQueue?.id === 'lab-exame' ? 'is-selected' : ''}`}
            onClick={() => onSelectQueue && onSelectQueue(activeQueues.find(q => q.id.includes('exame'))?.id || 'examelab')}
          >
            <div className="card-top-icon">
              <div className="icon-squircle mint">
                <FlaskConical size={20} />
              </div>
              <span className="card-badge mint">Fila 2</span>
            </div>
            <h4 className="card-title">Exames de Sangue</h4>
            <p className="card-desc">
              Senha #{activeQueues.find(q => q.id.includes('exame'))?.ticketNumber || '18'} • Sala 02
            </p>
          </div>

          {/* Card 3: Sky Blue / QR Check-in */}
          <div 
            className="pastel-bento-card sky"
            onClick={onOpenQrScanner}
          >
            <div className="card-top-icon">
              <div className="icon-squircle sky">
                <QrCode size={20} />
              </div>
              <span className="card-badge sky">Sem App</span>
            </div>
            <h4 className="card-title">Ler QR Totem</h4>
            <p className="card-desc">Check-in de Balcão</p>
          </div>

          {/* Card 4: Lavender / Café */}
          <div 
            className="pastel-bento-card lavender"
            onClick={() => showToast('☕ Cupom ativado! 15% OFF no Café Havanna na sua espera.')}
          >
            <div className="card-top-icon">
              <div className="icon-squircle lavender">
                <Coffee size={20} />
              </div>
              <span className="card-badge lavender">Desconto</span>
            </div>
            <h4 className="card-title">Café Havanna</h4>
            <p className="card-desc">15% OFF na Espera</p>
          </div>
        </div>
      </section>

      {/* 5. Seção de Benefícios e Parcerias na Espera */}
      <section className="clean-section-block" style={{ paddingBottom: 20 }}>
        <div className="clean-section-header">
          <h3 className="section-title">Benefícios na Sua Espera</h3>
          <span className="section-subtitle">Parceiros</span>
        </div>

        <div className="clean-partner-card">
          <div className="partner-img-box">
            <Coffee size={26} color="#d97706" />
          </div>
          <div className="partner-info">
            <h4 className="partner-name">Café Havanna Paulista</h4>
            <p className="partner-desc">40m a pé • Apresente a senha e ganhe 15% OFF</p>
            <div className="partner-rating">
              <span className="stars">★★★★★</span>
              <span className="rating-num">5.0 (420 avaliações)</span>
            </div>
          </div>
          <button 
            className="partner-arrow-btn"
            onClick={() => showToast('☕ Cupom ativado! Apresente o bilhete da Clínica Vida no caixa.')}
            title="Resgatar benefício"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

    </div>
  );
}
