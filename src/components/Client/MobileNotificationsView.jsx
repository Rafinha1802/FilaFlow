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
  Trash2,
  Zap
} from 'lucide-react';

export default function MobileNotificationsView({ onPlayChime }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'calls' | 'alerts'
  const [notifications, setNotifications] = useState([
    {
      id: 'n0',
      type: 'alert',
      title: 'Fila de Espera • Totem QR',
      message: 'Você está na fila de espera, aguarde você ser aprovado para poder ir para a fila do médico Dr. Carlos Mendes...',
      time: 'Agora mesmo',
      isUnread: true,
      tag: 'Recepção'
    },
    {
      id: 'n1',
      type: 'call',
      title: 'Sua vez se aproxima!',
      message: 'Falta apenas 1 pessoa à sua frente na Clínica Vida (Consultório 04 - Dr. Carlos). Dirija-se à sala.',
      time: 'Há 5 min',
      isUnread: true,
      tag: 'Chamada'
    },
    {
      id: 'n2',
      type: 'alert',
      title: 'Previsão recalculada por IA',
      message: 'A consulta anterior demorou 5 minutos a mais. Seu tempo de espera foi ajustado para evitar correria.',
      time: 'Há 12 min',
      isUnread: true,
      tag: 'IA Preditiva'
    },
    {
      id: 'n3',
      type: 'system',
      title: 'Check-in com Secretária Confirmado',
      message: 'A recepção da Clínica Vida conferiu sua carteirinha e liberou seu encaminhamento para o Consultório 04.',
      time: 'Há 28 min',
      isUnread: false,
      tag: 'Recepção'
    },
    {
      id: 'n4',
      type: 'system',
      title: 'Check-in realizado com sucesso',
      message: 'Sua senha #47 foi gerada via QR Code no totem de entrada. Estimativa sincronizada.',
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

  const getNotificationIcon = (type) => {
    if (type === 'call') {
      return (
        <div className="icon-squircle mint">
          <Bell size={18} />
        </div>
      );
    }
    if (type === 'alert') {
      return (
        <div className="icon-squircle peach">
          <Zap size={18} />
        </div>
      );
    }
    return (
      <div className="icon-squircle sky">
        <CheckCircle2 size={18} />
      </div>
    );
  };

  return (
    <div className="ff-mob-clean-view">
      {/* Header com tipografia amigável */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <span className="view-pretitle">Central de Avisos</span>
          <h2 className="view-maintitle">Notificações</h2>
        </div>

        <div className="header-action-btns">
          <button 
            className="btn-icon-soft"
            onClick={markAllAsRead}
            title="Marcar todas como lidas"
          >
            <CheckCheck size={17} />
          </button>
          <button 
            className="btn-icon-soft danger"
            onClick={clearAll}
            title="Limpar notificações"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Botão de Testar Som estilo Banner Pastel */}
      <div className="notif-chime-test-banner">
        <div className="chime-banner-left">
          <div className="icon-squircle mini lavender">
            <Volume2 size={15} />
          </div>
          <div>
            <strong>Aviso Sonoro de Chamada</strong>
            <span>Ouça como você será chamado no guichê</span>
          </div>
        </div>
        <button 
          className="clean-pill-btn soft"
          onClick={onPlayChime}
        >
          <span>Testar Som</span>
        </button>
      </div>

      {/* Segmented Filter Pills */}
      <div className="clean-segmented-pills three-tabs">
        <button 
          className={`segmented-pill-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span>Todas</span>
          <span className="clean-count-badge">{notifications.length}</span>
        </button>
        <button 
          className={`segmented-pill-btn ${filter === 'calls' ? 'active' : ''}`}
          onClick={() => setFilter('calls')}
        >
          <span>Chamadas</span>
        </button>
        <button 
          className={`segmented-pill-btn ${filter === 'alerts' ? 'active' : ''}`}
          onClick={() => setFilter('alerts')}
        >
          <span>Alertas IA</span>
        </button>
      </div>

      {/* Lista de Notificações em Squircles Limpos */}
      <div className="clean-notif-list">
        {filtered.map((item) => (
          <div key={item.id} className={`clean-notif-card ${item.isUnread ? 'unread' : ''}`}>
            <div className="notif-card-avatar">
              {getNotificationIcon(item.type)}
            </div>

            <div className="notif-card-content">
              <div className="notif-card-top-row">
                <span className={`clean-chip-badge mini ${item.type === 'call' ? 'mint' : item.type === 'alert' ? 'peach' : 'sky'}`}>
                  {item.tag}
                </span>
                <div className="notif-time-row">
                  <span className="notif-time-text">{item.time}</span>
                  {item.isUnread && <span className="notif-unread-glow"></span>}
                </div>
              </div>

              <h4 className="notif-clean-title">{item.title}</h4>
              <p className="notif-clean-desc">{item.message}</p>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="clean-empty-state-card">
            <div className="empty-state-squircle lavender">
              <Bell size={32} />
            </div>
            <h4 className="empty-state-title">Nenhum aviso por aqui</h4>
            <p className="empty-state-sub">
              Você será alertado quando sua senha estiver próxima de ser chamada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
