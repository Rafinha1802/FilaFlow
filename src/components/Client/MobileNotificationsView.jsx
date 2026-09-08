import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function MobileNotificationsView({ onPlayChime }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'calls' | 'alerts'
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      type: 'call',
      title: '🔔 SUA VEZ SE APROXIMA!',
      message: 'Falta apenas 1 pessoa à sua frente na Clínica Vida (Consultório 04 - Dr. Carlos). Dirija-se à sala.',
      time: 'Agora mesmo',
      isUnread: true,
      tag: 'Chamada'
    },
    {
      id: 'n2',
      type: 'alert',
      title: '⚠️ Previsão Recalculada por IA',
      message: 'A consulta anterior no ExameLab demorou 5 minutos a mais. Seu tempo estimado foi ajustado com precisão.',
      time: 'Há 12 min',
      isUnread: true,
      tag: 'IA Preditiva'
    },
    {
      id: 'n3',
      type: 'system',
      title: '🚀 Status: A Caminho Registrado',
      message: 'A recepção do Dom Bistrô confirmou o recebimento do seu aviso de deslocamento.',
      time: 'Há 28 min',
      isUnread: false,
      tag: 'Deslocamento'
    },
    {
      id: 'n4',
      type: 'system',
      title: '✅ Check-in Confirmado',
      message: 'Sua senha #47 foi gerada com sucesso via QR Code. Acompanhe a estimativa ao vivo.',
      time: 'Há 45 min',
      isUnread: false,
      tag: 'Check-in'
    }
  ]);

  const filtered = notifications.filter((n) => {
    if (filter === 'calls') return n.type === 'call';
    if (filter === 'alerts') return n.type === 'alert';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="ff-mob-notif-view">
      {/* Top Bar with Chime Test */}
      <div className="notif-top-actions">
        <button 
          className="notif-test-sound-btn"
          onClick={onPlayChime}
          title="Ouvir som de chamada de senha"
        >
          <Volume2 size={14} />
          <span>Testar Sinal Sonoro</span>
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            className="notif-clean-btn"
            onClick={markAllAsRead}
            title="Marcar todas como lidas"
          >
            <CheckCheck size={14} />
          </button>
          <button 
            className="notif-clean-btn"
            onClick={clearAll}
            title="Limpar notificações"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="notif-filter-chips">
        <button 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas ({notifications.length})
        </button>
        <button 
          className={`filter-chip ${filter === 'calls' ? 'active' : ''}`}
          onClick={() => setFilter('calls')}
        >
          Chamadas
        </button>
        <button 
          className={`filter-chip ${filter === 'alerts' ? 'active' : ''}`}
          onClick={() => setFilter('alerts')}
        >
          Alertas da IA
        </button>
      </div>

      {/* Notifications List */}
      <div className="notif-list">
        {filtered.map((item) => (
          <div key={item.id} className={`notif-card ${item.isUnread ? 'unread' : ''} ${item.type}`}>
            <div className="notif-card-header">
              <div className="notif-tag-wrap">
                <span className={`notif-tag ${item.type}`}>{item.tag}</span>
                {item.isUnread && <span className="unread-dot"></span>}
              </div>
              <span className="notif-time">{item.time}</span>
            </div>

            <h5 className="notif-title">{item.title}</h5>
            <p className="notif-message">{item.message}</p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="ff-mob-empty-queues">
            <Bell size={32} color="#94a3b8" />
            <h4>Nenhuma notificação por aqui</h4>
            <p>Você será notificado em tempo real assim que uma senha for chamada ou recalculada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
