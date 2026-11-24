import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Zap, 
  MessageCircle,
  Sparkles
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
      id: 'n_call_1',
      type: 'call',
      title: 'Sua vez se aproxima!',
      message: 'Falta apenas 1 pessoa à sua frente na Clínica Vida (Consultório 04 - Dr. Carlos Mendes). Dirija-se à sala.',
      time: 'Agora mesmo',
      isUnread: true,
      tag: 'Chamada'
    },
    {
      id: 'n_wa_1',
      type: 'whatsapp',
      title: 'WhatsApp Conectado & Sincronizado',
      message: 'Notificações ativadas para o número (11) 98765-4321. Você receberá chamadas e previsão recalculada diretamente no Whats.',
      time: 'Há 2 min',
      isUnread: true,
      tag: 'WhatsApp'
    },
    {
      id: 'n_ai_1',
      type: 'alert',
      title: 'Previsão recalculada por IA',
      message: 'Fluxo adiantado no consultório. Seu tempo de espera estimado foi reduzido em 5 minutos.',
      time: 'Há 7 min',
      isUnread: true,
      tag: 'IA Preditiva'
    },
    {
      id: 'n_totem_1',
      type: 'alert',
      title: 'Fila de Espera • Totem QR',
      message: 'Check-in presencial validado no totem da Clínica Vida. Aguarde chamada para o médico.',
      time: 'Há 18 min',
      isUnread: true,
      tag: 'Recepção'
    },
    {
      id: 'n_wa_2',
      type: 'whatsapp',
      title: 'Bilhete Digital no WhatsApp',
      message: 'Link de acompanhamento em tempo real da senha #A-47 enviado para seu WhatsApp.',
      time: 'Há 25 min',
      isUnread: false,
      tag: 'WhatsApp'
    },
    {
      id: 'n_call_prev',
      type: 'call',
      title: 'Chamada no Laboratório Concluída',
      message: 'ExameLab Diagnósticos • Sala 02 (Coleta de Sangue em Jejum). Atendimento finalizado.',
      time: 'Há 45 min',
      isUnread: false,
      tag: 'Chamada'
    },
    {
      id: 'n_sys_1',
      type: 'system',
      title: 'Check-in com Secretária Confirmado',
      message: 'A recepção da Clínica Vida conferiu sua carteirinha e liberou seu encaminhamento para o Consultório 04.',
      time: 'Há 50 min',
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

  const countCalls = notifications.filter((n) => n.type === 'call').length;
  const countAlerts = notifications.filter((n) => n.type === 'alert').length;
  const countChannels = notifications.filter(
    (n) => n.type === 'whatsapp' || n.tag?.toLowerCase().includes('push') || n.tag?.toLowerCase().includes('whats')
  ).length;
  const unreadTotal = notifications.filter((n) => n.isUnread).length;

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
      `Sua senha *#A-47* foi atualizada:\n` +
      `🏥 Local: Clínica Vida - Consultório 04\n` +
      `⏱️ Previsão: 2 minutos restantes\n` +
      `👨‍⚕️ Atendente: Dr. Carlos Mendes\n\n` +
      `Acompanhe em tempo real pelo TemFyla: https://temfyla.com/app`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');

    const newWaNotif = {
      id: `wa_${Date.now()}`,
      type: 'whatsapp',
      title: '💬 Alerta WhatsApp Disparado',
      message: 'Mensagem com o status da senha #A-47 enviada para acompanhamento no WhatsApp.',
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
      {/* Header com tipografia amigável e contador */}
      <div className="clean-view-header">
        <div className="view-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="view-maintitle">Notificações</h2>
            {unreadTotal > 0 && (
              <span className="clean-chip-badge mini lavender" style={{ fontWeight: 800 }}>
                {unreadTotal} novas
              </span>
            )}
          </div>
          <span className="view-pretitle" style={{ marginTop: 2 }}>
            Central de avisos e chamadas em tempo real
          </span>
        </div>

        <div className="header-action-btns">
          <button 
            className="btn-icon-soft"
            onClick={markAllAsRead}
            title="Marcar todas como lidas"
          >
            <CheckCheck size={16} />
          </button>
          <button 
            className="btn-icon-soft danger"
            onClick={clearAll}
            title="Limpar notificações"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Barra Compacta de Sincronização & Teste Rápido */}
      <div className="notif-sync-statusbar">
        <div className="sync-status-indicator">
          <span className="ff-live-pulse-dot" />
          <span>Sincronizado ao vivo</span>
        </div>
        <div className="sync-status-actions">
          <button
            type="button"
            onClick={handleSimulatePush}
            className="sync-action-chip push"
            title="Testar notificação sonora e push"
          >
            <Bell size={11} />
            <span>Testar Push</span>
          </button>
          <button
            type="button"
            onClick={handleTestWhatsApp}
            className="sync-action-chip zap"
            title="Disparar teste via WhatsApp"
          >
            <MessageCircle size={11} />
            <span>Whats Notif</span>
          </button>
        </div>
      </div>

      {/* Segmented Control Perfeito (Sem corte, 100% visível, 4 abas ajustadas) */}
      <div className="notif-segmented-control">
        <button 
          className={`notif-segmented-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span>Todas</span>
          <span className="notif-segmented-badge">{notifications.length}</span>
        </button>
        <button 
          className={`notif-segmented-btn ${filter === 'calls' ? 'active' : ''}`}
          onClick={() => setFilter('calls')}
        >
          <span>Chamadas</span>
          {countCalls > 0 && <span className="notif-segmented-badge">{countCalls}</span>}
        </button>
        <button 
          className={`notif-segmented-btn ${filter === 'alerts' ? 'active' : ''}`}
          onClick={() => setFilter('alerts')}
        >
          <span>Alertas</span>
          {countAlerts > 0 && <span className="notif-segmented-badge">{countAlerts}</span>}
        </button>
        <button 
          className={`notif-segmented-btn ${filter === 'channels' ? 'active' : ''}`}
          onClick={() => setFilter('channels')}
        >
          <span>WhatsApp</span>
          {countChannels > 0 && <span className="notif-segmented-badge">{countChannels}</span>}
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
                  {item.isUnread && <span className="notif-unread-glow" />}
                </div>
              </div>

              <h4 className="notif-clean-title">{item.title}</h4>
              <p className="notif-clean-desc">{item.message}</p>
            </div>
          </div>
        ))}

        {filtered.length > 0 && filter === 'channels' && (
          <div className="notif-info-tip-card">
            <div className="tip-icon-squircle">
              <MessageCircle size={16} />
            </div>
            <div className="tip-content">
              <strong>Notificações no WhatsApp Ativas</strong>
              <p>Você receberá um aviso com som e link direto quando o Dr. Carlos Mendes chamar sua senha.</p>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="clean-empty-state-card">
            <div className="empty-state-squircle lavender">
              <Bell size={28} />
            </div>
            <h4 className="empty-state-title">Nenhum aviso nesta categoria</h4>
            <p className="empty-state-sub">
              Você será alertado automaticamente quando sua senha estiver próxima de ser chamada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
