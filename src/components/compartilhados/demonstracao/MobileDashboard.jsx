import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Bell,
  Zap,
  MessageCircle,
  Building2,
  CalendarCheck,
  CheckCircle2,
  QrCode,
  Search,
  ShieldCheck,
  Coffee,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  MapPin,
  Ticket,
  User,
  HeartPulse
} from 'lucide-react';

export default function MobileDashboard({
  currentUser,
  activeQueues = [],
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
  onNavigateTab,
  onPlayChime
}) {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const userName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Rafael';
  const avatarLetter = userName.charAt(0).toUpperCase() || 'R';

  // Find most urgent queue or currently selected
  const urgentQueue = activeQueues.length > 0
    ? [...activeQueues].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
    : null;

  const displayQueue = activeQueues.length > 0
    ? (activeQueues.find((q) => q.id === selectedQueueId) || urgentQueue || activeQueues[0])
    : null;

  const formattedTicket = displayQueue?.ticketNumber
    ? (displayQueue.ticketNumber.toString().startsWith('A-') ? displayQueue.ticketNumber : `A-${displayQueue.ticketNumber}`)
    : 'A-47';

  const attendantDisplay = displayQueue?.attendantName?.startsWith('Dr')
    ? displayQueue.attendantName
    : `Dra. ${displayQueue?.attendantName || 'Camila'}`;

  const handleAskMoreTime = (id) => {
    if (onClientAskMoreTime) onClientAskMoreTime(id || displayQueue?.id);
    showToast('⏱️ Previsão recalculada: +5 min concedidos pela recepção.');
  };

  // WhatsApp Share & Real-Time Sync
  const handleOpenWhatsApp = (queue) => {
    const q = queue || displayQueue;
    if (!q) return;

    const text = `🔔 *TemFyla - Status da Senha em Tempo Real*\n\n` +
      `🏥 *Local:* ${q.companyName || 'Clínica Bem Estar'}\n` +
      `🩺 *Serviço:* ${q.serviceName || 'Consulta Cardiologia Clínica'}\n` +
      `🎟️ *Sua Senha:* #${formattedTicket}\n` +
      `📍 *Posição:* ${q.position === 1 ? 'Sua Vez Agora!' : `${q.position || 3}º lugar na fila`}\n` +
      `⏱️ *Previsão de Atendimento:* ${q.estimatedWaitText || '18-22 min'}\n` +
      `👩‍⚕️ *Profissional:* ${attendantDisplay}\n\n` +
      `Acompanhe ao vivo pelo TemFyla: https://temfyla.com/fila/${q.id || 'clinica-vida'}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast('💬 Status da senha preparado para acompanhar pelo WhatsApp!');
  };

  // Push / Chime notification
  const handleTriggerPushNotification = () => {
    if (onPlayChime) {
      onPlayChime();
    } else {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('TemFyla: Sua vez está próxima!', {
          body: `Senha #${formattedTicket} na ${displayQueue?.companyName || 'Clínica Bem Estar'}. ${displayQueue?.room || 'Sala 04'}.`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    showToast('🔔 Notificação sonora disparada com sucesso!');
  };

  return (
    <div className="ff-mob-dashboard">
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="ff-mob-floating-toast" onClick={() => setToastMessage(null)}>
          <div className="toast-icon-pulse">
            <Bell size={14} />
          </div>
          <span className="toast-text">{typeof toastMessage === 'object' ? toastMessage.message : toastMessage}</span>
          <button
            className="toast-dismiss-btn"
            onClick={(e) => {
              e.stopPropagation();
              setToastMessage(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header do Usuário com Saudação e Atalhos Rápidos */}
      <header className="ff-mob-top-header">
        <div className="ff-mob-user-info">
          <h1 className="ff-mob-user-title">Olá, {userName} 👋</h1>
          <div className="ff-mob-status-sub">
            <span className="live-pulse-dot" />
            <span>
              {activeQueues.length > 0
                ? `${activeQueues.length} fila${activeQueues.length > 1 ? 's' : ''} em andamento`
                : 'Pronto para fila'}
            </span>
          </div>
        </div>

        <div className="ff-mob-header-actions">
          <button
            type="button"
            className="ff-mob-action-btn"
            onClick={onOpenQrScanner}
            title="Escanear QR Code no Totem"
          >
            <QrCode size={15} />
          </button>

          <button
            type="button"
            className="ff-mob-action-btn"
            onClick={onOpenSearch}
            title="Buscar Clínicas & Serviços"
          >
            <Search size={15} />
          </button>

          <button
            type="button"
            className="ff-mob-user-avatar"
            onClick={() => onNavigateTab && onNavigateTab('profile')}
            title="Meu Perfil"
          >
            <span>{avatarLetter}</span>
            <span className="avatar-online-dot" />
          </button>
        </div>
      </header>

      {/* 2. Banner Inteligente de Choque de Horários (se ativo) */}
      {hasConflict && activeQueues.length > 1 && (
        <div className="ff-mob-conflict-card">
          <div className="conflict-card-icon">
            <AlertTriangle size={13} />
          </div>
          <div className="conflict-card-text">
            <strong>Choque de Horários:</strong>
            <span>Atendimentos previstos no mesmo período.</span>
          </div>
          <button
            type="button"
            className="conflict-card-close"
            onClick={onDismissConflict}
            title="Ignorar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Seletor de Múltiplas Filas Ativas (Pills Carousel) */}
      {activeQueues.length > 1 && (
        <div className="ff-mob-queue-pills-bar">
          <div className="queue-pills-scroll">
            {activeQueues.map((q) => {
              const isSelected = displayQueue?.id === q.id;
              const qTicket = q.ticketNumber
                ? (q.ticketNumber.toString().startsWith('A-') ? q.ticketNumber : `A-${q.ticketNumber}`)
                : 'A-47';
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => onSelectQueue && onSelectQueue(q.id)}
                  className={`queue-pill-btn ${isSelected ? 'active' : ''}`}
                >
                  <span className={`pill-dot ${q.position === 1 ? 'urgent' : ''}`} />
                  <span className="pill-name">#{qTicket} • {q.companyName?.split(' ')[0]}</span>
                  <span className="pill-pos">{q.position === 1 ? 'Sua Vez!' : `${q.position}º`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Cartão Principal da Senha Digital (ou Estado Vazio se sem filas) */}
      {displayQueue ? (
        <div className="ff-digital-ticket-card">
          {/* Header do Bilhete Digital */}
          <div className="ticket-card-header">
            <div className="ticket-place-info">
              <MapPin size={13} color="#a5b4fc" />
              <span className="ticket-place-name">{displayQueue.companyName || 'Clínica Bem Estar'}</span>
              <span className="ticket-place-separator">•</span>
              <span className="ticket-room-pill">{displayQueue.room || 'Consultório 04'}</span>
            </div>

            <div className={`ticket-live-badge ${displayQueue.position === 1 ? 'is-now' : ''}`}>
              <span className="pulse-indicator" />
              <span>{displayQueue.position === 1 ? 'SUA VEZ!' : 'AO VIVO'}</span>
            </div>
          </div>

          {/* Número da Senha em Destaque */}
          <div className="ticket-core-box">
            <span className="ticket-caption">SUA SENHA ATIVA</span>
            <div className="ticket-number-display">#{formattedTicket}</div>
            <div className="ticket-service-title">
              {displayQueue.serviceName || 'Consulta Cardiologia Clínica'}
            </div>
            <span className="ticket-doctor-tag">{attendantDisplay}</span>
          </div>

          {/* Stepper Visual de Progresso do Atendimento */}
          <div className="ticket-stepper-track">
            <div className="ticket-step done">
              <span className="step-circle">✓</span>
              <span className="step-label">Check-in</span>
            </div>
            <div className="step-line active" />
            <div className={`ticket-step ${displayQueue.position === 1 ? 'done' : 'active'}`}>
              <span className="step-circle">{displayQueue.position === 1 ? '✓' : '●'}</span>
              <span className="step-label">Na Fila</span>
            </div>
            <div className={`step-line ${displayQueue.position === 1 ? 'active' : ''}`} />
            <div className={`ticket-step ${displayQueue.position === 1 ? 'urgent active' : ''}`}>
              <span className="step-circle">{displayQueue.position === 1 ? '●' : '○'}</span>
              <span className="step-label">Atendimento</span>
            </div>
          </div>

          {/* Métricas Principais da Fila */}
          <div className="ticket-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Posição</span>
              <span className="metric-value metric-pos-highlight">
                {displayQueue.position === 1 ? 'Sua Vez!' : `${displayQueue.position}º lugar`}
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-label">Na Frente</span>
              <span className="metric-value">
                {displayQueue.position > 1
                  ? `${displayQueue.position - 1} ${displayQueue.position - 1 === 1 ? 'pessoa' : 'pessoas'}`
                  : 'Você é o 1º'}
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-label">Previsão</span>
              <span className="metric-value">
                {displayQueue.estimatedWaitText || '18-22 min'}
              </span>
            </div>
          </div>

          {/* Linha de Ações Imediatas do Bilhete */}
          <div className="ticket-actions-row">
            <button
              type="button"
              className="ticket-btn zap"
              onClick={() => handleOpenWhatsApp(displayQueue)}
              title="Acompanhar e receber chamadas no WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              className="ticket-btn push"
              onClick={handleTriggerPushNotification}
              title="Testar Notificação Sonora e Push"
            >
              <Bell size={14} />
              <span>Notificar</span>
            </button>

            <button
              type="button"
              className="ticket-btn secondary"
              onClick={() => handleAskMoreTime(displayQueue.id)}
              title="Pedir tolerância de +5 min sem perder a vez"
            >
              <Clock size={14} />
              <span>+5 min</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="ff-empty-ticket-card">
          <div className="empty-ticket-icon">
            <Ticket size={28} />
          </div>
          <h3>Nenhuma Senha Ativa</h3>
          <p>
            Você não está em nenhuma fila no momento. Aponte a câmera para um totem ou explore os estabelecimentos parceiros.
          </p>
          <div className="empty-ticket-btns">
            <button
              type="button"
              className="ff-primary-btn"
              onClick={onOpenQrScanner}
            >
              <QrCode size={14} />
              <span>Ler QR Totem</span>
            </button>
            <button
              type="button"
              className="ff-secondary-btn"
              onClick={() => onNavigateTab && onNavigateTab('explore')}
            >
              <Search size={14} />
              <span>Explorar Locais</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Previsão Estimada por IA com Equalizador de Ritmo (quando há fila) */}
      {displayQueue && (
        <div className="ff-forecast-card">
          <div className="ff-forecast-header">
            <div className="ff-forecast-title-group">
              <Clock size={14} className="ff-forecast-icon" />
              <span className="ff-forecast-title">Previsão Estimada por IA</span>
            </div>
            <span className="ff-forecast-confidence">96% precisão</span>
          </div>

          <div className="ff-forecast-main">
            <div className="ff-forecast-time">
              {displayQueue.estimatedWaitText || '18-22 min'}
            </div>
            <div className="ff-ai-wave-bars">
              <span className="wave-bar bar-1" />
              <span className="wave-bar bar-2" />
              <span className="wave-bar bar-3" />
              <span className="wave-bar bar-4" />
              <span className="wave-bar bar-5" />
            </div>
          </div>

          <div className="ff-forecast-footer">
            <span className="ff-forecast-dot-pulse" />
            <span>
              {displayQueue.staffNote || `Ritmo do(a) ${attendantDisplay}: ~7 min por consulta • Otimizado por IA`}
            </span>
          </div>
        </div>
      )}

      {/* 6. Acesso Rápido - 4 Recursos Essenciais */}
      <section className="ff-mob-section">
        <div className="section-head-clean">
          <h2 className="section-title-clean">Acesso Rápido</h2>
          <span className="section-badge-clean">4 recursos</span>
        </div>

        <div className="ff-quick-actions-grid">
          <div
            className="quick-action-card"
            onClick={onOpenQrScanner}
          >
            <div className="action-card-icon-box purple">
              <QrCode size={19} />
            </div>
            <div className="action-card-info">
              <h3 className="action-title">Ler QR Totem</h3>
              <p className="action-sub">Check-in no balcão</p>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => onNavigateTab && onNavigateTab('explore')}
          >
            <div className="action-card-icon-box emerald">
              <Search size={19} />
            </div>
            <div className="action-card-info">
              <h3 className="action-title">Explorar</h3>
              <p className="action-sub">Clínicas e serviços</p>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => onNavigateTab && onNavigateTab('notifications')}
          >
            <div className="action-card-icon-box blue">
              <Bell size={19} />
            </div>
            <div className="action-card-info">
              <h3 className="action-title">Central Alertas</h3>
              <p className="action-sub">WhatsApp e Avisos</p>
            </div>
          </div>

          <div
            className="quick-action-card"
            onClick={() => onNavigateTab && onNavigateTab('profile')}
          >
            <div className="action-card-icon-box amber">
              <ShieldCheck size={19} />
            </div>
            <div className="action-card-info">
              <h3 className="action-title">Meu Convênio</h3>
              <p className="action-sub">Unimed Nacional</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Benefício na Espera (Parceiro Exclusivo) */}
      <div className="ff-perk-banner-card">
        <div className="perk-logo-circle">
          <Coffee size={22} />
        </div>
        <div className="perk-content">
          <h3 className="perk-title">Café Havanna Paulista</h3>
          <p className="perk-desc">15% OFF na sua espera • 40m a pé</p>
          <div className="perk-rating-row">
            <span className="perk-stars">★★★★★</span>
            <span className="perk-score">5.0 (420 avaliações)</span>
          </div>
        </div>
        <button
          type="button"
          className="perk-claim-btn"
          onClick={() => showToast('☕ Cupom ativado! Apresente o bilhete da senha no caixa do Café Havanna.')}
          title="Resgatar 15% OFF"
        >
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 8. Rodapé de Sincronização ao Vivo via WebSockets */}
      <div className="ff-phone-live-footer">
        <Sparkles size={13} className="sparkle-spin" />
        <span>Sincronizado via WebSockets com a recepção</span>
      </div>
    </div>
  );
}
