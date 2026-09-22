import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Check, 
  X, 
  User, 
  Phone, 
  Sparkles, 
  Building2, 
  Trash2,
  ExternalLink,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import ReceptionDeskModal from './ReceptionDeskModal';
import { 
  getReceptionWaitingList, 
  addReceptionPatientApi, 
  updateReceptionStatusApi, 
  authorizeReceptionPatientApi, 
  removeReceptionPatientApi 
} from '../../services/api';

const DEFAULT_PATIENTS = [
  {
    id: 'rec-01',
    patient_name: 'Roberto Albuquerque',
    document: '123.456.789-00',
    phone: '(11) 98123-4567',
    insurance_name: 'Unimed',
    card_number: '0048.2910.4431',
    procedure: 'Consulta Oftalmologia Geral',
    doctor_name: 'Dr. Carlos Mendes',
    room: 'Consultório 04',
    status: 'awaiting_auth',
    is_priority: false,
    notes: 'Carteirinha física apresentada no balcão',
    created_at: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: 'rec-02',
    patient_name: 'Camila Fernandes',
    document: '987.654.321-11',
    phone: '(11) 97654-3210',
    insurance_name: 'Bradesco Saúde',
    card_number: '8837.1902.4812',
    procedure: 'Exame de Fundo de Olho',
    doctor_name: 'Dr. Carlos Mendes',
    room: 'Consultório 04',
    status: 'verifying',
    is_priority: true,
    notes: 'Paciente preferencial (gestante) - token enviado por SMS',
    created_at: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'rec-03',
    patient_name: 'Marcos Vinicius',
    document: '456.789.123-22',
    phone: '(11) 99112-8877',
    insurance_name: 'SulAmérica',
    card_number: '5521.0948.3301',
    procedure: 'Retorno de Consulta',
    doctor_name: 'Dr. Carlos Mendes',
    room: 'Consultório 04',
    status: 'awaiting_auth',
    is_priority: false,
    notes: 'Chegou via check-in pelo aplicativo FilaFlow',
    created_at: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 'rec-04',
    patient_name: 'Juliana Menezes',
    document: '332.112.445-99',
    phone: '(11) 98877-6655',
    insurance_name: 'Amil Saúde',
    card_number: '1192.4802.7734',
    procedure: 'Avaliação Cirúrgica',
    doctor_name: 'Dr. Carlos Mendes',
    room: 'Consultório 04',
    status: 'authorized',
    auth_code: 'AUT-78219',
    ticket_number: '#48',
    is_priority: false,
    created_at: new Date(Date.now() - 40 * 60000).toISOString()
  }
];

