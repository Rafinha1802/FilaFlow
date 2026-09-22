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
  onApproveReceptionCheckin,
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
            <div className="ff-mob-status-pill">
              <span className="ff-live-pulse-dot"></span>
              <span className="pill-txt">GPS Ativo</span>
              <span className="pill-bullet">•</span>
              <Sparkles size={10} color="#7c3aed" />
              <span className="pill-txt purple">IA Live</span>
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
            title="Escanear Totem de Senha"
          >
            <QrCode size={17} />
          </button>
        </div>
      </div>

      {/* 2. Resumo de Métricas Pessoais Inteligentes */}
      <div className="ff-mob-metrics-grid">
        {/* Card 1: Tempo Economizado */}
        <div className="ff-mob-metric-card highlight">
          <div className="metric-top-row">
            <span className="metric-icon-box purple">
              <Clock size={13} />
            </span>
            <span className="metric-trend-badge purple">+35m</span>
          </div>
          <div className="metric-value">1h 45m</div>
          <div className="metric-label">Economizado</div>
          <div className="metric-footnote">Tempo salvo hoje</div>
        </div>

        {/* Card 2: Filas Ativas */}
        <div className="ff-mob-metric-card">
          <div className="metric-top-row">
            <span className="metric-icon-box emerald">
              <Zap size={13} />
            </span>
            <span className="metric-trend-badge emerald">Ativas</span>
          </div>
          <div className="metric-value">{activeQueues.length}</div>
          <div className="metric-label">Filas Ativas</div>
          <div className="metric-footnote">
            {activeQueues.length === 1 ? '1 atendimento' : `${activeQueues.length} simultâneos`}
          </div>
        </div>

        {/* Card 3: Precisão IA */}
        <div className="ff-mob-metric-card">
          <div className="metric-top-row">
            <span className="metric-icon-box blue">
              <Sparkles size={13} />
            </span>
            <span className="metric-trend-badge blue">98%</span>
          </div>
          <div className="metric-value">98.4%</div>
          <div className="metric-label">Precisão IA</div>
          <div className="metric-footnote">Tempo real</div>
        </div>
      </div>

      {/* 3. Próximo Atendimento em Destaque (Spotlight) */}
      {urgentQueue && (
        urgentQueue.status === 'reception_waiting' ? (
          <div className="ff-mob-spotlight-card" style={{ border: '1.5px solid #f59e0b', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}>
            <div className="spotlight-top-badge" style={{ background: '#d97706', color: 'white' }}>
              <Clock size={12} />
              <span>ETAPA 1: FILA DE ESPERA DA RECEPÇÃO</span>
            </div>

            <div className="spotlight-body">
              <div className="spotlight-info">
                <h3 className="spotlight-business" style={{ color: '#78350f' }}>{urgentQueue.companyName}</h3>
                <p className="spotlight-service" style={{ color: '#92400e', fontWeight: 700 }}>
                  {urgentQueue.serviceName} • {urgentQueue.insuranceName || 'Convênio'}
                </p>
                <div className="spotlight-location" style={{ color: '#b45309' }}>
                  <MapPin size={12} />
                  <span>Balcão de Recepção • Apresente documento ou aguarde conferência</span>
                </div>
              </div>

              <div className="spotlight-timer-box" style={{ background: '#ffffff', borderColor: '#fcd34d' }}>
                <span className="timer-label" style={{ color: '#d97706' }}>TRIAGEM</span>
                <div className="timer-val" style={{ color: '#b45309', fontSize: 15 }}>Aguardando Check-in</div>
                <span className="timer-pos" style={{ color: '#92400e' }}>{urgentQueue.position}º na recepção</span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: '10px 14px',
              margin: '4px 14px 12px',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 800 }}>
                <CheckCircle2 size={15} color="#16a34a" />
                <span>1. QR Code</span>
              </div>
              <span style={{ color: '#cbd5e1' }}>➔</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#b45309', fontWeight: 800 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span>2. Check-in Recepção</span>
              </div>
              <span style={{ color: '#cbd5e1' }}>➔</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontWeight: 600 }}>
                <span>3. Fila do Médico</span>
              </div>
            </div>

            <div className="spotlight-action-row">
              <button 
                className="ff-spotlight-btn primary"
                onClick={() => handleImOnMyWay(urgentQueue.id)}
                style={{ background: '#d97706' }}
              >
                <Navigation size={14} />
                <span>Estou no Balcão</span>
              </button>
              {onApproveReceptionCheckin && (
                <button 
                  className="ff-spotlight-btn secondary"
                  onClick={onApproveReceptionCheckin}
                  title="Simular recepcionista aprovando e enviando para o médico"
                  style={{ borderColor: '#d97706', color: '#92400e' }}
                >
                  <CheckCircle2 size={14} color="#16a34a" />
                  <span>Simular Aprovação</span>
                </button>
              )}
            </div>
          </div>
        ) : (
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
                  <span>{urgentQueue.room || 'Consultório 04'} • ~350m a pé (5 min)</span>
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
        )
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
        currentQueue.status === 'reception_waiting' ? (
          <div className="ff-mob-pass-card" style={{ border: '2px solid #f59e0b', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.15)' }}>
            <div className="pass-card-head" style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }}>
              <div>
                <div className="pass-category-tag" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                  Etapa 1 de 2 • Fila da Recepção
                </div>
                <h4 className="pass-company-name">{currentQueue.companyName}</h4>
                <div className="pass-unit-info">
                  {currentQueue.serviceName} • {currentQueue.insuranceName || 'Convênio'}
                </div>
              </div>
              <div className="pass-head-right">
                <span className="pass-pos-chip" style={{ background: '#d97706', color: 'white' }}>
                  {currentQueue.position}º na Recepção
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
                <span className="core-label">CHEGADA / TRIAGEM</span>
                <div className="core-ticket-num" style={{ fontSize: 24, color: '#d97706' }}>TRIAGEM</div>
                <span className="core-user-name">{currentQueue.userName || 'Rafael Silva'} (Você)</span>
              </div>

              <div className="pass-core-divider">
                <div className="divider-notch top"></div>
                <div className="divider-dash"></div>
                <div className="divider-notch bottom"></div>
              </div>

              <div className="pass-core-col right">
                <span className="core-label">ETAPA ATUAL</span>
                <div className="core-wait-time" style={{ fontSize: 16, color: '#b45309' }}>Check-in & Guia</div>
                <div className="core-ai-status">
                  <span className="ai-dot" style={{ background: '#f59e0b' }}></span>
                  <span>Balcão da Recepção</span>
                </div>
              </div>
            </div>

            {/* Stepper info box */}
            <div style={{
              margin: '12px 16px 0',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#faf5ff',
              border: '1px solid #e9d5ff',
              fontSize: 12,
              color: '#6b21a8'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, marginBottom: 4 }}>
                <ShieldCheck size={16} color="#7c3aed" />
                <span>Aguardando Validação da Recepção</span>
              </div>
              <p style={{ margin: 0, color: '#7e22ce', lineHeight: 1.45, fontSize: 11 }}>
                Seus dados foram enviados para o balcão. A equipe está conferindo sua carteirinha e documentos. Assim que aprovado, você receberá a senha oficial para a <strong>Fila do Médico</strong>.
              </p>
            </div>

            <div className="pass-card-footer" style={{ marginTop: 12 }}>
              <button 
                className="pass-btn primary"
                onClick={() => {
                  handleImOnMyWay(currentQueue.id);
                  showToast('Aviso enviado ao balcão: "Paciente no local!"');
                }}
                style={{ background: '#7c3aed' }}
              >
                <Navigation size={14} />
                <span>Estou no Balcão</span>
              </button>

              {onApproveReceptionCheckin && (
                <button 
                  className="pass-btn secondary"
                  onClick={() => {
                    onApproveReceptionCheckin();
                    showToast('Simulando aprovação de check-in pela recepção...');
                  }}
                  style={{ borderColor: '#7c3aed', color: '#7c3aed' }}
                  title="Aprovar check-in agora para testar o envio para a fila do médico"
                >
                  <CheckCircle2 size={14} color="#7c3aed" />
                  <span>Aprovar Check-in</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="ff-mob-pass-card">
            <div className="pass-card-head">
              <div>
                <div className="pass-category-tag">{currentQueue.category || 'Atendimento'}</div>
                <h4 className="pass-company-name">{currentQueue.companyName}</h4>
                <div className="pass-unit-info">{currentQueue.serviceName} • {currentQueue.room || 'Consultório 04'}</div>
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
        )
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
