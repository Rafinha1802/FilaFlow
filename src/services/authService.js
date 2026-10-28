import { REGISTERED_PROFESSIONALS } from '../data/mockData';

// Storage keys
const STORAGE_KEYS = {
  COMPANIES: 'filaflow_companies_v1',
  PROFESSIONALS: 'filaflow_professionals_v1',
  COMPANY_SESSION: 'filaflow_company_session_v1',
  PRO_SESSION: 'filaflow_pro_session_v1',
  PENDING_REGISTRATION: 'filaflow_pending_company_reg_v1'
};

// Default seed company
const DEFAULT_COMPANY = {
  id: 'comp-clinica-vida',
  companyName: 'Clínica Vida',
  unitName: 'Unidade Centro',
  category: 'Clínica',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 98765-4321',
  email: 'atendimento@clinicavida.com.br',
  attendantName: 'Dr. Carlos Mendes',
  room: 'Consultório 04',
  plan: 'Profissional',
  createdAt: new Date().toISOString()
};

/**
 * Carrega a lista de empresas cadastradas
 */
export function getStoredCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[authService] Erro ao ler empresas do localStorage:', e);
  }
  // Inicializa com a empresa padrão
  const initial = [DEFAULT_COMPANY];
  saveCompanies(initial);
  return initial;
}

/**
 * Salva a lista de empresas
 */
export function saveCompanies(companies) {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  } catch (e) {
    console.error('[authService] Erro ao salvar empresas:', e);
  }
}

/**
 * Carrega a lista de profissionais cadastrados
 */
export function getStoredProfessionals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('[authService] Erro ao ler profissionais:', e);
  }
  // Inicializa com os profissionais do mockData
  const initial = [...REGISTERED_PROFESSIONALS];
  saveProfessionals(initial);
  return initial;
}

/**
 * Salva a lista de profissionais
 */
export function saveProfessionals(pros) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(pros));
  } catch (e) {
    console.error('[authService] Erro ao salvar profissionais:', e);
  }
}

/**
 * Obtém a sessão ativa da empresa
 */
export function getCompanySession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANY_SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * Salva a sessão ativa da empresa
 */
export function setCompanySession(companyUser) {
  try {
    if (companyUser) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_SESSION, JSON.stringify(companyUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.COMPANY_SESSION);
    }
  } catch (e) {}
}

/**
 * Obtém a sessão ativa do profissional
 */
export function getProfessionalSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRO_SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * Salva a sessão ativa do profissional
 */
export function setProfessionalSession(proUser) {
  try {
    if (proUser) {
      localStorage.setItem(STORAGE_KEYS.PRO_SESSION, JSON.stringify(proUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PRO_SESSION);
    }
  } catch (e) {}
}

/**
 * Salva dados de cadastro pendente da empresa (enquanto navega para a tela de pagamento)
 */
export function setPendingCompanyRegistration(data) {
  try {
    if (data) {
      localStorage.setItem(STORAGE_KEYS.PENDING_REGISTRATION, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.PENDING_REGISTRATION);
    }
  } catch (e) {}
}

export function getPendingCompanyRegistration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_REGISTRATION);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * Login da Empresa
 */
export function loginCompany(email, password) {
  const companies = getStoredCompanies();
  const cleanEmail = email.trim().toLowerCase();

  // Permite login rápido da Clínica Vida
  if (cleanEmail === 'atendimento@clinicavida.com.br' || cleanEmail === 'demo@clinicavida.com.br') {
    const comp = companies.find(c => c.email.toLowerCase() === 'atendimento@clinicavida.com.br') || DEFAULT_COMPANY;
    setCompanySession(comp);
    return { success: true, company: comp };
  }

  const found = companies.find(c => c.email.toLowerCase() === cleanEmail);
  if (!found) {
    return { 
      success: false, 
      message: 'E-mail corporativo não encontrado. Cadastre sua empresa para começar ou utilize o acesso rápido demonstrativo.' 
    };
  }

  // Verifica senha caso exista
  if (found.password && found.password !== password && password !== '••••••••') {
    return { success: false, message: 'Senha incorreta para esta empresa.' };
  }

  setCompanySession(found);
  return { success: true, company: found };
}

/**
 * Login do Profissional
 * Busca pelo e-mail que foi cadastrado pela empresa ou pré-existente
 */
