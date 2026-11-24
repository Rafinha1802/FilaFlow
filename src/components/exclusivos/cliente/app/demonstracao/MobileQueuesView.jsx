import React, { useState } from 'react';
import {
  Clock,
  Navigation,
  Trash2,
  CheckCircle2,
  Star,
  QrCode,
  MapPin,
  Sparkles,
  Calendar,
  ChevronRight,
  Plus,
  MessageCircle,
  Bell,
  Share2,
  Send,
  Zap,
  AlertTriangle
} from 'lucide-react';

export default function MobileQueuesView({
  activeQueues,
  selectedQueueId,
  onSelectQueue,
  onRemoveQueue,
  onSecretaryCheckin,
  onClientImOnMyWay,
  onClientAskMoreTime,
  onApproveReceptionCheckin,
  onOpenSearch,
  onOpenQrScanner
}) {
  const [subTab, setSubTab] = useState('active'); // 'active' | 'history'
  const [showPersonalQr, setShowPersonalQr] = useState(null); // queueId
  const [filterQueueId, setFilterQueueId] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleShareWhatsApp = (q) => {
    const text = encodeURIComponent(`Olá! Estou na fila da ${q.companyName} (${q.room || 'Consultório'}) com a senha #${q.ticketNumber}. Minha previsão de atendimento é ${q.estimatedWaitText}. Acompanhe em tempo real pelo link do FilaFlow: https://filaflow.com/f/${q.ticketNumber}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    showToast(`📲 Link da senha #${q.ticketNumber} preparado para compartilhamento no WhatsApp!`);
  };

  const handleTrackWhatsApp = (q) => {
    showToast(`🟢 Notificações no WhatsApp ativadas para #${q.ticketNumber}! O bot FilaFlow enviará atualizações.`);
  };

  const handleSimulatePush = (q) => {
    // Web Notification API nativa se permitida
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`FilaFlow: Sua vez está chegando!`, {
          body: `Senha #${q.ticketNumber} na ${q.companyName}. Faltam poucos minutos.`,
          icon: '/favicon.ico'
        });
      } catch (e) {}
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    showToast(`🔔 PUSH NOTIFICATION: Senha #${q.ticketNumber} na ${q.companyName} chamada! Dirija-se à sala.`);
  };

  const pastAttendances = [
    {
      id: 'past-1',
      companyName: 'Barbearia Dom Pedro',
      service: 'Combo Corte + Barba VIP',
      date: 'Ontem às 16:30',
      waitTime: '14 min',
      rating: 5,
      ticket: '#22',
      category: 'Barbearia'
    },
    {
      id: 'past-2',
      companyName: 'Cartório 5º Ofício de Notas',
      service: 'Reconhecimento de Firma Presencial',
      date: '02/09 às 11:15',
      waitTime: '18 min',
      rating: 5,
      ticket: '#51',
      category: 'Cartório'
    },
    {
      id: 'past-3',
      companyName: 'Studio Beleza & Arte',
      service: 'Escova Modelada & Lavagem',
      date: '28/08 às 15:00',
      waitTime: '22 min',
      rating: 4,
      ticket: '#29',
      category: 'Beleza'
    }
  ];

  const displayedQueues = filterQueueId === 'all' 
    ? activeQueues 
    : activeQueues.filter(q => q.id === filterQueueId);

  return (
    <div className="ff-mob-clean-view">
      {/* Toast flutuante */}
      {toastMessage && (
        <div style={{
          position: 'sticky',
          top: 10,
          zIndex: 999,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '10px 16px',
          borderRadius: 12,
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
          fontSize: 12.5,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Gerenciamento</span>
          <h2 className="view-maintitle">Suas Senhas ({activeQueues.length})</h2>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn-icon-soft"
            onClick={onOpenQrScanner}
            title="Escanear QR Totem"
          >
            <QrCode size={18} />
          </button>
        </div>
      </div>

      {/* Segmented Pill Tabs estilo Screen 2 */}
      <div className="clean-segmented-pills">
        <button
          className={`segmented-pill-btn ${subTab === 'active' ? 'active' : ''}`}
          onClick={() => setSubTab('active')}
        >
          <span>Filas Ativas</span>
          <span className="clean-count-badge">{activeQueues.length}</span>
        </button>
        <button
          className={`segmented-pill-btn ${subTab === 'history' ? 'active' : ''}`}
          onClick={() => setSubTab('history')}
        >
          <span>Histórico</span>
          <span className="clean-count-badge">{pastAttendances.length}</span>
        </button>
      </div>

      {subTab === 'active' ? (
        <div className="clean-queues-list">
          {/* Seletor Rápido de Múltiplas Filas */}
          {activeQueues.length > 1 && (
            <div style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              padding: '2px 2px 10px 2px',
              scrollbarWidth: 'none'
            }}>
              <button
                type="button"
                onClick={() => setFilterQueueId('all')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: filterQueueId === 'all' ? 800 : 600,
                  border: filterQueueId === 'all' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                  background: filterQueueId === 'all' ? '#7c3aed' : '#ffffff',
                  color: filterQueueId === 'all' ? '#ffffff' : '#64748b',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                Todas ({activeQueues.length})
              </button>
              {activeQueues.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setFilterQueueId(q.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: filterQueueId === q.id ? 800 : 600,
                    border: filterQueueId === q.id ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                    background: filterQueueId === q.id ? '#f5f3ff' : '#ffffff',
                    color: filterQueueId === q.id ? '#6d28d9' : '#64748b',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>#{q.ticketNumber} • {q.companyName.split(' ')[0]}</span>
                  <span style={{
                    background: q.position <= 2 ? '#10b981' : '#cbd5e1',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 800
                  }}>
                    {q.position === 1 ? 'Sua vez!' : `${q.position}º`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Detector Inteligente de Conflito de Horário IA */}
          {activeQueues.length > 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '1.5px solid #fde68a',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 13, color: '#92400e', display: 'block', marginBottom: 2 }}>
                  Gestão Inteligente de Múltiplas Filas
                </strong>
                <p style={{ margin: 0, fontSize: 11.5, color: '#b45309', lineHeight: 1.4 }}>
                  Você está em {activeQueues.length} filas simultâneas. A IA ajusta automaticamente suas previsões de chamada para evitar que você perca a vez em nenhum estabelecimento.
                </p>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClientAskMoreTime && activeQueues[1]) {
                        onClientAskMoreTime(activeQueues[1].id);
                      }
                      showToast('⏱️ Conflito de agenda resolvido! +10 min ajustados na segunda fila.');
                    }}
                    style={{
                      background: '#d97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '5px 10px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Ajustar com IA (+10 min)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Filas Ativas */}
          {displayedQueues.length > 0 ? (
            displayedQueues.map((q) => {
              const isReception = q.status === 'reception_waiting';
              const isUrgent = q.position <= 2;
              return (
                <div
                  key={q.id}
                  className={`clean-ticket-card ${isReception ? 'reception-theme' : isUrgent ? 'urgent' : ''}`}
                >
                  <div className="ticket-card-top">
                    <div className="ticket-top-info">
                      <span className={`clean-chip-badge ${isReception ? 'amber' : 'purple'}`}>
                        {isReception ? 'Etapa 1 • Recepção' : q.category || 'Atendimento'}
                      </span>
                      <h3 className="ticket-company-title">{q.companyName}</h3>
                      <p className="ticket-service-sub">{q.serviceName}</p>
                      <div className="ticket-location-line">
                        <MapPin size={12} />
                        <span>{isReception ? 'Balcão da Recepção (Check-in)' : `${q.room || 'Consultório 04'} • ${q.attendantName || 'Equipe'}`}</span>
                      </div>
                    </div>

                    <div className="ticket-top-number-block">
                      <span className="ticket-number-big">
                        {isReception ? 'TRIAGEM' : `#${q.ticketNumber}`}
                      </span>
                      <span className={`ticket-pos-pill ${isUrgent ? 'urgent' : ''}`}>
                        {isReception ? `${q.position}º na Recepção` : q.position === 1 ? 'Sua Vez!' : `${q.position}º na fila`}
                      </span>
                    </div>
                  </div>

                  {/* Previsão com fundo pastel */}
                  <div className="ticket-wait-pill-box">
                    <div className="wait-pill-left">
                      <Clock size={15} color="#6366f1" />
                      <div>
                        <span className="wait-label">Tempo Estimado:</span>
                        <strong className="wait-text">{q.estimatedWaitText}</strong>
                      </div>
                    </div>
                    <div className="wait-status-chip">
                      <Sparkles size={13} color="#10b981" />
                      <span>{q.statusDetail || 'Fluxo dinâmico'}</span>
                    </div>
                  </div>

                  {/* WhatsApp Integration & Push Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '8px 12px',
                    margin: '10px 0 6px 0',
                    fontSize: 11.5
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 700 }}>
                      <MessageCircle size={15} color="#16a34a" />
                      <span>WhatsApp Ativo</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleTrackWhatsApp(q)}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#059669',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        title="Receber avisos pelo WhatsApp"
                      >
                        Acompanhar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(q)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                        title="Compartilhar com família/acompanhante"
                      >
                        <Share2 size={11} />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>

                  {/* Ações em Botões Pílula */}
                  <div className="ticket-card-actions">
                    {/* Botão A Caminho */}
                    <button
                      className="clean-pill-btn soft"
                      onClick={() => {
                        if (onClientImOnMyWay) onClientImOnMyWay(q.id);
                        showToast('🚗 Aviso enviado: "Estou a caminho! Chego em 5 min"');
                      }}
                      title="Avisar que já está se deslocando"
                      style={{ flex: 1 }}
                    >
                      <Navigation size={13} />
                      <span>A Caminho</span>
                    </button>

                    {/* Botão Pedir +5 min */}
                    {q.isCheckedInWithSecretary && (
                      <button
                        className="clean-pill-btn soft"
                        onClick={() => {
                          if (onClientAskMoreTime) onClientAskMoreTime(q.id);
                          showToast('⏱️ Previsão recalculada: +5 min concedidos pela IA');
                        }}
                        title="Pedir tolerância de +5 min"
                        style={{ flex: 1 }}
                      >
                        <Clock size={13} />
                        <span>+5 min</span>
                      </button>
                    )}

                    {/* Botão Testar Push Notification */}
                    <button
                      className="btn-icon-soft"
                      title="Testar Notificação Push no celular"
                      onClick={() => handleSimulatePush(q)}
                    >
                      <Bell size={15} />
                    </button>

                    {/* Botão Exibir QR Code */}
                    <button
                      className="btn-icon-soft"
                      title="Exibir QR Code para o balcão"
                      onClick={() => setShowPersonalQr(showPersonalQr === q.id ? null : q.id)}
                    >
                      <QrCode size={15} />
                    </button>

                    {/* Botão Sair da Fila */}
                    <button
                      className="btn-icon-soft danger"
                      title="Desistir da fila"
                      onClick={() => {
                        if (confirm(`Deseja sair da fila de ${q.companyName}?`)) {
                          onRemoveQueue(q.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* QR Code expandido */}
                  {showPersonalQr === q.id && (
                    <div className="clean-qr-drawer">
                      <div className="qr-box-clean">
                        <div className="mock-qr-code">
                          <QrCode size={64} color="#1e1b4b" />
                        </div>
                        <div className="qr-info-clean">
                          <strong>Apresente ao Balcão</strong>
                          <span>Senha #{q.ticketNumber} • Rafael Silva</span>
                          <small>Token: FF-{q.ticketNumber}-{Date.now().toString().slice(-4)}</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="clean-empty-state-card">
              <div className="empty-state-squircle sky">
                <Clock size={32} />
              </div>
              <h4 className="empty-state-title">Nenhuma fila nesta categoria</h4>
              <p className="empty-state-sub">
                Selecione "Todas" ou busque um estabelecimento para entrar na fila.
              </p>
              <div className="empty-state-actions">
                <button className="clean-pill-btn soft" onClick={() => setFilterQueueId('all')}>
                  Ver Todas as Filas
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Histórico de Atendimentos */
        <div className="clean-history-list">
          {pastAttendances.map((item) => (
            <div key={item.id} className="clean-history-card">
              <div className="history-card-top">
                <div>
                  <span className="clean-chip-badge lavender">{item.category}</span>
                  <h4 className="history-company-name">{item.companyName}</h4>
                  <p className="history-service-name">{item.service}</p>
                </div>
                <div className="history-ticket-squircle">
                  <span>{item.ticket}</span>
                </div>
              </div>

              <div className="history-card-bottom">
                <div className="history-meta-group">
                  <div className="meta-item">
                    <Calendar size={12} />
                    <span>{item.date}</span>
                  </div>
                  <div className="meta-item success">
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>Espera: {item.waitTime}</span>
                  </div>
                </div>

                <div className="history-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      fill={i < item.rating ? '#f59e0b' : 'none'}
                      color={i < item.rating ? '#f59e0b' : '#cbd5e1'}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Banner de Impacto */}
          <div className="clean-impact-banner mint">
            <div className="impact-icon-squircle mint">
              <Sparkles size={18} />
            </div>
            <div className="impact-banner-text">
              <strong>Economia com o TemFyla: 64% de tempo poupado</strong>
              <p>A IA evitou mais de 45 minutos de permanência em salas de espera este mês.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
