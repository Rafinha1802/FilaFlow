import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Users, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Phone, 
  Coffee, 
  LogOut, 
  Check, 
  ChevronRight, 
  ChevronDown,
  Send, 
  Building2, 
  Layers, 
  Activity,
  Flame,
  ShieldCheck,
  Smartphone,
  Info,
  X,
  Printer,
  Copy,
  UserPlus,
  FileCheck,
  RefreshCw,
  Award
} from 'lucide-react';

export default function ProfessionalWorkspace({
  professional,
  allProfessionals = [],
  onSwitchProfessional,
  onLogout,
  onGoToSite,
  onOpenMobileView
}) {
  // Active Professional Data
  const pro = professional || {
    name: 'Dr. Carlos Mendes',
    role: 'Médico Oftalmologista',
    specialty: 'Oftalmologia Clínica & Cirúrgica',
    category: 'Clínica',
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    room: 'Consultório 04',
    avatar: '👨‍⚕️',
    crm: 'CRM/SP 148.920',
    targetConsultationMinutes: 20,
    currentTicket: {
      ticket: '#47',
      name: 'Rafael Silva',
      service: 'Consulta Oftalmologia Geral',
      age: '29 anos',
      convenio: 'Unimed Pleno',
      timeJoined: '13:45',
      room: 'Consultório 04',
      status: 'attending',
      clientOnWay: true,
      notes: 'Paciente relatou leve cansaço visual ao trabalhar no computador. Realizado exame de refração preliminar.'
    },
    waitingList: [
      { ticket: '#48', name: 'Mariana Alencar', service: 'Avaliação Cirúrgica Catarata', time: '~10 min', isPriority: true, status: 'saguao', phone: '(11) 98877-6655', priorityReason: 'Prioridade Lei 10.048 (Idoso 68a)' },
      { ticket: '#49', name: 'Roberto Camargo', service: 'Exame de Refração & Grau', time: '~25 min', isPriority: false, status: 'cafeteria', phone: '(11) 97766-5544', priorityReason: null },
      { ticket: '#50', name: 'Beatriz Vasconcelos', service: 'Retorno de Consulta', time: '~40 min', isPriority: false, status: 'a_caminho', phone: '(11) 96655-4433', priorityReason: null },
      { ticket: '#51', name: 'Lucas Penteado', service: 'Consulta Oftalmologia Geral', time: '~55 min', isPriority: false, status: 'saguao', phone: '(11) 95544-3322', priorityReason: null }
    ],
    historyToday: [
      { ticket: '#43', name: 'Maria Silva', service: 'Consulta Geral', duration: '18m 20s', completedAt: '13:18' },
      { ticket: '#44', name: 'João Santos', service: 'Fundo de Olho', duration: '15m 10s', completedAt: '13:35' },
      { ticket: '#45', name: 'Ana Costa', service: 'Retorno de Consulta', duration: '12m 45s', completedAt: '13:50' },
      { ticket: '#46', name: 'Pedro Lima', service: 'Avaliação Inicial', duration: '21m 05s', completedAt: '14:12' }
    ]
  };

  // State Management
  const [currentTicket, setCurrentTicket] = useState(pro.currentTicket || null);
  const [waitingList, setWaitingList] = useState(pro.waitingList || []);
  const [historyList, setHistoryList] = useState(pro.historyToday || []);

  // Timer States
  const [timerSeconds, setTimerSeconds] = useState(14 * 60 + 28); // Starts at 14m 28s for rich demo
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [targetMinutes, setTargetMinutes] = useState(pro.targetConsultationMinutes || 20);

  // Status & Modes
  const [consultationStatus, setConsultationStatus] = useState('attending'); // 'attending' | 'ready' | 'break'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Quick Notes & Fast Tags
  const [notes, setNotes] = useState(pro.currentTicket?.notes || '');
  const [notesSavedToast, setNotesSavedToast] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR'));

  // Modals
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInService, setWalkInService] = useState('Consulta Geral');
  const [walkInPriority, setWalkInPriority] = useState(false);
  const [walkInInsertTop, setWalkInInsertTop] = useState(false);

  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [rxDocType, setRxDocType] = useState('atestado'); // 'atestado' | 'receita' | 'declaracao'
  const [rxDays, setRxDays] = useState('2');
  const [rxDetails, setRxDetails] = useState('Repouso domiciliar por motivo de saúde (CID Z00.0). Retorno se houver persistência dos sintomas.');
  const [rxCopied, setRxCopied] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSwitchMenuOpen, setIsSwitchMenuOpen] = useState(false);

  // Sync state if external professional prop changes
  useEffect(() => {
    if (professional) {
      setCurrentTicket(professional.currentTicket || null);
      setWaitingList(professional.waitingList || []);
      setHistoryList(professional.historyToday || []);
      setTargetMinutes(professional.targetConsultationMinutes || 20);
      setTimerSeconds(10 * 60 + 15);
      setNotes(professional.currentTicket?.notes || '');
      setConsultationStatus('attending');
      setIsTimerRunning(true);
    }
  }, [professional?.id]);

  // Live Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && consultationStatus === 'attending') {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, consultationStatus]);

  // Live Wall Clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Audio Bell Chime + Speech Synthesis in PT-BR
  const playAnnouncementSound = (ticketNumber, clientName, roomName) => {
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
      console.log('AudioContext not allowed without gesture');
    }

    // 2. Speech Synthesis in Portuguese
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanTicket = (ticketNumber || '#00').replace('#', '');
        const text = `Senha ${cleanTicket}. ${clientName || 'Paciente'}. ${roomName || pro.room}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech synthesis unavailable');
    }
  };

  // Formatter: mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Calculation for consultation pacing
  const targetSeconds = targetMinutes * 60;
  const progressPercent = Math.min(100, Math.round((timerSeconds / targetSeconds) * 100));
  const isOverTime = timerSeconds > targetSeconds;
  const overtimeSeconds = timerSeconds - targetSeconds;

  // Add Time Handler (+5, +10, +15 min)
  const handleAddMinutes = (additionalMinutes) => {
    setTargetMinutes(prev => prev + additionalMinutes);
    showToast(
      `⏱️ +${additionalMinutes} min adicionados! A IA FilaFlow recalculou os horários dos ${waitingList.length} pacientes na fila e notificou os celulares.`
    );
  };

  // Call Next Ticket
  const handleCallNext = () => {
    if (waitingList.length === 0) {
      showToast('⚠️ Não há mais pacientes aguardando na fila deste consultório.');
      return;
    }

    const nextPatient = waitingList[0];
    const updatedWaiting = waitingList.slice(1);

    // Save previous patient to history if exists
    if (currentTicket) {
      const completedItem = {
        ticket: currentTicket.ticket,
        name: currentTicket.name,
        service: currentTicket.service,
        duration: formatTime(timerSeconds),
        completedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setHistoryList(prev => [completedItem, ...prev]);
    }

    // Set new active ticket
    setCurrentTicket({
      ticket: nextPatient.ticket,
      name: nextPatient.name,
      service: nextPatient.service,
      age: nextPatient.priorityReason ? 'Atendimento Prioritário' : 'Consulta Agendada',
      convenio: 'Unimed / Particular',
      timeJoined: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      room: pro.room,
      status: 'attending',
      clientOnWay: false,
      notes: ''
    });

    setWaitingList(updatedWaiting);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setConsultationStatus('attending');
    setNotes('');

    // Audio & Voice Call
    playAnnouncementSound(nextPatient.ticket, nextPatient.name, pro.room);
    showToast(`🔔 Chamando Senha ${nextPatient.ticket} (${nextPatient.name}) para o ${pro.room}!`);
  };

  // Re-call current patient
  const handleRecallCurrent = () => {
    if (!currentTicket) return;
    playAnnouncementSound(currentTicket.ticket, currentTicket.name, pro.room);
    showToast(`📢 Re-chamando ${currentTicket.name} (Senha ${currentTicket.ticket})! Notificação reforçada no celular.`);
  };

  // Finish current consultation
  const handleFinishConsultation = () => {
    if (!currentTicket) return;

    const completedItem = {
      ticket: currentTicket.ticket,
      name: currentTicket.name,
      service: currentTicket.service,
      duration: formatTime(timerSeconds),
      completedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setHistoryList(prev => [completedItem, ...prev]);
    setCurrentTicket(null);
    setIsTimerRunning(false);
    setConsultationStatus('ready');
    showToast(`✅ Consulta de ${completedItem.name} finalizada (${completedItem.duration}). Consultório pronto para o próximo!`);
  };

  // Save clinical notes
  const handleSaveNotes = () => {
    setNotesSavedToast(true);
    setTimeout(() => setNotesSavedToast(false), 2500);
    showToast('💾 Anotação salva com sucesso no prontuário digital!');
  };

  // Append Fast Tag
  const handleAddFastTag = (tagText) => {
    setNotes(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n• ${tagText}` : `• ${tagText}`;
    });
  };

  // Notify specific patient on WhatsApp
  const handleNotifyWhatsApp = (patient) => {
    showToast(`📲 Mensagem enviada para ${patient.name} (${patient.phone || '(11) 98888-7777'}): "${pro.name} solicita sua aproximação do ${pro.room}."`);
  };

  // Move patient to end of waiting queue
  const handleMoveToEnd = (patient) => {
    const filtered = waitingList.filter(p => p.ticket !== patient.ticket);
    const updatedPatient = { ...patient, time: `~${(waitingList.length) * 15} min` };
    setWaitingList([...filtered, updatedPatient]);
    showToast(`🔄 Paciente ${patient.name} (${patient.ticket}) remanejado para o final da fila.`);
  };

  // Remove patient / mark absent
  const handleMarkAbsent = (patient) => {
    if (confirm(`Deseja marcar a senha ${patient.ticket} (${patient.name}) como ausente?`)) {
      setWaitingList(waitingList.filter(p => p.ticket !== patient.ticket));
      showToast(`❌ Senha ${patient.ticket} marcada como ausente.`);
    }
  };

  // Handle Walk-in Insertion (Encaixe Rápido)
  const handleAddWalkIn = (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    const randomNum = Math.floor(52 + Math.random() * 40);
    const newPatient = {
      ticket: `#${randomNum}`,
      name: walkInName.trim(),
      service: walkInService,
      time: walkInInsertTop ? '~5 min' : `~${(waitingList.length + 1) * 15} min`,
      isPriority: walkInPriority,
      status: 'saguao',
      phone: '(11) 98000-1122',
      priorityReason: walkInPriority ? 'Encaixe de Urgência' : null
    };

    if (walkInInsertTop) {
      setWaitingList([newPatient, ...waitingList]);
    } else {
      setWaitingList([...waitingList, newPatient]);
    }

    setIsWalkInModalOpen(false);
    setWalkInName('');
    setWalkInPriority(false);
    setWalkInInsertTop(false);
    showToast(`✨ Encaixe rápido criado! Senha ${newPatient.ticket} adicionada para ${newPatient.name}.`);
  };

  // Toggle Break Mode
  const handleToggleBreak = () => {
    if (consultationStatus === 'break') {
      setConsultationStatus('attending');
      setIsTimerRunning(true);
      showToast(`☕ Intervalo finalizado. ${pro.name} está novamente disponível no ${pro.room}.`);
    } else {
      setConsultationStatus('break');
      setIsTimerRunning(false);
      showToast(`☕ Modo Intervalo ativado (15 min). A IA FilaFlow informou os pacientes na sala de espera com previsão ajustada.`);
    }
  };

  // Copy Digital Rx
  const handleCopyRx = () => {
    const text = `--- FILAFLOW HEALTH ---\nDOCUMENTO CLÍNICO DIGITAL\nProfissional: ${pro.name} (${pro.crm})\nLocal: ${pro.companyName} - ${pro.room}\nPaciente: ${currentTicket?.name || 'Paciente'}\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nTipo: ${rxDocType.toUpperCase()}\nPrescrição / Justificativa:\n${rxDetails}\n\nCódigo de Validação Digital: FLF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    navigator.clipboard?.writeText(text);
    setRxCopied(true);
    setTimeout(() => setRxCopied(false), 2500);
    showToast('📋 Documento clínico copiado com chave digital!');
  };

  return (
    <div className="ff-pro-layout">
      {/* Toast notification */}
      {toastMessage && (
        <div className="ff-pro-toast">
          <Sparkles size={18} color="#c084fc" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header do Profissional */}
      <header className="ff-pro-header">
        <div className="ff-pro-header-left">
          <div className="ff-pro-avatar-box">
            <span className="pro-avatar-emoji">{pro.avatar || '👨‍⚕️'}</span>
            <span className={`pro-status-dot ${consultationStatus === 'attending' ? 'green' : consultationStatus === 'break' ? 'amber' : 'blue'}`}></span>
          </div>

          <div className="ff-pro-identity">
            <div className="pro-name-row">
              <h1 className="pro-name">{pro.name}</h1>
              <span className="pro-crm-badge">{pro.crm}</span>

              {/* Demo Professional Switcher */}
              {allProfessionals.length > 1 && (
                <div className="pro-switcher-wrapper">
                  <button 
                    className="btn-pro-switch"
                    onClick={() => setIsSwitchMenuOpen(!isSwitchMenuOpen)}
                    title="Alternar entre médicos e especialistas de teste"
                  >
                    <span>Trocar Perfil</span>
                    <ChevronDown size={13} />
                  </button>

                  {isSwitchMenuOpen && (
                    <div className="pro-switch-menu">
                      <div className="switch-menu-title">Especialistas Disponíveis (Demo)</div>
                      {allProfessionals.map((item) => (
                        <button
                          key={item.id}
                          className={`switch-menu-item ${item.id === pro.id ? 'active' : ''}`}
                          onClick={() => {
                            if (onSwitchProfessional) onSwitchProfessional(item);
                            setIsSwitchMenuOpen(false);
                            showToast(`Perfil alterado para ${item.name} (${item.specialty})`);
                          }}
                        >
                          <span className="item-emoji">{item.avatar}</span>
                          <div className="item-text">
                            <span className="item-name">{item.name}</span>
                            <span className="item-sub">{item.specialty} • {item.companyName}</span>
                          </div>
                          {item.id === pro.id && <Check size={14} color="#7c3aed" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="pro-sub-row">
              <span className="pro-role-text">{pro.role} • {pro.specialty}</span>
              <span className="pro-divider">•</span>
              <span className="pro-room-pill">
                <Building2 size={12} />
                <span>{pro.companyName} ({pro.room})</span>
              </span>
              <span className="pro-divider">•</span>
              <span className="pro-clock-pill">
                <Clock size={12} />
                <span>{currentTime}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="ff-pro-header-right">
          {/* Status Chip */}
          <div className={`ff-pro-live-status-chip ${consultationStatus}`}>
            <span className="live-dot-pulse"></span>
            <span>
              {consultationStatus === 'attending' ? 'Em Atendimento Ativo' : 
               consultationStatus === 'break' ? 'Em Intervalo (15 min)' : 
               'Aguardando Próximo'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button 
            className={`ff-pro-btn-tool ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Áudio ativado (Gongo e Chamada por Voz em Português)' : 'Áudio silenciado'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Break Mode Button */}
          <button 
            className={`ff-pro-btn-tool ${consultationStatus === 'break' ? 'active-amber' : ''}`}
            onClick={handleToggleBreak}
            title="Pausa rápida para café ou descanso"
          >
            <Coffee size={16} />
            <span>{consultationStatus === 'break' ? 'Retomar Consultório' : 'Intervalo'}</span>
          </button>

          {/* End of Shift / Report */}
          <button 
            className="ff-pro-btn-tool"
            onClick={() => setIsReportModalOpen(true)}
            title="Ver resumo e relatório do turno de hoje"
          >
            <Activity size={16} />
            <span className="hidden-sm">Relatório Turno</span>
          </button>

          {/* Logout */}
          <button 
            className="ff-pro-btn-tool logout"
            onClick={onLogout}
            title="Sair do consultório"
          >
            <LogOut size={16} />
            <span className="hidden-sm">Sair</span>
          </button>
        </div>
      </header>

      {/* 2. Grid Principal Operacional */}
      <main className="ff-pro-main-grid">
        {/* COLUNA ESQUERDA: Cronômetro da Consulta + Paciente Atual + Prontuário Express */}
        <div className="ff-pro-left-col">
          {/* CARD 1: Cronômetro Central da Consulta */}
          <div className="ff-pro-timer-card">
            <div className="timer-card-head">
              <div className="timer-title-group">
                <Clock size={18} className="timer-icon" />
                <div>
                  <h2 className="timer-title">Cronômetro da Consulta</h2>
                  <span className="timer-sub">Controle de tempo em tempo real com calibração inteligente por IA</span>
                </div>
              </div>

              <div className="timer-target-tag">
                <span>Tempo previsto: <strong>{targetMinutes} min</strong></span>
              </div>
            </div>

            {/* Display do Cronômetro */}
            <div className="timer-display-hero">
              <div className="timer-big-digits-box">
                <span className={`timer-digits ${isOverTime ? 'overtime' : ''}`}>
                  {formatTime(timerSeconds)}
                </span>
                <span className="timer-unit">min : seg</span>
              </div>

              <div className="timer-controls-row">
                <button 
                  className={`btn-timer-action ${isTimerRunning ? 'pause' : 'play'}`}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  title={isTimerRunning ? 'Pausar cronômetro' : 'Continuar cronômetro'}
                >
                  {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isTimerRunning ? 'Pausar' : 'Continuar'}</span>
                </button>

                <button 
                  className="btn-timer-action reset"
                  onClick={() => setTimerSeconds(0)}
                  title="Zerar cronômetro da consulta atual"
                >
                  <RotateCcw size={15} />
                  <span>Zerar</span>
                </button>
              </div>
            </div>

            {/* Barra de Progresso Visual */}
            <div className="timer-progress-container">
              <div className="timer-progress-track">
                <div 
                  className={`timer-progress-fill ${isOverTime ? 'overtime' : progressPercent > 80 ? 'warning' : 'normal'}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="timer-progress-labels">
                <span>Início (00:00)</span>
                <span className="timer-progress-status">
                  {isOverTime ? (
                    <span className="text-danger">
                      ⚠️ Excedido em +{formatTime(overtimeSeconds)} (IA recalculando próximos)
                    </span>
                  ) : progressPercent > 80 ? (
                    <span className="text-warning">
                      ⏱️ Reta final ({targetMinutes * 60 - timerSeconds > 0 ? `${targetMinutes * 60 - timerSeconds}s restantes` : 'Finalizando'})
                    </span>
                  ) : (
                    <span className="text-success">
                      ✓ Ritmo ideal ({progressPercent}% do tempo)
                    </span>
                  )}
                </span>
                <span>Meta: {targetMinutes}:00</span>
              </div>
            </div>

            {/* Botões para Estender o Tempo da Consulta */}
            <div className="timer-add-time-section">
              <span className="add-time-label">
                <Sparkles size={14} color="#7c3aed" />
                <span>Aumentar tempo da consulta (A IA recalcula os próximos da fila automaticamente):</span>
              </span>
              <div className="add-time-btn-group">
                <button 
                  className="btn-add-time" 
                  onClick={() => handleAddMinutes(5)}
                  title="Conceder mais 5 minutos de consulta"
                >
                  <Plus size={13} />
                  <span>+5 min</span>
                </button>
                <button 
                  className="btn-add-time" 
                  onClick={() => handleAddMinutes(10)}
                  title="Conceder mais 10 minutos de consulta"
                >
                  <Plus size={13} />
                  <span>+10 min</span>
                </button>
                <button 
                  className="btn-add-time" 
                  onClick={() => handleAddMinutes(15)}
                  title="Conceder mais 15 minutos de consulta"
                >
                  <Plus size={13} />
                  <span>+15 min</span>
                </button>
                <button 
                  className="btn-add-time custom" 
                  onClick={() => {
                    const customMin = prompt('Quantos minutos extras deseja adicionar à consulta atual?', '20');
                    if (customMin && !isNaN(customMin)) {
                      handleAddMinutes(parseInt(customMin, 10));
                    }
                  }}
                  title="Definir tempo personalizado"
                >
                  <span>Outro tempo...</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: Paciente Atual em Atendimento */}
          <div className="ff-pro-patient-card">
            <div className="patient-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="patient-status-indicator pulse-green"></span>
                <h3 className="patient-card-title">Paciente Atual no Consultório</h3>
              </div>

              {currentTicket && (
                <div className="patient-presence-badge">
                  {currentTicket.clientOnWay ? (
                    <span className="badge-on-way">🚶 Paciente a caminho (~2 min)</span>
                  ) : (
                    <span className="badge-in-room">🟢 No Consultório</span>
                  )}
                </div>
              )}
            </div>

            {currentTicket ? (
              <div className="patient-body">
                <div className="patient-primary-row">
                  <div className="patient-ticket-box">
                    <span className="ticket-label">SENHA</span>
                    <span className="ticket-val">{currentTicket.ticket}</span>
                  </div>

                  <div className="patient-details">
                    <div className="patient-name-line">
                      <span className="patient-name">{currentTicket.name}</span>
                      <span className="patient-age-tag">{currentTicket.age}</span>
                    </div>
                    <div className="patient-service-line">
                      <span>{currentTicket.service}</span>
                      <span className="sub-bullet">•</span>
                      <span className="patient-convenio">{currentTicket.convenio}</span>
                    </div>
                    <div className="patient-meta-line">
                      <span>Chamado às {currentTicket.timeJoined}</span>
                      <span className="sub-bullet">•</span>
                      <span>Consultório: <strong>{currentTicket.room}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas do Paciente Atual */}
                <div className="patient-action-bar">
                  <button 
                    className="btn-pro-action recall"
                    onClick={handleRecallCurrent}
                    title="Tocar gongo e re-anunciar senha por voz e no celular"
                  >
                    <Volume2 size={16} />
                    <span>Re-chamar Senha</span>
                  </button>

                  <button 
                    className="btn-pro-action rx-doc"
                    onClick={() => setIsRxModalOpen(true)}
                    title="Emitir Atestado, Receita Digital ou Declaração com Chave de Validação"
                  >
                    <FileCheck size={16} />
                    <span>Atestado / Receita</span>
                  </button>

                  <button 
                    className="btn-pro-action finish"
                    onClick={handleFinishConsultation}
                    title="Finalizar esta consulta e liberar consultório"
                  >
                    <CheckCircle2 size={16} />
                    <span>Finalizar Consulta</span>
                  </button>
                </div>

                {/* Anotações Rápidas / Prontuário Express */}
                <div className="patient-notes-box">
                  <div className="notes-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} color="#6d28d9" />
                      <span className="notes-title">Anotações Clínicas & Conduta (Prontuário Express)</span>
                    </div>
                    {notesSavedToast && (
                      <span className="notes-saved-badge">
                        <Check size={12} />
                        <span>Salvo na nuvem!</span>
                      </span>
                    )}
                  </div>

                  {/* Fast Action Tags */}
                  <div className="notes-fast-tags">
                    <span className="fast-tags-label">Tags Rápidas:</span>
                    <button type="button" className="tag-pill" onClick={() => handleAddFastTag('Receituário emitido')}>
                      + Receita emitida
                    </button>
                    <button type="button" className="tag-pill" onClick={() => handleAddFastTag('Exames laboratoriais/imagem solicitados')}>
                      + Pedido de exame
                    </button>
                    <button type="button" className="tag-pill" onClick={() => handleAddFastTag('Retorno agendado em 15 dias')}>
                      + Retorno 15 dias
                    </button>
                    <button type="button" className="tag-pill" onClick={() => handleAddFastTag('Atestado médico emitido')}>
                      + Atestado emitido
                    </button>
                    <button type="button" className="tag-pill" onClick={() => handleAddFastTag('Orientações de rotina passadas')}>
                      + Orientações gerais
                    </button>
                  </div>

                  <textarea 
                    className="notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite queixas do paciente, receituário ou observações da consulta..."
                    rows={3}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                      Criptografia ponta a ponta • Armazenado em conformidade com a LGPD
                    </span>
                    <button 
                      type="button" 
                      className="btn-save-notes"
                      onClick={handleSaveNotes}
                    >
                      <Check size={13} />
                      <span>Salvar Anotação</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="patient-empty-state">
                <div className="empty-icon-circle">
                  <User size={28} color="#94a3b8" />
                </div>
                <h4>Consultório Livre no Momento</h4>
                <p>Nenhum paciente está sendo atendido agora. Clique no botão abaixo para chamar o próximo da fila.</p>
                <button 
                  className="btn-call-hero" 
                  onClick={handleCallNext}
                  disabled={waitingList.length === 0}
                >
                  <Play size={18} />
                  <span>Chamar Próximo Paciente Agora</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: Botão Grandioso de Chamada + Lista de Espera + Métricas do Dia */}
        <div className="ff-pro-right-col">
          {/* BOTÃO HERO: Chamar Próximo Paciente */}
          <div className="ff-pro-call-hero-box">
            <button 
              className="btn-call-next-giant"
              onClick={handleCallNext}
              disabled={waitingList.length === 0}
            >
              <div className="giant-icon-wrap">
                <Volume2 size={28} />
              </div>
              <div className="giant-text-wrap">
                <span className="giant-title">CHAMAR PRÓXIMO PACIENTE</span>
                <span className="giant-sub">
                  {waitingList.length > 0 
                    ? `Próximo: ${waitingList[0].ticket} - ${waitingList[0].name} (Gongo + Voz em Português)`
                    : 'Não há mais pacientes aguardando'}
                </span>
              </div>
              <ArrowRight size={22} className="giant-arrow" />
            </button>
          </div>

          {/* CARD 3: Fila de Espera dos Próximos Pacientes */}
          <div className="ff-pro-queue-card">
            <div className="queue-card-head">
              <div className="queue-title-group">
                <Users size={17} color="#7c3aed" />
                <h3 className="queue-title">Próximos Pacientes na Fila</h3>
                <span className="queue-counter-pill">{waitingList.length} aguardando</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn-walkin-trigger"
                  onClick={() => setIsWalkInModalOpen(true)}
                  title="Adicionar paciente avulso ou encaixe de emergência na fila"
                >
                  <UserPlus size={13} />
                  <span>+ Encaixe Rápido</span>
                </button>

                <span className="queue-sync-tag">
                  <span className="live-dot-pulse green"></span>
                  <span>Sincronizado</span>
                </span>
              </div>
            </div>

            {waitingList.length > 0 ? (
              <div className="queue-patient-list">
                {waitingList.map((patient, index) => (
                  <div key={patient.ticket} className={`queue-patient-row ${index === 0 ? 'next-in-line' : ''}`}>
                    <div className="queue-pos-badge">
                      <span>{index + 1}º</span>
                    </div>

                    <div className="queue-ticket-chip">
                      <span>{patient.ticket}</span>
                    </div>

                    <div className="queue-patient-info">
                      <div className="patient-name-row">
                        <span className="patient-name">{patient.name}</span>
                        {patient.isPriority && (
                          <span className="patient-priority-chip">
                            <ShieldCheck size={11} />
                            <span>Prioridade</span>
                          </span>
                        )}
                      </div>
                      <div className="patient-service-sub">
                        <span>{patient.service}</span>
                        <span className="sub-bullet">•</span>
                        <span className="patient-wait-time">Espera: {patient.time}</span>
                      </div>
                      <div className="patient-location-status">
                        {patient.status === 'saguao' ? (
                          <span className="status-badge green">🟢 No saguão da recepção</span>
                        ) : patient.status === 'a_caminho' ? (
                          <span className="status-badge amber">🚶 A caminho (a ~300m)</span>
                        ) : (
                          <span className="status-badge blue">☕ Na cafeteria do prédio</span>
                        )}
                      </div>
                    </div>

                    <div className="queue-action-col">
                      <button 
                        className="btn-row-action call"
                        onClick={() => {
                          // Call this specific patient directly
                          const chosen = patient;
                          const filtered = waitingList.filter(p => p.ticket !== chosen.ticket);
                          if (currentTicket) {
                            setHistoryList(prev => [{
                              ticket: currentTicket.ticket,
                              name: currentTicket.name,
                              service: currentTicket.service,
                              duration: formatTime(timerSeconds),
                              completedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                            }, ...prev]);
                          }
                          setCurrentTicket({
                            ticket: chosen.ticket,
                            name: chosen.name,
                            service: chosen.service,
                            age: chosen.priorityReason || 'Agendado',
                            convenio: 'Unimed / Particular',
                            timeJoined: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                            room: pro.room,
                            status: 'attending',
                            clientOnWay: false,
                            notes: ''
                          });
                          setWaitingList(filtered);
                          setTimerSeconds(0);
                          setIsTimerRunning(true);
                          playAnnouncementSound(chosen.ticket, chosen.name, pro.room);
                          showToast(`Chamando ${chosen.ticket} - ${chosen.name} para o ${pro.room}!`);
                        }}
                        title="Chamar este paciente diretamente agora"
                      >
                        <Volume2 size={14} />
                        <span>Chamar</span>
                      </button>

                      <button 
                        className="btn-row-action notify"
                        onClick={() => handleNotifyWhatsApp(patient)}
                        title="Enviar aviso para o WhatsApp do paciente"
                      >
                        <Send size={13} />
                      </button>

                      <button 
                        className="btn-row-action delay"
                        onClick={() => handleMoveToEnd(patient)}
                        title="Mover para o fim da fila se atrasou"
                      >
                        <RefreshCw size={13} />
                      </button>

                      <button 
                        className="btn-row-action absent"
                        onClick={() => handleMarkAbsent(patient)}
                        title="Marcar falta / Ausente"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="queue-empty-box">
                <CheckCircle2 size={32} color="#10b981" />
                <p>Todos os pacientes da fila foram atendidos com sucesso!</p>
              </div>
            )}
          </div>

          {/* CARD 4: Métricas do Dia do Profissional & Histórico */}
          <div className="ff-pro-stats-card">
            <div className="stats-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={16} color="#7c3aed" />
                <h3 className="stats-title">Resumo do Seu Dia de Atendimento</h3>
              </div>
              <button 
                className="btn-view-report"
                onClick={() => setIsReportModalOpen(true)}
              >
                <span>Ver Relatório Completo</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="stats-metric-grid">
              <div className="stats-box">
                <span className="stats-val">{historyList.length}</span>
                <span className="stats-lbl">Atendidos Hoje</span>
              </div>
              <div className="stats-box">
                <span className="stats-val">17 min</span>
                <span className="stats-lbl">Média / Consulta</span>
              </div>
              <div className="stats-box">
                <span className="stats-val">{waitingList.length}</span>
                <span className="stats-lbl">Restantes na Fila</span>
              </div>
              <div className="stats-box">
                <span className="stats-val text-emerald">96%</span>
                <span className="stats-lbl">Pontualidade IA</span>
              </div>
            </div>

            {/* Histórico compacto */}
            <div className="history-compact-section">
              <span className="history-title">Últimos Atendidos Nesta Sessão:</span>
              <div className="history-chips-row">
                {historyList.slice(0, 4).map((h, i) => (
                  <div key={i} className="history-chip">
                    <span className="h-ticket">{h.ticket}</span>
                    <span className="h-name">{h.name}</span>
                    <span className="h-time">{h.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Encaixe Rápido de Paciente */}
      {isWalkInModalOpen && (
        <div className="ff-pro-modal-overlay" onClick={() => setIsWalkInModalOpen(false)}>
          <div className="ff-pro-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ff-pro-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="#7c3aed" />
                <h3>Adicionar Paciente / Encaixe de Urgência</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setIsWalkInModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="ff-pro-modal-form">
              <div className="form-group">
                <label>Nome Completo do Paciente *</label>
                <input 
                  type="text" 
                  value={walkInName}
                  onChange={e => setWalkInName(e.target.value)}
                  placeholder="Ex: Fernanda Vasconcelos" 
                  required 
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Procedimento / Serviço</label>
                <input 
                  type="text" 
                  value={walkInService}
                  onChange={e => setWalkInService(e.target.value)}
                  placeholder="Ex: Avaliação de Retorno ou Consulta Geral" 
                />
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={walkInPriority}
                    onChange={e => setWalkInPriority(e.target.checked)}
                  />
                  <span>Atendimento Preferencial (Lei 10.048 - Idoso / Gestante / PCD)</span>
                </label>

                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={walkInInsertTop}
                    onChange={e => setWalkInInsertTop(e.target.checked)}
                  />
                  <span>Colocar no Topo da Fila (Urgência Imediata)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsWalkInModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm">
                  <UserPlus size={15} />
                  <span>Gerar Senha e Adicionar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Atestado / Receituário Express */}
      {isRxModalOpen && (
        <div className="ff-pro-modal-overlay" onClick={() => setIsRxModalOpen(false)}>
          <div className="ff-pro-modal-card rx-modal" onClick={e => e.stopPropagation()}>
            <div className="ff-pro-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileCheck size={18} color="#7c3aed" />
                <h3>Emissão de Documento Clínico Digital Express</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setIsRxModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="rx-modal-body">
              <div className="rx-doc-tabs">
                <button 
                  type="button"
                  className={`rx-tab ${rxDocType === 'atestado' ? 'active' : ''}`}
                  onClick={() => setRxDocType('atestado')}
                >
                  Atestado Médico
                </button>
                <button 
                  type="button"
                  className={`rx-tab ${rxDocType === 'receita' ? 'active' : ''}`}
                  onClick={() => setRxDocType('receita')}
                >
                  Receita de Medicamentos
                </button>
                <button 
                  type="button"
                  className={`rx-tab ${rxDocType === 'declaracao' ? 'active' : ''}`}
                  onClick={() => setRxDocType('declaracao')}
                >
                  Declaração de Comparecimento
                </button>
              </div>

              {rxDocType === 'atestado' && (
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label>Dias de Repouso Recomendados:</label>
                  <div className="days-selector">
                    {['1', '2', '3', '5', '7', '14'].map(d => (
                      <button
                        key={d}
                        type="button"
                        className={`day-pill ${rxDays === d ? 'active' : ''}`}
                        onClick={() => {
                          setRxDays(d);
                          setRxDetails(`Atesto para os devidos fins que o paciente necessita de ${d} dia(s) de repouso por motivo de saúde a contar desta data. CID Z00.0.`);
                        }}
                      >
                        {d} {d === '1' ? 'dia' : 'dias'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Texto da Prescrição ou Diagnóstico:</label>
                <textarea 
                  rows={4} 
                  value={rxDetails}
                  onChange={e => setRxDetails(e.target.value)}
                  className="rx-textarea"
                />
              </div>

              {/* Digital Certificate Preview */}
              <div className="rx-preview-card">
                <div className="rx-preview-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={13} color="#7c3aed" />
                    <strong>{pro.companyName}</strong> - {pro.room}
                  </div>
                  <span className="rx-date">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="rx-preview-content">
                  <p><strong>Paciente:</strong> {currentTicket?.name || 'Paciente Atual'} ({currentTicket?.ticket || '#00'})</p>
                  <p style={{ marginTop: 6, fontStyle: 'italic' }}>"{rxDetails}"</p>
                </div>
                <div className="rx-preview-footer">
                  <div>
                    <strong>{pro.name}</strong> • {pro.crm}
                  </div>
                  <div className="rx-digital-seal">
                    <ShieldCheck size={13} color="#10b981" />
                    <span>Assinado Digitalmente ICP-Brasil (Simulado FilaFlow)</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 16 }}>
                <button type="button" className="btn-cancel" onClick={() => setIsRxModalOpen(false)}>
                  Fechar
                </button>
                <button type="button" className="btn-secondary-action" onClick={handleCopyRx}>
                  {rxCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{rxCopied ? 'Copiado!' : 'Copiar Texto com Hash'}</span>
                </button>
                <button 
                  type="button" 
                  className="btn-confirm"
                  onClick={() => {
                    showToast(`📲 Atestado digital enviado via WhatsApp para ${currentTicket?.name}!`);
                    setIsRxModalOpen(false);
                  }}
                >
                  <Send size={14} />
                  <span>Enviar para WhatsApp do Paciente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Relatório do Turno */}
      {isReportModalOpen && (
        <div className="ff-pro-modal-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="ff-pro-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ff-pro-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color="#7c3aed" />
                <h3>Relatório do Turno de Atendimento</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setIsReportModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="report-modal-body">
              <div className="report-badge-hero">
                <span className="badge-title">{pro.name}</span>
                <span className="badge-sub">{pro.specialty} • {pro.companyName} ({pro.room})</span>
              </div>

              <div className="report-stats-grid">
                <div className="report-stat-item">
                  <span className="stat-num">{historyList.length}</span>
                  <span className="stat-lbl">Consultas Realizadas</span>
                </div>
                <div className="report-stat-item">
                  <span className="stat-num">17m</span>
                  <span className="stat-lbl">Tempo Médio / Paciente</span>
                </div>
                <div className="report-stat-item">
                  <span className="stat-num">{waitingList.length}</span>
                  <span className="stat-lbl">Pacientes Aguardando</span>
                </div>
                <div className="report-stat-item">
                  <span className="stat-num text-emerald">96%</span>
                  <span className="stat-lbl">Acurácia da IA</span>
                </div>
              </div>

              <div className="report-history-table-box">
                <h4>Histórico dos Pacientes Atendidos Hoje:</h4>
                <div className="report-table-scroll">
                  {historyList.map((item, idx) => (
                    <div key={idx} className="report-table-row">
                      <span className="row-t">{item.ticket}</span>
                      <span className="row-n">{item.name}</span>
                      <span className="row-s">{item.service}</span>
                      <span className="row-d">{item.duration}</span>
                      <span className="row-c">{item.completedAt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: 18 }}>
                <button type="button" className="btn-cancel" onClick={() => setIsReportModalOpen(false)}>
                  Fechar
                </button>
                <button 
                  type="button" 
                  className="btn-confirm"
                  onClick={() => {
                    showToast('🖨️ Enviando resumo do turno para a impressora / PDF...');
                  }}
                >
                  <Printer size={15} />
                  <span>Imprimir Resumo do Turno</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