export function loginProfessional(email, password) {
  const professionals = getStoredProfessionals();
  const cleanEmail = email.trim().toLowerCase();

  const found = professionals.find(p => p.email && p.email.toLowerCase() === cleanEmail);

  if (!found) {
    return {
      success: false,
      message: `O e-mail "${email}" não está cadastrado por nenhuma empresa parceira. Verifique com a administração da sua clínica ou teste os perfis rápidos disponíveis.`
    };
  }

  // Se o profissional tiver senha configurada
  if (found.password && found.password !== password && password !== '••••••••' && password) {
    // Para simplificar testes, se for diferente, avisa
    if (found.password !== password) {
      return { success: false, message: 'Senha incorreta para este profissional.' };
    }
  }

  setProfessionalSession(found);
  return { success: true, professional: found };
}

/**
 * Cadastra uma nova Empresa juntamente com seus Profissionais
 * e salva todos no localStorage
 */
export function registerCompanyAndProfessionals({ companyData, professionalsList, selectedPlan = 'Profissional' }) {
  const companies = getStoredCompanies();
  const currentPros = getStoredProfessionals();

  const newCompanyId = 'comp-' + Date.now();
  const newCompany = {
    id: newCompanyId,
    companyName: companyData.companyName,
    unitName: companyData.unitName || 'Unidade Principal',
    category: companyData.category || 'Clínica',
    cnpj: companyData.cnpj || '',
    phone: companyData.phone || '',
    email: companyData.email.trim(),
    password: companyData.password,
    attendantName: companyData.attendantName || (professionalsList[0]?.name) || 'Administrador',
    room: companyData.room || (professionalsList[0]?.room) || 'Consultório 01',
    plan: selectedPlan,
    createdAt: new Date().toISOString()
  };

  // Prepara e cadastra cada profissional vinculado à empresa
  const createdPros = professionalsList.map((pro, index) => {
    const proId = 'pro-' + Date.now() + '-' + index;
    return {
      id: proId,
      email: pro.email.trim().toLowerCase(),
      password: pro.password || '123456',
      name: pro.name.trim(),
      role: pro.role || pro.specialty || 'Profissional / Especialista',
      specialty: pro.specialty || 'Atendimento Especializado',
      category: companyData.category || 'Clínica',
      companyId: newCompanyId,
      companyName: companyData.companyName,
      unitName: companyData.unitName || 'Unidade Principal',
      room: pro.room || `Consultório 0${index + 1}`,
      avatar: pro.avatar || (pro.name.toLowerCase().includes('dra') ? '👩‍⚕️' : '👨‍⚕️'),
      crm: pro.crm || 'Registro Ativo',
      // Limites de horário definidos pela empresa conforme solicitado no áudio:
      maxDailyHours: pro.maxDailyHours || 8, // Limite máximo de horas em atendimento
      workHoursStart: pro.workHoursStart || '08:00',
      workHoursEnd: pro.workHoursEnd || '18:00',
      breakTime: pro.breakTime || '12:00 às 13:00',
      workDays: pro.workDays || 'Segunda a Sexta',
      targetConsultationMinutes: Number(pro.targetConsultationMinutes) || 20,
      currentTicket: {
        ticket: `#${10 + index}`,
        name: 'Primeiro Paciente do Dia',
        service: pro.specialty || 'Consulta Geral',
        age: '32 anos',
        convenio: 'Particular',
        timeJoined: '08:15',
        room: pro.room || `Consultório 0${index + 1}`,
        status: 'attending',
        clientOnWay: true,
        notes: 'Paciente aguardando no consultório digital.'
      },
      waitingList: [
        { 
          ticket: `#${11 + index}`, 
          name: 'Paciente em Espera', 
          service: pro.specialty || 'Consulta', 
          time: '~15 min', 
          isPriority: false, 
          status: 'saguao', 
          phone: '(11) 98765-4321', 
          priorityReason: null 
        }
      ],
      historyToday: []
    };
  });

  // Atualiza empresas
  const updatedCompanies = [newCompany, ...companies.filter(c => c.email.toLowerCase() !== newCompany.email.toLowerCase())];
  saveCompanies(updatedCompanies);

  // Atualiza profissionais (evita duplicar pelo email)
  const existingEmails = new Set(createdPros.map(p => p.email.toLowerCase()));
  const filteredExistingPros = currentPros.filter(p => !existingEmails.has(p.email?.toLowerCase()));
  const updatedPros = [...createdPros, ...filteredExistingPros];
  saveProfessionals(updatedPros);

  // Limpa o registro pendente
  setPendingCompanyRegistration(null);

  // Define a empresa como sessão ativa
  setCompanySession(newCompany);

  return {
    company: newCompany,
    professionals: createdPros
  };
}

/**
 * Logout da Empresa
 */
export function logoutCompany() {
  setCompanySession(null);
}

/**
 * Logout do Profissional
 */
export function logoutProfessional() {
  setProfessionalSession(null);
}
