export const INITIAL_QUEUES = [
  {
    id: 'clinica-vida',
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    category: 'Clínica',
    badgeColor: 'emerald',
    serviceName: 'Consulta Oftalmologia Geral',
    attendantName: 'Dr. Carlos Mendes',
    room: 'Consultório 04',
    ticketNumber: '47',
    position: 5,
    initialWaitMin: 38,
    estimatedWaitText: '35-42 min',
    status: 'waiting', // waiting, called, attending, delayed, ready
    statusDetail: 'Previsão atualizada por IA',
    isAiRecalculating: false,
    delayWarning: null,
    joinedAt: '14:05',
    aheadList: [
      { ticket: '#43', name: 'Maria Silva', status: 'Em atendimento', time: '14:20' },
      { ticket: '#44', name: 'João Santos', status: 'Aguardando', time: '14:32' },
      { ticket: '#45', name: 'Ana Costa', status: 'Aguardando', time: '14:45' },
      { ticket: '#46', name: 'Pedro Lima', status: 'Próximo a chamar', time: '14:58' },
      { ticket: '#47', name: 'Você (Rafael)', status: 'Sua vez', time: '15:10', isUser: true },
    ]
  },
  {
    id: 'examelab',
    companyName: 'ExameLab Diagnósticos',
    unitName: 'Shopping Plaza Sul',
    category: 'Laboratório',
    badgeColor: 'blue',
    serviceName: 'Coleta de Exames de Sangue',
    attendantName: 'Guichê 03 - Mariana',
    room: 'Box 3 - Coletas Rápidas',
    ticketNumber: '18',
    position: 2,
    initialWaitMin: 12,
    estimatedWaitText: '10-14 min',
    status: 'waiting',
    statusDetail: 'Fila rápida: 2 atendimentos à frente',
    isAiRecalculating: false,
    delayWarning: null,
    joinedAt: '14:15',
    aheadList: [
      { ticket: '#16', name: 'Carla Dias', status: 'Em atendimento', time: '14:22' },
      { ticket: '#17', name: 'Roberto Nunes', status: 'Próximo a chamar', time: '14:28' },
      { ticket: '#18', name: 'Você (Rafael)', status: 'Sua vez', time: '14:34', isUser: true },
      { ticket: '#19', name: 'Patrícia Rocha', status: 'Aguardando', time: '14:40' },
    ]
  },
  {
    id: 'bistro',
    companyName: 'Dom Bistrô & Grill',
    unitName: 'Praça Gastronômica',
    category: 'Restaurante',
    badgeColor: 'amber',
    serviceName: 'Mesa para 2 pessoas (Área Interna)',
    attendantName: 'Recepção / Hostess Bianca',
    room: 'Salão Principal',
    ticketNumber: '09',
    position: 4,
    initialWaitMin: 45,
    estimatedWaitText: '40-50 min',
    status: 'waiting',
    statusDetail: 'Ritmo médio: 3 mesas terminando',
    isAiRecalculating: false,
    delayWarning: null,
    joinedAt: '14:10',
    aheadList: [
      { ticket: '#06', name: 'Mesa Família', status: 'Em atendimento', time: '14:20' },
      { ticket: '#07', name: 'Lucas & Julia', status: 'Aguardando', time: '14:35' },
      { ticket: '#08', name: 'Marcos Toledo', status: 'Próximo', time: '14:48' },
      { ticket: '#09', name: 'Você (Rafael)', status: 'Sua vez', time: '15:00', isUser: true },
    ]
  }
];