export default function ReceptionDeskView({
  businessData,
  patients: propPatients,
  onAuthorizePatient: propOnAuthorize,
  onStatusChange: propOnStatusChange,
  onRemovePatient: propOnRemove,
  onAddPatient: propOnAddPatient,
  onSendToDoctorQueue,
  onSwitchToOperational,
  showToast
}) {
  const [internalPatients, setInternalPatients] = useState(DEFAULT_PATIENTS);
  const patients = propPatients || internalPatients;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [insuranceFilter, setInsuranceFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorizingId, setAuthorizingId] = useState(null);

  // Sync with backend API on mount if not controlled by parent
  useEffect(() => {
    if (!propPatients) {
      async function loadData() {
        const data = await getReceptionWaitingList();
        if (data && data.length > 0) {
          setInternalPatients(data);
        }
      }
      loadData();
    }
  }, [propPatients]);

  // Quick statistics
  const countAwaiting = patients.filter(p => p.status === 'awaiting_auth').length;
  const countVerifying = patients.filter(p => p.status === 'verifying').length;
  const countAuthorized = patients.filter(p => p.status === 'authorized').length;

  // Filtered patients
  const filteredPatients = patients.filter(p => {
    const matchSearch = 
      p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.document && p.document.includes(searchTerm)) ||
      (p.card_number && p.card_number.includes(searchTerm));
    
    const matchStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchInsurance = insuranceFilter === 'all' ? true : p.insurance_name === insuranceFilter;

    return matchSearch && matchStatus && matchInsurance;
  });

  // Action: Authorize Insurance and Move to Doctor's Queue
  const handleAuthorize = async (patient) => {
    setAuthorizingId(patient.id);

    if (propOnAuthorize) {
      await propOnAuthorize(patient);
      setAuthorizingId(null);
      return;
    }

    const authCode = `AUT-${Math.floor(10000 + Math.random() * 90000)}`;

    // Call API
    const apiRes = await authorizeReceptionPatientApi(patient.id, {
      auth_code: authCode,
      queue_id: (businessData && businessData.id) || 'clinica-vida',
      is_priority: patient.is_priority
    });

    const ticketNumber = (apiRes && apiRes.ticketNumber) 
      ? apiRes.ticketNumber 
      : `#${Math.floor(49 + Math.random() * 30)}`;

    // Move officially into Doctor's Waiting Queue
    if (onSendToDoctorQueue) {
      onSendToDoctorQueue({
        name: patient.patient_name,
        serviceName: `${patient.procedure} (${patient.insurance_name})`,
        isPriority: patient.is_priority
      });
    }

    // Update local state
    setInternalPatients(prev => prev.map(p => {
      if (p.id === patient.id) {
        return {
          ...p,
          status: 'authorized',
          auth_code: authCode,
          ticket_number: ticketNumber,
          authorized_at: new Date().toISOString()
        };
      }
      return p;
    }));

    setAuthorizingId(null);

    if (showToast) {
      showToast(`Guia ${authCode} autorizada! ${patient.patient_name} transferido para a fila do médico com a senha ${ticketNumber}.`);
    }
  };

  // Action: Change Status (e.g. Em Análise)
  const handleStatusChange = async (patientId, newStatus) => {
    if (propOnStatusChange) {
      propOnStatusChange(patientId, newStatus);
      return;
    }
    await updateReceptionStatusApi(patientId, newStatus);
    setInternalPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
    if (showToast) {
      showToast(newStatus === 'verifying' ? 'Convênio colocado em análise junto à operadora.' : 'Status atualizado.');
    }
  };

  // Action: Remove Patient
  const handleRemove = async (patientId) => {
    if (propOnRemove) {
      propOnRemove(patientId);
      return;
    }
    await removeReceptionPatientApi(patientId);
    setInternalPatients(prev => prev.filter(p => p.id !== patientId));
    if (showToast) {
      showToast('Paciente removido da recepção.');
    }
  };

  // Action: Add New Patient
  const handleAddPatient = async (formData) => {
    if (propOnAddPatient) {
      propOnAddPatient(formData);
      return;
    }
    const apiRes = await addReceptionPatientApi(formData);
    const newPatient = apiRes || {
      id: `rec-${Date.now()}`,
      ...formData,
      doctor_name: (businessData && businessData.attendantName) || 'Dr. Carlos Mendes',
      room: (businessData && businessData.room) || 'Consultório 04',
      status: 'awaiting_auth',
      created_at: new Date().toISOString()
    };

    setInternalPatients(prev => [newPatient, ...prev]);
    if (showToast) {
      showToast(`Paciente ${formData.patient_name} incluído na lista de espera.`);
    }
  };

  const getInsuranceBadgeStyle = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('unimed')) return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
    if (lower.includes('bradesco')) return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
    if (lower.includes('amil')) return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
    if (lower.includes('sul')) return { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe' };
    return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
  };

  return (
    <div style={{ animation: 'fade-in 0.3s ease-out' }}>
      {/* View Header & KPIs */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        color: 'white',
        marginBottom: 24,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                <ShieldCheck size={15} />
                <span>MÓDULO RECEPÇÃO B2B</span>
              </div>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>
                {(businessData && businessData.companyName) || 'Clínica Vida'} • {(businessData && businessData.unitName) || 'Unidade Centro'}
              </span>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
              Lista de Espera & Autorização de Convênios
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#94a3b8', maxWidth: 640 }}>
              Faça a checagem da carteirinha e validação de guias com o plano do paciente. Assim que autorizada, a senha oficial é gerada e transferida automaticamente para a <strong>fila do médico</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 22px',
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={18} />
            <span>+ Novo Paciente na Recepção</span>
          </button>
        </div>

        {/* Top Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginTop: 24
        }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} />
              <span>Aguardando Autorização</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginTop: 4 }}>
              {countAwaiting}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Planos a serem validados
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} />
              <span>Em Análise no Convênio</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginTop: 4 }}>
              {countVerifying}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Aguardando retorno de token
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={14} />
              <span>Liberados para o Médico</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginTop: 4 }}>
              {countAuthorized}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              Autorizados e já na fila
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: '#c084fc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stethoscope size={14} />
              <span>Médico Designado</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(businessData && businessData.attendantName) || 'Dr. Carlos Mendes'}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              {(businessData && businessData.room) || 'Consultório 04'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          padding: '8px 14px',
          borderRadius: 10,
          flex: '1 1 260px'
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Buscar por paciente, CPF ou carteirinha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              color: '#1e293b'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'awaiting_auth', label: `Aguardando (${countAwaiting})` },
            { id: 'verifying', label: `Em Análise (${countVerifying})` },
            { id: 'authorized', label: `Autorizados (${countAuthorized})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                border: statusFilter === f.id ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                background: statusFilter === f.id ? '#f5f3ff' : 'white',
                color: statusFilter === f.id ? '#7c3aed' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Patients List Cards / Table */}
      {filteredPatients.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '48px 24px',
          textAlign: 'center',
          border: '1px dashed #cbd5e1'
        }}>
          <ShieldCheck size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: 16, fontWeight: 800, color: '#334155', margin: 0 }}>
            Nenhum paciente encontrado na recepção
          </h4>
          <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 16px' }}>
            Nenhum paciente corresponde aos filtros selecionados.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#0f172a',
              color: 'white',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Adicionar Paciente
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPatients.map((p) => {
            const insStyle = getInsuranceBadgeStyle(p.insurance_name);
            const isAuthorized = p.status === 'authorized';
            const isVerifying = p.status === 'verifying';

            return (
              <div
                key={p.id}
                style={{
                  background: 'white',
                  borderRadius: 16,
                  padding: '18px 22px',
                  border: isAuthorized ? '1px solid #bbf7d0' : isVerifying ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Left Colored Stripe */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  background: isAuthorized ? '#10b981' : isVerifying ? '#0284c7' : '#f59e0b'
                }} />

                {/* Patient Primary Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 280px' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isAuthorized ? '#dcfce7' : isVerifying ? '#e0f2fe' : '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isAuthorized ? '#15803d' : isVerifying ? '#0369a1' : '#b45309',
                    fontWeight: 800,
                    fontSize: 16
                  }}>
                    {p.patient_name.charAt(0)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                        {p.patient_name}
                      </span>
                      {p.isUser && (
                        <span style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: '1px solid #bfdbfe'
                        }}>
                          ⭐ Paciente no Celular
                        </span>
                      )}
                      {p.source === 'qrcode' && (
                        <span style={{
                          background: '#faf5ff',
                          color: '#7c3aed',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: '1px solid #ddd6fe'
                        }}>
                          📱 Chegou via QR Code
                        </span>
                      )}
                      {p.is_priority && (
                        <span style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999
                        }}>
                          PREFERENCIAL
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 12, color: '#64748b' }}>
                      {p.document && <span>CPF: {p.document}</span>}
                      {p.phone && <span>Tel: {p.phone}</span>}
                      {p.procedure && <span>• {p.procedure}</span>}
                    </div>

                    {p.notes && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                        Obs: {p.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Insurance Details & Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: '1 1 260px' }}>
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: insStyle.bg,
                      color: insStyle.text,
                      border: `1px solid ${insStyle.border}`,
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 800
                    }}>
                      <ShieldCheck size={13} />
                      <span>{p.insurance_name}</span>
                    </div>

                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4, fontWeight: 600 }}>
                      Carteira: <strong style={{ color: '#1e293b' }}>{p.card_number || 'Não informada'}</strong>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isAuthorized ? (
                      <div style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        border: '1px solid #a7f3d0',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <CheckCircle2 size={14} />
                        <span>Guia Autorizada: {p.auth_code}</span>
                      </div>
                    ) : isVerifying ? (
                      <div style={{
                        background: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <Clock size={14} />
                        <span>Em Análise c/ Convênio</span>
                      </div>
                    ) : (
                      <div style={{
                        background: '#fffbeb',
                        color: '#d97706',
                        border: '1px solid #fde68a',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <AlertCircle size={14} />
                        <span>Aguardando Autorização</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Secretary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!isAuthorized ? (
                    <>
                      {p.status !== 'verifying' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'verifying')}
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            padding: '8px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Marcar que o convênio está sendo consultado"
                        >
                          Em Análise
                        </button>
                      )}

                      <button
                        onClick={() => handleAuthorize(p)}
                        disabled={authorizingId === p.id}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '9px 16px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Check size={14} />
                        <span>{authorizingId === p.id ? 'Aprovando Check-in...' : 'Aprovar Check-in & Enviar p/ Médico'}</span>
                      </button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 12
                      }}>
                        Senha {p.ticket_number || '#48'}
                      </span>

                      <button
                        onClick={onSwitchToOperational}
                        style={{
                          background: '#ede9fe',
                          color: '#7c3aed',
                          border: 'none',
                          padding: '7px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>Ver Fila</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleRemove(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 6
                    }}
                    title="Remover paciente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for adding patient with insurance */}
      <ReceptionDeskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
}
