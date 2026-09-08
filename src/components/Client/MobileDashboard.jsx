import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  QrCode, 
  Search, 
  TrendingUp, 
  Coffee, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  MapPin, 
  Zap, 
  Share2, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Bell
} from 'lucide-react';

export default function MobileDashboard({
  activeQueues,
  selectedQueueId,
  onSelectQueue,
  onOpenQrScanner,
  onOpenSearch,
  onRemoveQueue,
  onClientImOnMyWay,
  onClientAskMoreTime,
  hasConflict,
  onDismissConflict,
  onNavigateTab
}) {
  const [showQueueList, setShowQueueList] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find currently selected queue or first queue
  const currentQueue = activeQueues.find((q) => q.id === selectedQueueId) || activeQueues[0] || null;

  // Find most urgent queue (lowest wait time or lowest position)
  const urgentQueue = activeQueues.length > 0 
    ? [...activeQueues].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
    : null;

  const handleImOnMyWay = (id) => {
    onClientImOnMyWay(id || currentQueue?.id);
    showToast('🚀 Aviso enviado ao atendente: "Estou a caminho!"');
  };

  const handleAskMoreTime = (id) => {
    onClientAskMoreTime(id || currentQueue?.id);
    showToast('⏱️ Previsão recalculada: +5 min concedidos pela IA.');
  };

  return (
    <div className="ff-mob-dashboard">
      {/* Toast popup */}
      {toastMessage && (
        <div className="ff-mob-toast">
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header do Usuário & Status */}
      <div className="ff-mob-header">
        <div className="ff-mob-user-info">
          <div className="ff-mob-avatar">
            <span>R</span>
            <span className="ff-mob-avatar-badge" title="GPS e Notificações Ativas"></span>
          </div>
          <div>
            <div className="ff-mob-greeting">
              <span>Olá, Rafael</span>
              <span className="ff-mob-wave">👋</span>
            </div>
            <div className="ff-mob-substatus">
              <span className="ff-live-pulse-dot"></span>
              <span>GPS Ativo • Conectado à IA</span>
            </div>
          </div>
        </div>

        <div className="ff-mob-header-actions">
          <button 
            className="ff-mob-btn-icon" 
            onClick={() => onNavigateTab && onNavigateTab('notifications')}
            title="Ver notificações"
          >
            <Bell size={17} />
            <span className="ff-mob-notif-badge">2</span>
          </button>
          <button 
            className="ff-mob-btn-icon purple" 
            onClick={onOpenQrScanner}
            title="Escanear Totem"
          >
            <QrCode size={17} />
          </button>
        </div>
      </div>

      {/* 2. Resumo de Métricas Pessoais Inteligentes */}
      <div className="ff-mob-metrics-grid">
        <div className="ff-mob-metric-card highlight">
          <div className="metric-header">
            <span className="metric-icon-box purple">
              <Clock size={14} />
            </span>
            <span className="metric-label">Economizado</span>
          </div>
          <div className="metric-value">1h 45m</div>
          <div className="metric-footnote">Fora de salas de espera</div>
        </div>

        <div className="ff-mob-metric-card">
          <div className="metric-header">
            <span className="metric-icon-box emerald">
              <Zap size={14} />
            </span>
            <span className="metric-label">Filas Ativas</span>
          </div>
          <div className="metric-value">{activeQueues.length}</div>
          <div className="metric-footnote">
            {activeQueues.length === 1 ? '1 atendimento' : `${activeQueues.length} simultâneos`}
          </div>
        </div>

        <div className="ff-mob-metric-card">
          <div className="metric-header">
            <span className="metric-icon-box blue">
              <Sparkles size={14} />
            </span>
            <span className="metric-label">Precisão IA</span>
          </div>
          <div className="metric-value">98.4%</div>
          <div className="metric-footnote">Previsão em tempo real</div>
        </div>
      </div>

      {/* 3. Próximo Atendimento em Destaque (Spotlight) */}
      {urgentQueue && (
        <div className="ff-mob-spotlight-card">
          <div className="spotlight-top-badge">
            <Flame size={12} />
            <span>PRÓXIMO ATENDIMENTO DA SUA JORNADA</span>
          </div>

          <div className="spotlight-body">
            <div className="spotlight-info">
              <h3 className="spotlight-business">{urgentQueue.companyName}</h3>
              <p className="spotlight-service">{urgentQueue.serviceName}</p>
              <div className="spotlight-location">
                <MapPin size={12} />
                <span>{urgentQueue.room || 'Recepção Principal'} • ~350m a pé (5 min)</span>
              </div>
            </div>

            <div className="spotlight-timer-box">
              <span className="timer-label">SENHA #{urgentQueue.ticketNumber}</span>
              <div className="timer-val">{urgentQueue.estimatedWaitText}</div>
              <span className="timer-pos">{urgentQueue.position}º da fila</span>
            </div>
          </div>

          <div className="spotlight-action-row">
            <button 
              className="ff-spotlight-btn primary"
              onClick={() => handleImOnMyWay(urgentQueue.id)}
            >
              <Navigation size={14} />
              <span>Estou a Caminho</span>
            </button>
            <button 
              className="ff-spotlight-btn secondary"
              onClick={() => handleAskMoreTime(urgentQueue.id)}
            >
              <Clock size={14} />
              <span>Pedir +5 min</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Alerta de Conflito de Horário Inteligente (AI Schedule Conflict) */}
      {hasConflict && activeQueues.length > 1 && (
        <div className="ff-mob-conflict-card">
          <div className="conflict-icon-col">
            <AlertTriangle size={18} color="#d97706" />
          </div>
          <div className="conflict-text-col">
            <div className="conflict-title">Alerta de Choque de Horários (IA)</div>
            <div className="conflict-desc">
              Suas senhas em <strong>{activeQueues[0]?.companyName}</strong> e <strong>{activeQueues[1]?.companyName}</strong> devem chamar quase ao mesmo tempo!
            </div>
            <div className="conflict-actions">
              <button 
                className="conflict-btn-resolve"
                onClick={() => {
                  handleAskMoreTime(activeQueues[1]?.id);
                  onDismissConflict && onDismissConflict();
                }}
              >
                Adiar segunda fila em +5 min
              </button>
              <button 
                className="conflict-btn-dismiss"
                onClick={onDismissConflict}
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Seletor de Filas Ativas (Multi-filas Tabs) */}
      <div className="ff-mob-section-head">
        <div className="section-title-group">
          <h3 className="section-title">Minhas Senhas Ativas</h3>
          <span className="section-count">{activeQueues.length}</span>
        </div>
        <button 
          className="section-link-btn"
          onClick={onOpenSearch}
        >
          <Plus size={13} />
          <span>Nova Fila</span>
        </button>
      </div>

      <div className="ff-mob-queue-pills">
        {activeQueues.map((q) => {
          const isSelected = q.id === currentQueue?.id;
          return (
            <button
              key={q.id}
              className={`ff-mob-queue-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectQueue(q.id)}
            >
              <span className="pill-dot"></span>
              <span className="pill-name">{q.companyName}</span>
              <span className="pill-ticket">#{q.ticketNumber}</span>
            </button>
          );
        })}
      </div>

      {/* 6. Boarding Pass Digital da Fila Selecionada */}
      {currentQueue ? (
        <div className="ff-mob-pass-card">
          <div className="pass-card-head">
            <div>
              <div className="pass-category-tag">{currentQueue.category || 'Atendimento'}</div>
              <h4 className="pass-company-name">{currentQueue.companyName}</h4>
              <div className="pass-unit-info">{currentQueue.serviceName} • {currentQueue.room || 'Recepção'}</div>
            </div>
            <div className="pass-head-right">
              <span className="pass-pos-chip">
                {currentQueue.position === 1 ? '🟢 SUA VEZ!' : `${currentQueue.position}º na fila`}
              </span>
              <button 
                className="pass-cancel-btn"
                title="Desistir desta fila"
                onClick={() => onRemoveQueue(currentQueue.id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="pass-card-core">
            <div className="pass-core-col left">
              <span className="core-label">SUA SENHA</span>
              <div className="core-ticket-num">#{currentQueue.ticketNumber}</div>
              <span className="core-user-name">Rafael Silva (Você)</span>
            </div>

            <div className="pass-core-divider">
              <div className="divider-notch top"></div>
              <div className="divider-dash"></div>
              <div className="divider-notch bottom"></div>
            </div>

            <div className="pass-core-col right">
              <span className="core-label">TEMPO ESTIMADO</span>
              <div className="core-wait-time">{currentQueue.estimatedWaitText}</div>
              <div className="core-ai-status">
                <span className="ai-dot"></span>
                <span>Ritmo monitorado por IA</span>
              </div>
            </div>
          </div>

          <div className="pass-card-footer">
            <button 
              className="pass-btn primary"
              onClick={() => handleImOnMyWay(currentQueue.id)}
            >
              <Navigation size={14} />
              <span>Estou a Caminho</span>
            </button>

            <button 
              className="pass-btn secondary"
              onClick={() => handleAskMoreTime(currentQueue.id)}
            >
              <Clock size={14} />
              <span>Pedir +5 min</span>
            </button>
          </div>

          {/* Gaveta retrátil: Fluxo ao Vivo */}
          <div className="pass-flow-drawer">
            <button 
              className="flow-drawer-toggle"
              onClick={() => setShowQueueList(!showQueueList)}
            >
              <div className="flow-toggle-label">
                <Sparkles size={13} color="#7c3aed" />
                <span>Fluxo em tempo real ({currentQueue.aheadList?.length || 3} pessoas)</span>
              </div>
              {showQueueList ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showQueueList && currentQueue.aheadList && (
              <div className="flow-items-list">
                {currentQueue.aheadList.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flow-item ${item.isUser ? 'is-user' : item.status === 'Em atendimento' ? 'is-attending' : ''}`}
                  >
                    <div className="flow-item-left">
                      <span className="flow-item-ticket">{item.ticket}</span>
                      <span className="flow-item-name">{item.name}</span>
                    </div>
                    <span className="flow-item-status">{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="ff-mob-empty-queues">
          <QrCode size={36} color="#94a3b8" />
          <h4>Nenhuma fila ativa no momento</h4>
          <p>Aponte a câmera para um totem ou pesquise estabelecimentos próximos.</p>
          <button className="ff-mob-empty-btn" onClick={onOpenQrScanner}>
            <QrCode size={15} />
            <span>Escanear QR Code de Balcão</span>
          </button>
        </div>
      )}

      {/* 7. Radar de Vantagens e Locais na Espera (Nearby Perks) */}
      <div className="ff-mob-perks-section">
        <div className="perks-header">
          <div className="perks-title-group">
            <Coffee size={15} color="#d97706" />
            <h4 className="perks-title">Aproveite sua Espera nas Proximidades</h4>
          </div>
          <span className="perks-badge">Parceiros FilaFlow</span>
        </div>

        <div className="perks-carousel">
          <div className="perk-card">
            <div className="perk-card-top">
              <span className="perk-tag">☕ 15% OFF na cafeteria</span>
              <span className="perk-dist">40m a pé</span>
            </div>
            <div className="perk-business">Café Havanna Paulista</div>
            <div className="perk-desc">Apresente sua senha ativa da Clínica Vida e relaxe com Wi-Fi livre enquanto aguarda.</div>
            <div className="perk-footer">
              <span className="perk-promo-code">CUPOM: ESPERA15</span>
              <button 
                className="perk-action-btn"
                onClick={() => showToast('☕ Cupom copiado! Apresente no caixa do Café Havanna.')}
              >
                Usar Cupom
              </button>
            </div>
          </div>

          <div className="perk-card">
            <div className="perk-card-top">
              <span className="perk-tag">💊 Fila Expressa</span>
              <span className="perk-dist">120m a pé</span>
            </div>
            <div className="perk-business">Drogaria São Paulo</div>
            <div className="perk-desc">Avie suas receitas médicas com atendimento preferencial sincronizado com o FilaFlow.</div>
            <div className="perk-footer">
              <span className="perk-promo-code">ESPERA VIP</span>
              <button 
                className="perk-action-btn"
                onClick={() => showToast('💊 Balcão preferencial avisado!')}
              >
                Ativar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Grid de Ações Rápidas */}
      <div className="ff-mob-quick-grid">
        <button className="quick-grid-item" onClick={onOpenQrScanner}>
          <div className="quick-icon-wrap purple">
            <QrCode size={18} />
          </div>
          <span className="quick-title">Ler QR Totem</span>
          <span className="quick-sub">Check-in instantâneo</span>
        </button>

        <button className="quick-grid-item" onClick={onOpenSearch}>
          <div className="quick-icon-wrap blue">
            <Search size={18} />
          </div>
          <span className="quick-title">Buscar Fila</span>
          <span className="quick-sub">Clínicas e serviços</span>
        </button>

        <button className="quick-grid-item" onClick={() => onNavigateTab && onNavigateTab('explore')}>
          <div className="quick-icon-wrap emerald">
            <MapPin size={18} />
          </div>
          <span className="quick-title">Locais Perto</span>
          <span className="quick-sub">Menor tempo de fila</span>
        </button>

        <button className="quick-grid-item" onClick={() => onNavigateTab && onNavigateTab('queues')}>
          <div className="quick-icon-wrap amber">
            <Clock size={18} />
          </div>
          <span className="quick-title">Histórico</span>
          <span className="quick-sub">Senhas anteriores</span>
        </button>
      </div>
    </div>
  );
}
