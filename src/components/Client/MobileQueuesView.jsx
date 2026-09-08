import React, { useState } from 'react';
import { 
  Clock, 
  Navigation, 
  Trash2, 
  Share2, 
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
  onClientImOnMyWay,
  onClientAskMoreTime,
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
      ticket: '#22'
    },
    {
      id: 'past-2',
      companyName: 'Cartório 5º Ofício de Notas',
      service: 'Reconhecimento de Firma Presencial',
      date: '02/09 às 11:15',
      waitTime: '18 min',
      rating: 5,
      ticket: '#51'
    },
    {
      id: 'past-3',
      companyName: 'Studio Beleza & Arte',
      service: 'Escova Modelada & Lavagem',
      date: '28/08 às 15:00',
      waitTime: '22 min',
      rating: 4,
      ticket: '#29'
    }
  ];

  return (
    <div className="ff-mob-queues-view">
      {/* Top Segmented Sub-tab */}
      <div className="ff-mob-subtabs-wrap">
        <button 
          className={`ff-mob-subtab-btn ${subTab === 'active' ? 'active' : ''}`}
          onClick={() => setSubTab('active')}
        >
          <span>Filas Ativas</span>
          <span className="subtab-counter">{activeQueues.length}</span>
        </button>
        <button 
          className={`ff-mob-subtab-btn ${subTab === 'history' ? 'active' : ''}`}
          onClick={() => setSubTab('history')}
        >
          <span>Histórico de Atendimentos</span>
          <span className="subtab-counter">{pastAttendances.length}</span>
        </button>
      </div>

      {subTab === 'active' ? (
        <div className="ff-mob-queues-list">
          {activeQueues.length > 0 ? (
            activeQueues.map((q) => {
              const isUrgent = q.position <= 2;
              return (
                <div key={q.id} className={`ff-mob-full-ticket-card ${isUrgent ? 'urgent' : ''}`}>
                  <div className="full-ticket-top">
                    <div>
                      <div className="full-ticket-cat">{q.category || 'Atendimento Geral'}</div>
                      <h4 className="full-ticket-company">{q.companyName}</h4>
                      <div className="full-ticket-service">{q.serviceName}</div>
                      <div className="full-ticket-room">
                        <MapPin size={12} />
                        <span>{q.room || 'Recepção'} • {q.attendantName || 'Equipe'}</span>
                      </div>
                    </div>

                    <div className="full-ticket-meta">
                      <div className="full-ticket-num">#{q.ticketNumber}</div>
                      <span className={`full-ticket-pos ${isUrgent ? 'urgent' : ''}`}>
                        {q.position === 1 ? 'Sua Vez!' : `${q.position}º na fila`}
                      </span>
                    </div>
                  </div>

                  <div className="full-ticket-middle">
                    <div className="middle-time-block">
                      <span className="time-block-label">Previsão por IA:</span>
                      <span className="time-block-val">{q.estimatedWaitText}</span>
                    </div>
                    <div className="middle-status-chip">
                      <Sparkles size={12} color="#7c3aed" />
                      <span>{q.statusDetail || 'Fluxo dinâmico'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="full-ticket-actions">
                    <button 
                      className="ticket-btn-action primary"
                      onClick={() => onClientImOnMyWay(q.id)}
                    >
                      <Navigation size={13} />
                      <span>Estou a Caminho</span>
                    </button>
                    <button 
                      className="ticket-btn-action secondary"
                      onClick={() => onClientAskMoreTime(q.id)}
                    >
                      <Clock size={13} />
                      <span>+5 min</span>
                    </button>
                    <button 
                      className="ticket-btn-action icon-only"
                      title="Exibir QR Code para o totem/balcão"
                      onClick={() => setShowPersonalQr(showPersonalQr === q.id ? null : q.id)}
                    >
                      <QrCode size={15} />
                    </button>
                    <button 
                      className="ticket-btn-action icon-only danger"
                      title="Desistir da fila"
                      onClick={() => onRemoveQueue(q.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Expanded Personal QR modal/drawer */}
                  {showPersonalQr === q.id && (
                    <div className="personal-qr-drawer">
                      <div className="qr-box">
                        <div className="mock-qr-code">
                          <QrCode size={64} color="#1e1b4b" />
                        </div>
                        <div className="qr-info">
                          <strong>Apresente ao Atendente</strong>
                          <span>Senha #{q.ticketNumber} • Rafael Silva</span>
                          <small>Token criptografado: FF-{q.ticketNumber}-{Date.now().toString().slice(-4)}</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="ff-mob-empty-queues">
              <Clock size={36} color="#94a3b8" />
              <h4>Você não está em nenhuma fila no momento</h4>
              <p>Explore estabelecimentos da sua região ou aponte a câmera para um totem presencial.</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="ff-mob-empty-btn" onClick={onOpenQrScanner}>
                  <QrCode size={15} />
                  <span>Escanear QR</span>
                </button>
                <button className="ff-mob-empty-btn secondary" onClick={onOpenSearch}>
                  <Plus size={15} />
                  <span>Buscar Locais</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History sub-tab */
        <div className="ff-mob-history-list">
          {pastAttendances.map((item) => (
            <div key={item.id} className="history-card">
              <div className="history-card-top">
                <div>
                  <h4 className="history-company">{item.companyName}</h4>
                  <p className="history-service">{item.service}</p>
                </div>
                <div className="history-ticket-badge">{item.ticket}</div>
              </div>

              <div className="history-card-bottom">
                <div className="history-meta">
                  <div className="history-date">
                    <Calendar size={12} />
                    <span>{item.date}</span>
                  </div>
                  <div className="history-waited">
                    <CheckCircle2 size={12} color="#10b981" />
                    <span>Tempo de espera: {item.waitTime}</span>
                  </div>
                </div>

                <div className="history-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      fill={i < item.rating ? '#f59e0b' : 'none'} 
                      color={i < item.rating ? '#f59e0b' : '#cbd5e1'} 
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="history-summary-box">
            <Sparkles size={16} color="#7c3aed" />
            <div>
              <strong>Tempo Médio de Espera Real: 18 min</strong>
              <p>A IA do FilaFlow reduziu sua permanência em filas em 64% este mês.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
