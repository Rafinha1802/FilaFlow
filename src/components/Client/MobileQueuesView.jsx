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
  Plus
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

  return (
    <div className="ff-mob-clean-view">
      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Gerenciamento</span>
          <h2 className="view-maintitle">Suas Senhas</h2>
        </div>
        <button 
          className="btn-icon-soft" 
          onClick={onOpenQrScanner} 
          title="Escanear QR Totem"
        >
          <QrCode size={18} />
        </button>
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
          {activeQueues.length > 0 ? (
            activeQueues.map((q) => {
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

                  {/* Ações em Botões Pílula (Só pode pedir +5 min quando já estiver na fila do médico) */}
                  <div className="ticket-card-actions">
                    {q.isCheckedInWithSecretary && (
                      <button 
                        className="clean-pill-btn soft"
                        onClick={() => onClientAskMoreTime(q.id)}
                        title="Pedir tolerância de +5 min"
                        style={{ flex: 1 }}
                      >
                        <Clock size={14} />
                        <span>Pedir +5 min</span>
                      </button>
                    )}

                    <button 
                      className="btn-icon-soft"
                      title="Exibir QR Code para o balcão"
                      onClick={() => setShowPersonalQr(showPersonalQr === q.id ? null : q.id)}
                    >
                      <QrCode size={16} />
                    </button>

                    <button 
                      className="btn-icon-soft danger"
                      title="Desistir da fila"
                      onClick={() => onRemoveQueue(q.id)}
                    >
                      <Trash2 size={16} />
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
              <h4 className="empty-state-title">Nenhuma fila ativa</h4>
              <p className="empty-state-sub">
                Explore estabelecimentos da sua região ou aponte a câmera para um totem presencial.
              </p>
              <div className="empty-state-actions">
                <button className="clean-pill-btn primary" onClick={onOpenQrScanner}>
                  <QrCode size={15} />
                  <span>Escanear Totem</span>
                </button>
                <button className="clean-pill-btn soft" onClick={onOpenSearch}>
                  <Plus size={15} />
                  <span>Buscar Locais</span>
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
              <strong>Economia com o FilaFlow: 64% de tempo poupado</strong>
              <p>A IA evitou mais de 45 minutos de permanência em salas de espera este mês.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
