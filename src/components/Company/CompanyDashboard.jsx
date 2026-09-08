import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Users, 
  Clock, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  UserX, 
  Plus, 
  QrCode, 
  BarChart3, 
  Sparkles, 
  Printer, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  ChevronRight, 
  Globe, 
  LogOut, 
  User,
  Tv,
  Search,
  Send,
  TrendingUp,
  Download,
  Sliders,
  Check,
  X,
  Radio,
  Star,
  MessageSquare,
  Copy
} from 'lucide-react';

export default function CompanyDashboard({
  businessData,
  activeAttendingTicket,
  waitingQueue,
  onCallNext,
  onReportDelay,
  onFinishCurrent,
  onSkipTicket,
  onAddManualTicket,
  onOpenMobileTest,
  onGoToSite,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('operational'); // 'operational' | 'metrics' | 'totem'
  const [timerSeconds, setTimerSeconds] = useState(254); // Live call timer
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showTvModal, setShowTvModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Reception Notice / Broadcast state for TV and Dashboard
  const [receptionNotice, setReceptionNotice] = useState('Dra. Beatriz Santos está atendendo no Consultório 04. Por favor, aguarde sua senha.');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState('');

  // Filter and Search for Operational Queue
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'priority' | 'waiting' | 'user'

  // AI Calibration parameters
  const [aiAlgorithmMode, setAiAlgorithmMode] = useState('smart'); // 'smart' | 'conservative' | 'fast'
  const [noticeThreshold, setNoticeThreshold] = useState('2'); // '1' | '2' | '3' atendimentos antes

  // Manual ticket form state
  const [manualName, setManualName] = useState('');
  const [manualService, setManualService] = useState('Consulta Oftalmologia Geral');
  const [isPriority, setIsPriority] = useState(false);

  // Live clock for TV Panel
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toLocaleTimeString('pt-BR'));

  // Increment timer every second for active attendance & update clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
      setCurrentTimeStr(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play audio bell chime and synthesize voice speech in PT-BR
  const playCallAnnouncement = (ticket, name, room) => {
    if (!soundEnabled) return;

    // 1. Web Audio Bell Chime
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log('AudioContext not allowed');
    }

    // 2. Speech Synthesis
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanTicket = (ticket || '#00').replace('#', '');
        const text = `Senha ${cleanTicket}. ${name || 'Paciente'}. ${room || businessData.room || 'Consultório 04'}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech synthesis unavailable');
    }
  };

  const handleCallNextWithSound = () => {
    if (waitingQueue.length === 0) {
      showNotification('Não há mais clientes na fila de espera no momento.');
      return;
    }

    const nextTicket = waitingQueue[0];
    playCallAnnouncement(nextTicket.ticket, nextTicket.name, businessData.room);
    setTimerSeconds(0);
    onCallNext();
    showNotification(`Senha ${nextTicket.ticket} (${nextTicket.name}) chamada no ${businessData.room || 'Consultório 04'}.`);
  };

  const handleRecallActiveTicket = () => {
    if (!activeAttendingTicket) return;
    playCallAnnouncement(activeAttendingTicket.ticket, activeAttendingTicket.name, businessData.room);
    showNotification(`Re-chamada realizada para a senha ${activeAttendingTicket.ticket}!`);
  };

  const handleSendWhatsAppReminder = (item) => {
    showNotification(`📲 Lembrete WhatsApp enviado para ${item.name}! Avisado para retornar ao saguão.`);
  };

  const handleCreateManualTicket = (e) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    onAddManualTicket({
      name: manualName,
      serviceName: manualService,
      isPriority
    });

    setManualName('');
    setShowManualModal(false);
    showNotification(`Senha presencial emitida com sucesso para ${manualName}!`);
  };

  // Filtered Queue
  const filteredQueue = waitingQueue.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.service && item.service.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (queueFilter === 'priority') return item.isPriority;
    if (queueFilter === 'user') return item.isUser;
    if (queueFilter === 'waiting') return !item.isPriority && !item.isUser;
    return true;
  });

  // Hourly Flow Data for Metrics Chart
  const hourlyFlowData = [
    { hour: '08h', actual: 4, predicted: 5, avgWait: '10 min' },
    { hour: '09h', actual: 6, predicted: 6, avgWait: '12 min' },
    { hour: '10h', actual: 8, predicted: 7, avgWait: '15 min' },
    { hour: '11h', actual: 7, predicted: 8, avgWait: '14 min' },
    { hour: '12h', actual: 3, predicted: 4, avgWait: '09 min' },
    { hour: '13h', actual: 5, predicted: 6, avgWait: '11 min' },
    { hour: '14h', actual: 9, predicted: 8, isCurrent: true, avgWait: '16 min' },
    { hour: '15h', actual: 7, predicted: 8, avgWait: '14 min' },
    { hour: '16h', actual: 5, predicted: 5, avgWait: '12 min' },
    { hour: '17h', actual: 4, predicted: 4, avgWait: '10 min' },
    { hour: '18h', actual: 2, predicted: 3, avgWait: '08 min' }
  ];

  // Procedure performance data
  const procedureStats = [
    {
      name: 'Consulta Oftalmologia Geral',
      count: 28,
      avgTime: '14.2 min',
      predictedTime: '15 min',
      accuracy: 97.8,
      status: 'Ótimo'
    },
    {
      name: 'Exame de Fundo de Olho',
      count: 14,
      avgTime: '18.5 min',
      predictedTime: '19 min',
      accuracy: 98.4,
      status: 'Excelente'
    },
    {
      name: 'Retorno de Consulta',
      count: 7,
      avgTime: '8.1 min',
      predictedTime: '10 min',
      accuracy: 99.1,
      status: 'Excelente'
    },
    {
      name: 'Avaliação Pré-Operatória',
      count: 3,
      avgTime: '32.0 min',
      predictedTime: '35 min',
      accuracy: 94.2,
      status: 'Normal'
    }
  ];

  return (
    <div className="ff-portal-layout">
      {/* Global In-Dashboard Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6000,
          background: '#0f172a',
          color: 'white',
          padding: '12px 22px',
          borderRadius: 12,
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 700,
          animation: 'slide-in-down 0.25s ease'
        }}>
          <CheckCircle2 size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="ff-portal-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ 
            width: 42, 
            height: 42, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <Building2 size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {businessData.companyName || 'Clínica Vida'}
              </h1>
              <span style={{ 
                background: '#ecfdf5', 
                color: '#065f46', 
                fontSize: 11, 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: 999,
                border: '1px solid #a7f3d0'
              }}>
                ● Ao Vivo
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {businessData.unitName || 'Unidade Centro'} • Sala:{' '}
              <strong style={{ color: '#334155' }}>{businessData.room || 'Consultório 04'}</strong> • Atendente:{' '}
              <strong style={{ color: '#334155' }}>{businessData.attendantName || 'Dr. Carlos Mendes'}</strong>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="ff-portal-tabs">
          <button
            className={`ff-portal-tab-btn ${activeTab === 'operational' ? 'active' : ''}`}
            onClick={() => setActiveTab('operational')}
          >
            <Play size={14} fill={activeTab === 'operational' ? '#5b21b6' : 'none'} />
            <span>Fila Operacional</span>
          </button>

          <button
            className={`ff-portal-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <BarChart3 size={14} />
            <span>Métricas & IA</span>
          </button>

          <button
            className={`ff-portal-tab-btn ${activeTab === 'totem' ? 'active' : ''}`}
            onClick={() => setActiveTab('totem')}
          >
            <QrCode size={14} />
            <span>QR Code & Totem</span>
          </button>
        </nav>

        {/* Dashboard Topbar Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Nova Senha Balcão */}
          <button
            className="btn-primary"
            onClick={() => setShowManualModal(true)}
            title="Emitir senha presencial rápida de balcão"
            style={{ padding: '7px 14px', fontSize: 12, background: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} />
            <span className="hidden-mobile">Nova Senha Balcão</span>
          </button>

          {/* Modo Telão TV */}
          <button
            className="btn-outline-purple"
            onClick={() => setShowTvModal(true)}
            title="Abrir painel de chamadas em tela cheia para TV de recepção"
            style={{ padding: '7px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Tv size={14} />
            <span className="hidden-mobile">Modo Telão TV</span>
          </button>

          {/* Comunicado da Recepção */}
          <button
            className="btn-ghost"
            onClick={() => {
              setNoticeDraft(receptionNotice);
              setShowNoticeModal(true);
            }}
            title="Enviar comunicado para a recepção e telão de espera"
            style={{
              padding: '7px 12px',
              fontSize: 12,
              border: '1px solid #e2e8f0',
              color: receptionNotice ? '#7c3aed' : '#475569',
              background: receptionNotice ? '#faf5ff' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <MessageSquare size={14} />
            <span className="hidden-mobile">Aviso Recepção</span>
            {receptionNotice && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />
            )}
          </button>

          {/* Som Ativo / Mudo */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              showNotification(!soundEnabled ? 'Alertas sonoros ativados!' : 'Alertas sonoros silenciados.');
            }}
            className="btn-ghost"
            title={soundEnabled ? 'Desativar alertas sonoros' : 'Ativar alertas sonoros'}
            style={{
              padding: '7px 12px',
              fontSize: 12,
              border: '1px solid #e2e8f0',
              color: soundEnabled ? '#15803d' : '#64748b',
              background: soundEnabled ? '#f0fdf4' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden-mobile">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
          </button>

          {/* Sair */}
          <button
            onClick={onLogout}
            title="Sair do painel da empresa"
            style={{
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#dc2626',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer'
            }}
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Active Reception Notice Banner */}
      {receptionNotice && (
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
          border: '1px solid #ddd6fe',
          borderRadius: 12,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#7c3aed',
              color: 'white',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <MessageSquare size={12} />
              <span>Aviso da Recepção</span>
            </div>
            <span style={{ fontSize: 13, color: '#4c1d95', fontWeight: 600 }}>{receptionNotice}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setNoticeDraft(receptionNotice);
                setShowNoticeModal(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7c3aed',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Editar
            </button>
            <button
              onClick={() => setReceptionNotice('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Remover aviso"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 1: FILA OPERACIONAL (REESTRUTURADA E PODEROSA)
          ============================================================ */}
      {activeTab === 'operational' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. Quick Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14
          }}>
            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Em Atendimento
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                  {activeAttendingTicket ? activeAttendingTicket.ticket : '#00'}
                </div>
              </div>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Fila de Espera
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>
                  {waitingQueue.length} pessoas
                </div>
              </div>
              <Clock size={18} color="#b45309" />
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Prioridades por Lei
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', marginTop: 2 }}>
                  {waitingQueue.filter((q) => q.isPriority).length} pessoas
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: 999 }}>
                Lei 10.048
              </span>
            </div>

            <div style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  No App Móvel
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#7c3aed', marginTop: 2 }}>
                  {waitingQueue.filter((q) => q.isUser).length + 1} ativos
                </div>
              </div>
              <Smartphone size={18} color="#7c3aed" />
            </div>
          </div>

          {/* 2. Re-organized Call Station Box */}
          <section className="ff-call-station-box">
            <div className="ff-call-station-grid">
              {/* Left Column: Active Attending Card */}
              <div className="ff-active-attending-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 }}>
                  <span className="ff-attending-tag">
                    ● EM CONSULTA AGORA
                  </span>
                  <button 
                    onClick={handleRecallActiveTicket}
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #e2e8f0', background: 'white' }}
                    title="Chamar novamente o som na recepção"
                  >
                    <Volume2 size={12} />
                    <span>Re-chamar</span>
                  </button>
                </div>

                <div className="ff-attending-ticket">
                  {activeAttendingTicket ? activeAttendingTicket.ticket : '#44'}
                </div>

                <div className="ff-attending-name">
                  {activeAttendingTicket ? activeAttendingTicket.name : 'João Santos'}
                </div>

                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
                  {activeAttendingTicket?.service || 'Consulta Oftalmologia Geral'} • {businessData.room || 'Consultório 04'}
                </div>

                {/* Live Timer with Progress Ring */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  padding: '8px 16px',
                  borderRadius: 999,
                  marginBottom: 16
                }}>
                  <Clock size={16} color="#7c3aed" className="animate-spin-slow" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>
                    Duração: {formatTimer(timerSeconds)} / ~15 min
                  </span>
                </div>

                {/* Outcome actions for current patient */}
                <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      onFinishCurrent();
                      showNotification('Atendimento finalizado com sucesso!');
                    }}
                    style={{ background: 'white', border: '1px solid #cbd5e1', fontSize: 12, padding: '8px 12px' }}
                  >
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>Concluir</span>
                  </button>

                  <button
                    className="btn-ghost"
                    onClick={() => {
                      onSkipTicket();
                      showNotification('Paciente marcado como ausente.');
                    }}
                    style={{ background: 'white', border: '1px solid #cbd5e1', fontSize: 12, padding: '8px 12px' }}
                  >
                    <UserX size={14} color="#ef4444" />
                    <span>Pular / Ausente</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Next Call Station & AI Adjuster */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Próxima Chamada na Fila
                    </h3>
                    {waitingQueue[0] && (
                      <span style={{ fontSize: 12, color: '#b45309', fontWeight: 700, background: '#fef3c7', padding: '3px 8px', borderRadius: 999 }}>
                        {waitingQueue[0].name} ({waitingQueue[0].time})
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                    Ao chamar, a campainha toca, a IA notifica o celular do cliente com vibração e o painel de TV atualiza.
                  </p>
                </div>

                {/* Big Action Buttons */}
                <div className="ff-call-actions-row" style={{ justifyContent: 'flex-start' }}>
                  <button
                    className="btn-call-next"
                    onClick={handleCallNextWithSound}
                    style={{ padding: '14px 28px', fontSize: 15 }}
                  >
                    <Play size={18} fill="white" />
                    <span>Chamar Próximo ({waitingQueue[0] ? waitingQueue[0].ticket : 'Fila Vazia'})</span>
                  </button>

                  <button
                    className="btn-report-delay"
                    onClick={onReportDelay}
                    title="Avisa à IA que a consulta atual vai demorar mais 5 minutos"
                  >
                    <AlertTriangle size={16} />
                    <span>Atraso (+5m IA)</span>
                  </button>
                </div>

                {/* Tool Row */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="btn-ghost"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    style={{ border: '1px solid #e2e8f0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {soundEnabled ? <Volume2 size={15} color="#10b981" /> : <VolumeX size={15} color="#ef4444" />}
                    <span>{soundEnabled ? 'Campainha e Voz Ativa' : 'Som Mudo'}</span>
                  </button>

                  <button
                    className="btn-ghost"
                    onClick={() => setShowTvModal(true)}
                    style={{ border: '1px solid #e2e8f0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Tv size={15} color="#7c3aed" />
                    <span>Abrir Painel de TV / Telão</span>
                  </button>
                </div>

                {/* AI Assistant Callout */}
                <div style={{ 
                  background: '#faf5ff', 
                  border: '1px solid #e9d5ff', 
                  borderRadius: 12, 
                  padding: '12px 14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  fontSize: 12,
                  color: '#6b21a8'
                }}>
                  <Sparkles size={16} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>IA Preditiva Ativa:</strong> Próximos {Math.min(waitingQueue.length, 3)} clientes já receberam aviso de aproximação 
                    e estão no saguão ou a caminho pelo celular.
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Re-organized Waiting Queue Table with Toolbar */}
          <section style={{ 
            background: 'white', 
            borderRadius: 16, 
            border: '1.5px solid #e2e8f0', 
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}>
            {/* Table Header & Controls */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12 
            }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Fila de Espera em Tempo Real ({filteredQueue.length} de {waitingQueue.length})
                </h3>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Fila dinâmica com prioridades legais, previsão calibrada por IA e ações imediatas.
                </span>
              </div>

              <button
                className="btn-primary"
                onClick={() => setShowManualModal(true)}
                style={{ background: '#7c3aed', padding: '9px 18px', fontSize: 13 }}
              >
                <Plus size={16} />
                <span>Emitir Senha Presencial de Balcão</span>
              </button>
            </div>

            {/* Toolbar: Search Input + Filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <div className="ff-input-wrapper" style={{ maxWidth: 320, width: '100%' }}>
                <Search size={15} className="ff-input-icon" />
                <input
                  type="text"
                  className="ff-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, senha ou serviço..."
                  style={{ height: 38, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setQueueFilter('all')}
                  className={`ff-clean-tab-pill ${queueFilter === 'all' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  Todos ({waitingQueue.length})
                </button>

                <button
                  onClick={() => setQueueFilter('priority')}
                  className={`ff-clean-tab-pill ${queueFilter === 'priority' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  Prioritários ({waitingQueue.filter((q) => q.isPriority).length})
                </button>

                <button
                  onClick={() => setQueueFilter('waiting')}
                  className={`ff-clean-tab-pill ${queueFilter === 'waiting' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  No Saguão ({waitingQueue.filter((q) => !q.isPriority && !q.isUser).length})
                </button>

                <button
                  onClick={() => setQueueFilter('user')}
                  className={`ff-clean-tab-pill ${queueFilter === 'user' ? 'active' : ''}`}
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  App Celular ({waitingQueue.filter((q) => q.isUser).length})
                </button>
              </div>
            </div>

            {/* Waiting Queue List */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                    <th style={{ padding: '10px 14px' }}>Posição</th>
                    <th style={{ padding: '10px 14px' }}>Senha</th>
                    <th style={{ padding: '10px 14px' }}>Nome do Cliente</th>
                    <th style={{ padding: '10px 14px' }}>Procedimento / Serviço</th>
                    <th style={{ padding: '10px 14px' }}>Previsão IA</th>
                    <th style={{ padding: '10px 14px' }}>Status de Presença</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8' }}>
                        Nenhum paciente encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item, idx) => {
                      const isNext = idx === 0 && queueFilter === 'all';
                      const isUserItem = item.isUser;

                      return (
                        <tr 
                          key={idx} 
                          style={{ 
                            borderBottom: '1px solid #f1f5f9',
                            background: isNext ? '#fefce8' : isUserItem ? '#faf5ff' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                        >
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#64748b' }}>
                            {idx + 1}º
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ 
                              fontFamily: 'Outfit', 
                              fontSize: 16, 
                              fontWeight: 900, 
                              color: isUserItem ? '#7c3aed' : '#0f172a' 
                            }}>
                              {item.ticket}
                            </span>
                          </td>

                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>
                            {item.name}
                            {isUserItem && (
                              <span style={{ 
                                marginLeft: 6, 
                                background: '#ede9fe', 
                                color: '#6d28d9', 
                                fontSize: 10, 
                                fontWeight: 800, 
                                padding: '2px 6px', 
                                borderRadius: 4 
                              }}>
                                VOCÊ (APP CELULAR)
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {item.service || 'Consulta Oftalmologia Geral'}
                          </td>

                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#b45309' }}>
                            {item.time || `~${(idx + 1) * 12} min`}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            {item.isPriority ? (
                              <span style={{ 
                                background: '#fee2e2', 
                                color: '#991b1b', 
                                fontSize: 11, 
                                fontWeight: 700, 
                                padding: '3px 8px', 
                                borderRadius: 999 
                              }}>
                                Prioritário Lei 10.048
                              </span>
                            ) : (
                              <span style={{ 
                                background: isNext ? '#fef3c7' : isUserItem ? '#ede9fe' : '#ecfdf5', 
                                color: isNext ? '#92400e' : isUserItem ? '#6b21a8' : '#065f46', 
                                fontSize: 11, 
                                fontWeight: 700, 
                                padding: '3px 8px', 
                                borderRadius: 999 
                              }}>
                                {isNext ? 'Próximo da Vez' : isUserItem ? 'A Caminho (App)' : 'Aguardando no saguão'}
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                onClick={handleCallNextWithSound}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background: isNext ? '#10b981' : '#f1f5f9',
                                  color: isNext ? 'white' : '#475569',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                {isNext ? 'Chamar Agora' : 'Chamar Direto'}
                              </button>

                              <button
                                onClick={() => handleSendWhatsAppReminder(item)}
                                title="Disparar aviso por WhatsApp"
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  background: '#f8fafc',
                                  color: '#059669',
                                  border: '1px solid #e2e8f0',
                                  cursor: 'pointer'
                                }}
                              >
                                <Send size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================
          TAB 2: MÉTRICAS & IA (COMPLETA, RICA E SEM ESPAÇO VAZIO)
          ============================================================ */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top 4 Metric Cards */}
          <div className="ff-dash-metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <Clock size={18} className="ff-metric-icon" />
                <span className="ff-metric-badge green">-22% vs meta</span>
              </div>
              <div className="ff-metric-value">13.4 min</div>
              <div className="ff-metric-label">Tempo Médio de Espera Real</div>
            </div>

            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <Users size={18} className="ff-metric-icon" />
                <span className="ff-metric-badge green">+12 hoje</span>
              </div>
              <div className="ff-metric-value">52</div>
              <div className="ff-metric-label">Senhas Emitidas Hoje</div>
            </div>

            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <CheckCircle2 size={18} className="ff-metric-icon" />
                <span className="ff-metric-badge green">0% evasão</span>
              </div>
              <div className="ff-metric-value">43</div>
              <div className="ff-metric-label">Atendimentos Concluídos</div>
            </div>

            <div className="ff-dash-metric-card">
              <div className="ff-metric-top">
                <Sparkles size={18} className="ff-metric-icon" />
                <span className="ff-metric-badge green">Alta Precisão</span>
              </div>
              <div className="ff-metric-value">98.1%</div>
              <div className="ff-metric-label">Acurácia Preditiva IA</div>
            </div>
          </div>

          {/* NOVO: Gráfico de Fluxo e Volume por Horário (Hourly Chart) */}
          <section style={{
            background: 'white',
            borderRadius: 16,
            border: '1.5px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="#7c3aed" />
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Distribuição do Fluxo de Atendimento por Horário
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
                  Comparativo entre o volume real atendido e a curva preditiva calculada pelo algoritmo.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#7c3aed' }} />
                  <span style={{ color: '#475569', fontWeight: 600 }}>Atendimentos Reais</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: '#c4b5fd' }} />
                  <span style={{ color: '#475569', fontWeight: 600 }}>Previsão IA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ color: '#b45309', fontWeight: 700 }}>Horário de Pico (14h-15h)</span>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, 1fr)',
              gap: 12,
              alignItems: 'flex-end',
              height: 180,
              padding: '16px 12px 0',
              background: '#f8fafc',
              borderRadius: 14,
              border: '1px solid #f1f5f9'
            }}>
              {hourlyFlowData.map((d, i) => {
                const maxVal = 10;
                const heightPercent = (d.actual / maxVal) * 100;
                const predPercent = (d.predicted / maxVal) * 100;

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: d.isCurrent ? '#7c3aed' : '#64748b', marginBottom: 6 }}>
                      {d.actual}
                    </div>

                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120 }}>
                      {/* Actual Bar */}
                      <div style={{
                        width: 16,
                        height: `${heightPercent}%`,
                        background: d.isCurrent 
                          ? 'linear-gradient(180deg, #7c3aed 0%, #4f46e5 100%)' 
                          : '#8b5cf6',
                        borderRadius: '4px 4px 0 0',
                        boxShadow: d.isCurrent ? '0 4px 12px rgba(124, 58, 237, 0.4)' : 'none',
                        transition: 'height 0.4s ease'
                      }} title={`Real: ${d.actual} pacientes`} />

                      {/* Predicted Bar */}
                      <div style={{
                        width: 16,
                        height: `${predPercent}%`,
                        background: '#e2e8f0',
                        borderRadius: '4px 4px 0 0'
                      }} title={`Previsto: ${d.predicted} pacientes`} />
                    </div>

                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: d.isCurrent ? 800 : 600, 
                      color: d.isCurrent ? '#7c3aed' : '#64748b', 
                      marginTop: 8 
                    }}>
                      {d.hour}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Grid com Tabela de Procedimentos e Relatório de IA */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
            {/* Tabela de Desempenho por Procedimento */}
            <section style={{
              background: 'white',
              borderRadius: 16,
              border: '1.5px solid #e2e8f0',
              padding: 24,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Desempenho por Procedimento
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Tempo médio real x calibragem contínua pela Inteligência Artificial.
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: 12 }}>
                    <th style={{ padding: '8px 10px' }}>Procedimento</th>
                    <th style={{ padding: '8px 10px' }}>Qtd</th>
                    <th style={{ padding: '8px 10px' }}>Duração Real</th>
                    <th style={{ padding: '8px 10px' }}>Acurácia IA</th>
                  </tr>
                </thead>
                <tbody>
                  {procedureStats.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#1e293b' }}>
                        {p.name}
                      </td>
                      <td style={{ padding: '10px', color: '#64748b' }}>
                        {p.count}
                      </td>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>
                        {p.avgTime}
                        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4, fontWeight: 400 }}>
                          (Meta: {p.predictedTime})
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${p.accuracy}%`, height: '100%', background: '#10b981' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>
                            {p.accuracy}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Painel de Satisfação & Retenção do Paciente */}
            <section style={{
              background: 'white',
              borderRadius: 16,
              border: '1.5px solid #e2e8f0',
              padding: 24,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Satisfação dos Pacientes
                  </h3>
                  <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 999 }}>
                    NPS 94
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#7c3aed', fontFamily: 'Outfit' }}>
                    4.9
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                      <Star size={15} fill="#f59e0b" />
                      <Star size={15} fill="#f59e0b" />
                      <Star size={15} fill="#f59e0b" />
                      <Star size={15} fill="#f59e0b" />
                      <Star size={15} fill="#f59e0b" />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Baseado em 94 avaliações pós-atendimento
                    </div>
                  </div>
                </div>

                {/* Patient Review Testimonial */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  fontSize: 12,
                  color: '#475569',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  marginBottom: 14
                }}>
                  "Pude tomar um café na esquina sem me preocupar. Quando faltavam 2 pessoas, o celular vibrou e subi com calma. Experiência nota 10!"
                  <div style={{ fontStyle: 'normal', fontWeight: 700, color: '#1e293b', marginTop: 6, fontSize: 11 }}>
                    — Marcos Toledo (Atendimento Oftalmologia)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Taxa de Evasão Evitada</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#10b981' }}>8 pacientes retidos hoje</span>
              </div>
            </section>
          </div>

          {/* Central de Calibração da IA e Parâmetros */}
          <section style={{ 
            background: 'white', 
            borderRadius: 16, 
            border: '1.5px solid #e2e8f0', 
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Parâmetros de Ajuste do Algoritmo IA
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  Configure como a Inteligência Artificial calcula janelas de tolerância e dispara notificações de aproximação.
                </p>
              </div>

              <button
                onClick={() => showNotification('Relatório operacional exportado em PDF com sucesso!')}
                className="btn-ghost"
                style={{ border: '1px solid #e2e8f0', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Download size={14} />
                <span>Exportar Relatório em PDF</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div 
                onClick={() => { setAiAlgorithmMode('smart'); showNotification('Modo IA Preditivo Equilibrado ativo.'); }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: aiAlgorithmMode === 'smart' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  background: aiAlgorithmMode === 'smart' ? '#faf5ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.18s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>Equilibrado (IA)</span>
                  {aiAlgorithmMode === 'smart' && <Check size={16} color="#7c3aed" />}
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Auto-calibração em tempo real baseada no ritmo dos últimos 30 atendimentos.
                </p>
              </div>

              <div 
                onClick={() => { setAiAlgorithmMode('conservative'); showNotification('Modo Conservador ativado (+5m de margem).'); }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: aiAlgorithmMode === 'conservative' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  background: aiAlgorithmMode === 'conservative' ? '#faf5ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.18s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>Conservador</span>
                  {aiAlgorithmMode === 'conservative' && <Check size={16} color="#7c3aed" />}
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Adiciona 15% de margem de tolerância para procedimentos que possam se estender.
                </p>
              </div>

              <div 
                onClick={() => { setAiAlgorithmMode('fast'); showNotification('Modo Giro Rápido ativo.'); }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: aiAlgorithmMode === 'fast' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  background: aiAlgorithmMode === 'fast' ? '#faf5ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.18s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: '#1e293b' }}>Giro Rápido / Balcão</span>
                  {aiAlgorithmMode === 'fast' && <Check size={16} color="#7c3aed" />}
                </div>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Focado em alta rotatividade (balcão, triagem ou retirada de pedidos).
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================
          TAB 3: TOTEM / QR CODE DE BALCÃO
          ============================================================ */}
      {activeTab === 'totem' && (
        <div style={{ 
          background: 'white', 
          borderRadius: 20, 
          border: '1.5px solid #e2e8f0', 
          padding: 40,
          textAlign: 'center',
          maxWidth: 640,
          margin: '0 auto',
          boxShadow: '0 10px 35px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            TOTEM DE BALCÃO • FILAFLOW
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginTop: 6 }}>
            {businessData.companyName || 'Clínica Vida'}
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            {businessData.unitName || 'Unidade Centro'} • Posicione este QR Code impresso no balcão ou na recepção.
          </p>

          <div style={{
            width: 240,
            height: 240,
            margin: '0 auto 24px',
            background: '#ffffff',
            border: '2px solid #e2e8f0',
            borderRadius: 24,
            padding: 20,
            boxShadow: '0 12px 30px rgba(124, 58, 237, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
              <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="13" y="13" width="10" height="10" rx="1" fill="#0f172a" />

              <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
              <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="77" y="13" width="10" height="10" rx="1" fill="#0f172a" />

              <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
              <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
              <rect x="13" y="77" width="10" height="10" rx="1" fill="#0f172a" />

              <circle cx="42" cy="12" r="3" fill="#7c3aed" />
              <circle cx="52" cy="18" r="3" fill="#0f172a" />
              <circle cx="40" cy="28" r="3" fill="#0f172a" />
              <circle cx="56" cy="32" r="3" fill="#7c3aed" />
              <circle cx="20" cy="46" r="3" fill="#0f172a" />
              <circle cx="34" cy="44" r="3" fill="#0f172a" />
              <circle cx="48" cy="48" r="4" fill="#7c3aed" />
              <circle cx="64" cy="46" r="3" fill="#0f172a" />
              <circle cx="80" cy="44" r="3" fill="#0f172a" />
              <circle cx="40" cy="62" r="3" fill="#0f172a" />
              <circle cx="54" cy="64" r="3" fill="#0f172a" />
              <circle cx="44" cy="78" r="3" fill="#7c3aed" />
              <circle cx="56" cy="82" r="3" fill="#0f172a" />
              <circle cx="70" cy="76" r="3" fill="#0f172a" />
              <circle cx="84" cy="80" r="3" fill="#0f172a" />
              <circle cx="72" cy="62" r="3" fill="#7c3aed" />
              <circle cx="86" cy="60" r="3" fill="#0f172a" />
            </svg>

            <div style={{
              position: 'absolute',
              width: 44,
              height: 44,
              background: '#ffffff',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed'
            }}>
              <Layers size={22} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              className="btn-primary"
              onClick={() => showNotification('Comando de impressão enviado para a impressora!')}
              style={{ background: '#7c3aed', padding: '12px 24px' }}
            >
              <Printer size={16} />
              <span>Imprimir Cartaz de Balcão</span>
            </button>

            <button
              className="btn-outline-purple"
              onClick={() => {
                const checkinUrl = `${window.location.origin}/app`;
                navigator.clipboard.writeText(checkinUrl);
                showNotification('Link copiado: ' + checkinUrl);
              }}
              style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
              title="Copiar link para enviar a clientes ou totem"
            >
              <Copy size={16} />
              <span>Copiar Link da Fila (/app)</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: MODO TELÃO / TV DA RECEPÇÃO EM ALTA RESOLUÇÃO
          ============================================================ */}
      {showTvModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #090d16 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 48px',
            animation: 'fade-in 0.25s ease'
          }}
        >
          {/* TV Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={24} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Outfit', margin: 0, color: 'white' }}>
                  {businessData.companyName || 'Clínica Vida'}
                </h2>
                <span style={{ fontSize: 14, color: '#a78bfa' }}>
                  {businessData.unitName || 'Unidade Centro'} • Sistema de Atendimento Digital
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                  {currentTimeStr}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>
                  Hoje às {currentTimeStr.slice(0, 5)}
                </div>
              </div>

              <button
                onClick={() => setShowTvModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  color: 'white',
                  borderRadius: 10,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <X size={16} />
                <span>Fechar Telão</span>
              </button>
            </div>
          </div>

          {/* Active Reception Announcement Bar in TV */}
          {receptionNotice && (
            <div style={{
              background: 'rgba(124, 58, 237, 0.35)',
              border: '1.5px solid rgba(167, 139, 250, 0.5)',
              borderRadius: 14,
              padding: '12px 24px',
              margin: '18px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 18,
              color: '#ffffff',
              fontWeight: 600,
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.2)'
            }}>
              <MessageSquare size={22} color="#a78bfa" />
              <span><strong>AVISO DA RECEPÇÃO:</strong> {receptionNotice}</span>
            </div>
          )}

          {/* Huge Center Ticket Card */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 0'
          }}>
            <span style={{ 
              fontSize: 16, 
              fontWeight: 800, 
              color: '#34d399', 
              letterSpacing: '0.15em', 
              textTransform: 'uppercase',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '8px 24px',
              borderRadius: 999,
              marginBottom: 16
            }}>
              ● SENHA CHAMADA NO MOMENTO
            </span>

            <div style={{
              fontSize: 120,
              fontWeight: 900,
              fontFamily: 'Outfit',
              color: '#ffffff',
              lineHeight: 1,
              textShadow: '0 0 50px rgba(124, 58, 237, 0.8)',
              margin: '10px 0'
            }}>
              {activeAttendingTicket ? activeAttendingTicket.ticket : '#44'}
            </div>

            <div style={{ fontSize: 42, fontWeight: 800, color: '#f8fafc', marginBottom: 12 }}>
              {activeAttendingTicket ? activeAttendingTicket.name : 'João Santos'}
            </div>

            <div style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#a78bfa',
              background: 'rgba(124, 58, 237, 0.25)',
              padding: '12px 32px',
              borderRadius: 16,
              border: '1.5px solid rgba(167, 139, 250, 0.4)'
            }}>
              {businessData.room || 'Consultório 04'} • {businessData.attendantName || 'Dr. Carlos Mendes'}
            </div>

            <div style={{ marginTop: 28 }}>
              <button
                onClick={handleRecallActiveTicket}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Volume2 size={18} />
                <span>Re-anunciar com Som e Voz</span>
              </button>
            </div>
          </div>

          {/* Bottom History Strip */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              Últimas Chamadas no Painel:
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#e2e8f0', fontFamily: 'Outfit' }}>#43</span>
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>Maria Silva (Concluído)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#e2e8f0', fontFamily: 'Outfit' }}>#42</span>
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>Pedro Lima (Concluído)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#e2e8f0', fontFamily: 'Outfit' }}>#41</span>
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>Mariana Alencar (Concluído)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Ticket Issuer Modal */}
      {showManualModal && (
        <div className="ff-modal-overlay" onClick={() => setShowManualModal(false)}>
          <div className="ff-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ff-modal-header">
              <h3 className="ff-modal-title">Emitir Senha Presencial de Balcão</h3>
              <button onClick={() => setShowManualModal(false)} style={{ color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateManualTicket} style={{ padding: 24 }}>
              <div className="ff-form" style={{ gap: 16 }}>
                <div className="ff-form-group">
                  <label className="ff-form-label">Nome do Cliente ou Paciente *</label>
                  <input
                    type="text"
                    className="ff-input"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo"
                    style={{ paddingLeft: 14 }}
                    autoFocus
                    required
                  />
                </div>

                <div className="ff-form-group">
                  <label className="ff-form-label">Serviço Pretendido</label>
                  <select
                    className="ff-input"
                    value={manualService}
                    onChange={(e) => setManualService(e.target.value)}
                    style={{ paddingLeft: 14 }}
                  >
                    <option>Consulta Oftalmologia Geral</option>
                    <option>Exame de Fundo de Olho</option>
                    <option>Retorno de Consulta</option>
                    <option>Avaliação Pré-Operatória</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
                  <input
                    type="checkbox"
                    id="priorityCheck"
                    checked={isPriority}
                    onChange={(e) => setIsPriority(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#7c3aed', cursor: 'pointer' }}
                  />
                  <label htmlFor="priorityCheck" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    Atendimento Prioritário (Lei 10.048 - 60+, Gestante, PCD)
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#7c3aed', width: '100%', justifyContent: 'center', padding: 12, marginTop: 8 }}
                >
                  <Plus size={16} />
                  <span>Imprimir & Inserir na Fila</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice / Broadcast Modal */}
      {showNoticeModal && (
        <div className="ff-modal-overlay" onClick={() => setShowNoticeModal(false)}>
          <div className="ff-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="ff-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="ff-modal-title">Comunicado da Recepção</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Exibido no topo do painel e no Telão TV da sala de espera</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNoticeModal(false)} 
                style={{ color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px 24px' }}>
              <label className="ff-form-label" style={{ marginBottom: 8, display: 'block' }}>
                Texto do Aviso ou Comunicado
              </label>
              <textarea
                className="ff-form-input"
                rows={3}
                style={{ width: '100%', padding: '10px 14px', resize: 'vertical', fontSize: 13, minHeight: 80 }}
                placeholder="Ex: Dra. Beatriz está em atendimento no Consultório 04. Aguarde ser chamado."
                value={noticeDraft}
                onChange={(e) => setNoticeDraft(e.target.value)}
              />

              {/* Quick Template Chips */}
              <div style={{ marginTop: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sugestões Rápidas:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {[
                    'Atendimento normal nos consultórios e guichês',
                    'Intervalo da equipe técnica (retorno em 10 minutos)',
                    'Prioridades por lei sendo chamadas preferencialmente',
                    'Favor retirar o comprovante de saída no balcão principal'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoticeDraft(chip)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 999,
                        padding: '5px 12px',
                        fontSize: 12,
                        color: '#475569',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                <button
                  type="button"
                  onClick={() => {
                    setReceptionNotice('');
                    setShowNoticeModal(false);
                    showNotification('Comunicado removido do telão e do painel.');
                  }}
                  className="btn-ghost"
                  style={{ flex: 1, padding: 11, border: '1px solid #e2e8f0', justifyContent: 'center' }}
                >
                  Limpar Aviso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReceptionNotice(noticeDraft);
                    setShowNoticeModal(false);
                    showNotification('Comunicado publicado com sucesso no Telão e Painel!');
                  }}
                  className="btn-primary"
                  style={{ flex: 1.5, padding: 11, background: '#7c3aed', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={15} />
                  <span>Publicar no Telão</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