export const AVAILABLE_DEMO_BUSINESSES = [
  {
    id: 'clinica-vida',
    companyName: 'Clínica Vida',
    unitName: 'Unidade Centro',
    category: 'Clínica',
    address: 'Av. Paulista, 1000 - Bela Vista',
    avgWait: '35 min',
    currentWaiting: 5,
    nextTicket: '48',
    services: [
      'Consulta Oftalmologia Geral',
      'Exame de Fundo de Olho',
      'Avaliação Pré-Operatória Catarata',
      'Retorno de Consulta'
    ],
    attendantName: 'Dr. Carlos Mendes',
    room: 'Consultório 04'
  },
  {
    id: 'examelab',
    companyName: 'ExameLab Diagnósticos',
    unitName: 'Shopping Plaza Sul',
    category: 'Laboratório',
    address: 'Praça das Flores, 45 - Térreo',
    avgWait: '12 min',
    currentWaiting: 2,
    nextTicket: '19',
    services: [
      'Coleta de Sangue em Jejum',
      'Hemograma Completo Express',
      'Curva Glicêmica',
      'Exame Toxicológico'
    ],
    attendantName: 'Guichê 03 - Mariana',
    room: 'Box 03'
  },
  {
    id: 'bistro',
    companyName: 'Dom Bistrô & Grill',
    unitName: 'Praça Gastronômica',
    category: 'Restaurante',
    address: 'Rua Oscar Freire, 820',
    avgWait: '42 min',
    currentWaiting: 4,
    nextTicket: '10',
    services: [
      'Mesa para 2 Pessoas (Área Interna)',
      'Mesa para 4 Pessoas (Varanda)',
      'Mesa Família (6+ Lugares)',
      'Balcão Bar & Happy Hour'
    ],
    attendantName: 'Hostess Bianca',
    room: 'Salão Principal'
  },
  {
    id: 'barbearia-elite',
    companyName: 'Barbearia Dom Pedro',
    unitName: 'Vila Madalena',
    category: 'Barbearia',
    address: 'Rua Harmonia, 312',
    avgWait: '18 min',
    currentWaiting: 3,
    nextTicket: '23',
    services: [
      'Corte de Cabelo Tradicional',
      'Barba Terapia com Toalha Quente',
      'Combo Corte + Barba VIP',
      'Acabamento de Pezinho e Sobrancelha'
    ],
    attendantName: 'Mestre Rodrigo',
    room: 'Cadeira 02'
  },
  {
    id: 'salao-glam',
    companyName: 'Studio Beleza & Arte',
    unitName: 'Jardins',
    category: 'Salão',
    address: 'Alameda Lorena, 1400',
    avgWait: '25 min',
    currentWaiting: 4,
    nextTicket: '31',
    services: [
      'Escova Modelada & Lavagem',
      'Manicure & Pedicure Express',
      'Design de Sobrancelha e Henna',
      'Hidratação Profunda'
    ],
    attendantName: 'Camila Hair Stylist',
    room: 'Bancada 01'
  },
  {
    id: 'oficina-tech',
    companyName: 'AutoFix Assistência',
    unitName: 'Av. Ibirapuera',
    category: 'Oficina',
    address: 'Av. Ibirapuera, 2300',
    avgWait: '30 min',
    currentWaiting: 2,
    nextTicket: '07',
    services: [
      'Diagnóstico Rápido & Scanner OBD',
      'Troca Expressa de Óleo e Filtro',
      'Inspeção de Freios e Suspensão',
      'Alinhamento e Balanceamento'
    ],
    attendantName: 'Engenheiro Marcelo',
    room: 'Elevador 02'
  },
  {
    id: 'cartorio-central',
    companyName: 'Cartório 5º Ofício de Notas',
    unitName: 'Centro Cívico',
    category: 'Órgãos Públicos',
    address: 'Rua São Bento, 405',
    avgWait: '15 min',
    currentWaiting: 6,
    nextTicket: '54',
    services: [
      'Reconhecimento de Firma Presencial',
      'Autenticação de Cópias',
      'Escritura Pública Rápida',
      'Procuração e Apostilamento'
    ],
    attendantName: 'Escrevente Juliana',
    room: 'Guichê 08'
  }
];

export const CATEGORIES_LIST = [
  { label: 'Clínicas', icon: 'Stethoscope', desc: 'Consultas e exames sem aglomeração na sala de espera' },
  { label: 'Restaurantes', icon: 'Utensils', desc: 'Mesas e rodízios com liberdade para o cliente passear' },
  { label: 'Salões', icon: 'Scissors', desc: 'Controle de cadeiras e agendamentos simultâneos' },
  { label: 'Laboratórios', icon: 'FlaskConical', desc: 'Triagens, coletas e jejum com prioridades automáticas' },
  { label: 'Barbearias', icon: 'Sparkles', desc: 'Atendimentos ágeis com aviso automático ao cliente' },
  { label: 'Oficinas', icon: 'Wrench', desc: 'Recepção de veículos com fila transparente' },
  { label: 'Órgãos Públicos', icon: 'Landmark', desc: 'Gestão de guichês, senhas preferenciais e LGPD' },
  { label: 'Assistências Técnicas', icon: 'Laptop', desc: 'Triagem de balcão e prazos previsíveis' },
];

export const PRICING_PLANS = [
  {
    name: 'Starter',
    badge: 'Para Pequenos Negócios',
    monthlyPrice: 'R$ 89',
    annualPrice: 'R$ 69',
    period: '/mês',
    desc: 'Ideal para consultórios, barbearias e cafeterias iniciando no fluxo digital.',
    features: [
      'Até 2 filas ativas simultâneas',
      'Até 500 senhas mensais',
      'QR Code de balcão personalizável',
      'Painel de chamada web simplificado',
      'Notificações de espera em tempo real',
      'Conformidade total com LGPD'
    ],
    popular: false,
    cta: 'Começar Teste Grátis'
  },
  {
    name: 'Profissional',
    badge: 'Mais Escolhido',
    monthlyPrice: 'R$ 189',
    annualPrice: 'R$ 149',
    period: '/mês',
    desc: 'Para clínicas, restaurantes movimentados e centros de atendimento com múltiplos guichês.',
    features: [
      'Filas ilimitadas e múltiplos atendentes',
      'Senhas ilimitadas por mês',
      'Inteligência Artificial preditiva de espera',
      'Módulo Multi-Filas Integrado para clientes',
      'Alertas por WhatsApp e Web Push',
      'Dashboard analítico com histórico e relatórios',
      'Suporte prioritário 24/7'
    ],
    popular: true,
    cta: 'Cadastrar Empresa'
  },
  {
    name: 'Enterprise',
    badge: 'Para Redes & Hospitais',
    monthlyPrice: 'R$ 499',
    annualPrice: 'R$ 399',
    period: '/mês',
    desc: 'Grandes operações, redes de franquias, laboratórios e órgãos públicos com alta escala.',
    features: [
      'Multi-unidades e filiais centralizadas',
      'API REST e Webhooks para integração ERP/HIS',
      'Painel de TV (Totem) para salas de espera',
      'Algoritmo de IA dedicado para previsão de atrasos',
      'Gerente de conta dedicado e SLA de 99.9%',
      'Treinamento e onboarding presencial/remoto'
    ],
    popular: false,
    cta: 'Falar com Consultor'
  }
];
