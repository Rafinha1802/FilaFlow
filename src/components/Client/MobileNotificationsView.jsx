import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation,
  Sparkles,
  Trash2,
  Zap,
  MessageCircle,
  Smartphone,
  Volume2
} from 'lucide-react';

export default function MobileNotificationsView({ onPlayChime }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'calls' | 'alerts' | 'channels'
  const [pushStatus, setPushStatus] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted' ? 'active' : 'idle';
    }
    return 'idle';
  });

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
      id: 'n_wa_sample',
      type: 'whatsapp',
      title: 'WhatsApp Sincronizado',
      message: 'Notificações ativadas para o número (11) 98765-4321. Você receberá chamadas e previsão recalculada diretamente no Whats.',
      time: 'Há 2 min',
      isUnread: true,
      tag: 'WhatsApp'
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
    if (filter === 'channels') return n.type === 'whatsapp' || n.tag?.toLowerCase().includes('push') || n.tag?.toLowerCase().includes('whats');
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Simular Notificação Push com som e API nativa
  const handleSimulatePush = () => {
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

    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            setPushStatus('active');
            try {
              new Notification('🔔 TemFyla: Atenção!', {
                body: 'Sua vez está muito próxima! Falta 1 pessoa à sua frente.',
                icon: '/favicon.ico'
              });
            } catch (e) {}
          }
        });
      } else if (Notification.permission === 'granted') {
        setPushStatus('active');
        try {
          new Notification('🔔 TemFyla: Atenção!', {
            body: 'Sua vez está muito próxima! Falta 1 pessoa à sua frente na Clínica Vida.',
            icon: '/favicon.ico'
          });
        } catch (e) {}
      }
    }

    const newPushNotif = {
      id: `push_${Date.now()}`,
      type: 'call',
      title: '🔔 Push: Chamada Iminente!',
      message: 'Sua senha #47 é a próxima no Dr. Carlos Mendes (Consultório 04). Dirija-se à sala de atendimento.',
      time: 'Agora mesmo',
      isUnread: true,
      tag: 'Push Notif'
    };

    setNotifications((prev) => [newPushNotif, ...prev]);
  };

  // Enviar / Testar integração com WhatsApp
  const handleTestWhatsApp = () => {
    const text = `🔔 *TemFyla Notificações*\n\n` +
      `Sua senha *#47* foi atualizada:\n` +
      `🏥 Local: Clínica Vida - Sala 04\n` +
      `⏱️ Previsão: 2 minutos restantes\n` +
      `👨‍⚕️ Atendente: Dr. Carlos Mendes\n\n` +
      `Acompanhe em tempo real pelo TemFyla: https://temfyla.com/app`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');

    const newWaNotif = {
      id: `wa_${Date.now()}`,
      type: 'whatsapp',
      title: '💬 Alerta WhatsApp Disparado',
      message: 'Mensagem com o status da senha #47 enviada para acompanhamento no WhatsApp.',
      time: 'Agora mesmo',
      isUnread: true,
      tag: 'WhatsApp'
    };

    setNotifications((prev) => [newWaNotif, ...prev]);
  };

  const getNotificationIcon = (type) => {
    if (type === 'call') {
      return (
        <div className="icon-squircle mint">
          <Bell size={18} />
        </div>
      );
    }
    if (type === 'whatsapp') {
      return (
        <div className="icon-squircle" style={{ background: '#dcfce7', color: '#16a34a' }}>
          <MessageCircle size={18} />
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

      {/* Widget Interativo de Canais: Push & WhatsApp */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc, #edf2f7)',
        borderRadius: 16,
        padding: '12px 14px',
        marginBottom: 14,
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Canais de Comunicação
          </span>
          <span style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 10,
            background: '#dcfce7',
            color: '#15803d',
            fontWeight: 700
          }}>
            100% Sincronizado
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={handleSimulatePush}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 10px',
              borderRadius: 12,
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Bell size={13} />
            <span>Testar Push</span>
          </button>

          <button
            onClick={handleTestWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '9px 10px',
              borderRadius: 12,
              background: '#10b981',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
              transition: 'all 0.2s'
            }}
          >
            <MessageCircle size={13} />
            <span>Whats Notif</span>
          </button>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="clean-segmented-pills three-tabs" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
          <span>Alertas</span>
        </button>
        <button 
          className={`segmented-pill-btn ${filter === 'channels' ? 'active' : ''}`}
          onClick={() => setFilter('channels')}
        >
          <span>Whats/Push</span>
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
                <span className={`clean-chip-badge mini ${
                  item.type === 'call' ? 'mint' : 
                  item.type === 'whatsapp' ? 'mint' : 
                  item.type === 'alert' ? 'peach' : 'sky'
                }`}>
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
