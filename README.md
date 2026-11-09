# 🚀 TemFyla (FilaFlow) — Ecossistema Inteligente de Gestão de Filas & Atendimento com IA

O **TemFyla** (anteriormente *FilaFlow*) é uma plataforma SaaS completa (B2B e B2C) para gestão inteligente de filas de espera, triagem de recepção, consultórios digitais e acompanhamento em tempo real pelo cliente via smartphone — com previsibilidade de tempo calculada por **Inteligência Artificial** e sincronização em tempo real via **WebSockets / FastAPI**.

---

## 📋 Índice

1. [Visão Geral do Ecossistema](#-visão-geral-do-ecossistema)
2. [Principais Atualizações Recentes](#-principais-atualizações-recentes)
3. [Contas Demonstrativas (Acesso Rápido 1-Clique)](#-contas-demonstrativas-acesso-rápido-1-clique)
4. [Módulos e Funcionalidades Detalhadas](#-módulos-e-funcionalidades-detalhadas)
   - [1. Landing Page Institucional (`/`)](#1-landing-page-institucional-)
   - [2. Aplicativo Mobile do Cliente (`/app`)](#2-aplicativo-mobile-do-cliente-app)
   - [3. Portal e Painel Operacional da Empresa (`/empresa`)](#3-portal-e-painel-operacional-da-empresa-empresa)
   - [4. Consultório Digital do Profissional (`/profissional`)](#4-consultório-digital-do-profissional-profissional)
   - [5. Checkout & Assinatura de Planos (`/checkout`)](#5-checkout--assinatura-de-planos-checkout)
5. [Mapa de Rotas da Aplicação](#-mapa-de-rotas-da-aplicação)
6. [Arquitetura e Estrutura de Pastas](#-arquitetura-e-estrutura-de-pastas)
7. [Integração com Backend (FastAPI + WebSockets)](#-integração-com-backend-fastapi--websockets)
8. [Como Executar o Projeto](#-como-executar-o-projeto)

---

## 🌐 Visão Geral do Ecossistema

O **TemFyla** conecta 4 pontas de atendimento em uma única experiência integrada:

- **Cliente / Paciente (`/app`)**: Entra em múltiplas filas simultaneamente (Clínicas, Laboratórios, Restaurantes, Barbearias, Órgãos Públicos), escaneia QR Code, realiza pré-check-in, envia dados de convênio para a recepção, recebe alertas de conflito de horário por IA e notifica o estabelecimento (*"Estou a caminho"* ou *"Preciso de mais tempo"*).
- **Recepção / Empresa (`/empresa/dashboard`)**: Controla as filas da unidade, autoriza convênios/check-ins da recepção, emite senhas manuais ou prioritárias, exibe o Painel de TV (Totem) com chamada sonora/voz sintetizada, acompanha métricas de operação e gerencia a equipe de profissionais.
- **Profissional / Médico (`/profissional`)**: Opera seu próprio consultório/guichê digital com cronômetro inteligente de consulta, chamada individual de pacientes, status de deslocamento do cliente (no saguão, na cafeteria, a caminho), prontuário rápido e configuração de carga horária máxima diária.
- **Checkout Transparente (`/checkout`)**: Fluxo completo de contratação de planos (*Starter*, *Profissional* e *Enterprise*) nos ciclos mensal e anual, com pagamento via **PIX (com QR Code e copia-e-cola)**, **Cartão de Crédito** e **Boleto Bancário**.

---

## ✨ Principais Atualizações Recentes

### 1. Identidade Visual & Rebranding para **TemFyla**
- Nova marca unificada **TemFyla** (`BrandLogo.jsx`) aplicada em todos os módulos (Landing Page, Login/Cadastro, Painel da Empresa, Consultório do Profissional, App Mobile e Checkout).
- Paleta visual moderna com gradientes violeta/índigo (`#7c3aed` / `#4f46e5`) e indicadores de status em verde esmeralda (`#10b981`).

### 2. Contas Demonstrativas Pré-Logadas (1-Clique)
- **Login da Empresa (`CompanyAuth.jsx`)**:
  - Card **"Conta Conectada • Pronta para Demonstração"** exibindo a sessão ativa da **Clínica Vida (Unidade Centro)** com botão **"Entrar Direto"** em 1 clique.
  - Campos de e-mail (`atendimento@clinicavida.com.br`) e senha (`123456`) já preenchidos por padrão.
- **Login do Profissional (`ProfessionalAuth.jsx`)**:
  - Card **"Conta Conectada • Pronta para Demonstração"** com acesso imediato ao consultório do **Dr. Carlos Mendes** (`dr.carlos@clinicavida.com.br`), além de atalhos diretos para **Dra. Beatriz Santos** e **Chef Marcelo Silva**.
  - Campos de login também preenchidos automaticamente para facilitar apresentações e testes.

### 3. Fluxo Completo de Cadastro da Empresa em 3 Etapas + Checkout
- Correção e aprimoramento da página de cadastro (`/empresa/cadastro` e `/cadastro`) em `CompanyAuth.jsx`:
  - **Passo 1 — Dados do Estabelecimento**: Nome fantasia, CNPJ/CPF, unidade/bairro, segmento de atuação (Clínica, Restaurante, Salão, Laboratório, Barbearia, Oficina, Órgãos Públicos), responsável administrativo, WhatsApp, e-mail e senha.
  - **Passo 2 — Equipe de Profissionais & Limite de Horários**: Cadastro de múltiplos profissionais com e-mail corporativo próprio (usado pelo profissional para logar em `/profissional/login`), especialidade, sala/consultório, carga horária máxima diária (`4h` a `14h/dia`), tempo médio de consulta e horários de início/término de turno.
  - **Passo 3 — Resumo & Redirecionamento ao Checkout**: Revisão completa dos dados da empresa e equipe, redirecionando diretamente para `/checkout` para escolha do plano e ativação imediata.

### 4. Consultório Autônomo & Configuração Moderna de Jornada (`ProfessionalAuth.jsx` e `ProfessionalProfileView.jsx`)
- Aba **"Consultório Autônomo"** no portal do profissional para especialistas que atendem por conta própria sem vínculo empresarial.
- Seletor rápido de turnos sem sliders complexos:
  - **Manhã** (`08h - 12h` • `4h/dia`)
  - **Tarde** (`13h - 18h` • `5h/dia`)
  - **Integral** (`08h - 18h` • `8h/dia`)
  - **Plantão** (`07h - 19h` • `12h/dia`)
- Pílulas rápidas para duração média por consulta (`10m`, `15m`, `20m`, `30m`, `45m`, `60m`) e cálculo automático de **Capacidade Estimada de Atendimentos/Dia** por IA.
- Tela dedicada de **Perfil do Profissional (`/profissional/perfil`)** e **Perfil da Empresa (`/empresa/perfil`)** com persistência em `localStorage`.

### 5. App Mobile do Cliente & Celular Interativo na Hero (`ClientMobileApp.jsx` & `InteractiveHeroPhone.jsx`)
- **Celular Interativo na Landing Page (`InteractiveHeroPhone.jsx`)**: Permite testar a experiência do paciente diretamente na página inicial, alternando entre abas, visualizando posição na fila, tempo estimado pela IA e notificações ao vivo.
- **Autenticação Mobile Completa (`MobileAuthView.jsx`)**:
  - Telas de **Entrar**, **Criar Conta** e **Recuperação de Senha** com design curvo moderno, login social (*Apple* e *Google*) e integração direta com o backend FastAPI (`/api/auth/patient/login` e `/api/auth/patient/register`) com fallback local resiliente.
  - Isolamento de sessão do paciente (`Rafael Silva`) para nunca misturar os dados do cliente mobile com a sessão do médico ou da clínica.
- **Central de Notificações (`MobileNotificationsView.jsx`)**: Histórico categorizado de chamadas de senha, alertas de IA sobre atrasos, aprovações da recepção e lembretes de deslocamento.

---

## 🔑 Contas Demonstrativas (Acesso Rápido 1-Clique)

Para facilitar demonstrações, todas as áreas de login já iniciam com contas demonstrativas prontas para entrar com **1 clique**:

| Perfil / Módulo | Rota de Acesso | Nome / Identificação | E-mail | Senha |
| :--- | :--- | :--- | :--- | :--- |
| **🏢 Empresa (Gestão & Recepção)** | `/empresa/login` | **Clínica Vida** *(Unidade Centro)* | `atendimento@clinicavida.com.br` | `123456` |
| **👨‍⚕️ Profissional 1 (Médico)** | `/profissional/login` | **Dr. Carlos Mendes** *(Consultório 04)* | `dr.carlos@clinicavida.com.br` | `123456` |
| **👩‍⚕️ Profissional 2 (Médica)** | `/profissional/login` | **Dra. Beatriz Santos** *(Consultório 01)* | `dra.beatriz@novocentro.com.br` | `123456` |
| **👨‍🍳 Profissional 3 (Restaurante)** | `/profissional/login` | **Chef Marcelo Silva** *(Salão Principal)* | `chef@dombistro.com.br` | `123456` |
| **📱 Cliente / Paciente (App)** | `/app` | **Rafael Silva** *(Unimed Nacional)* | `rafael.silva@email.com` | `123456` |

> 💡 **Dica:** Qualquer empresa ou profissional recém-cadastrado pelo fluxo `/empresa/cadastro` ou `/profissional/cadastro` também passa a aparecer automaticamente na lista de contas conectadas da tela de login!

---

## 🧩 Módulos e Funcionalidades Detalhadas

### 1. Landing Page Institucional (`/`)
- **Navbar Inteligente (`Navbar.jsx`)**: Navegação rápida para seções (*Como Funciona*, *Segmentos*, *Gestão & IA*, *Planos*), além de botões de acesso direto para **Área do Profissional**, **Entrar** e **Cadastrar Empresa**.
- **Simulador por Segmento (`LandingPage.jsx`)**: Demonstração dinâmica de filas para *Clínicas*, *Restaurantes*, *Barbearias/Salões* e *Laboratórios*.
- **Celular Interativo Ao Vivo (`InteractiveHeroPhone.jsx`)**: Mockup funcional em tempo real na seção principal do site.

### 2. Aplicativo Mobile do Cliente (`/app`)
- **Dashboard do Cliente (`MobileDashboard.jsx`)**:
  - Visualização da senha atual, posição na fila, sala/consultório e tempo estimado recalculado por IA.
  - **Detector de Conflito de Filas por IA**: Alerta quando duas filas ativas têm previsão de chamada em horários próximos e permite ceder 1 posição com 1 toque.
  - **Check-in Digital com a Recepção**: Envio antecipado de dados e carteirinha do convênio para aprovação da secretária.
  - **Botões de Status de Deslocamento**: *"Estou a caminho"* e *"Pedir mais tempo (+12 min)"*.
- **Minhas Filas (`MobileQueuesView.jsx`)**: Gestão de múltiplas filas simultâneas.
- **Explorar Estabelecimentos (`MobileExploreView.jsx`)**: Busca por categoria, tempo médio de espera e entrada remota na fila (*Pré-Check-in*).
- **Leitor de QR Code (`QrScannerModal.jsx`)**: Simulador de câmera para leitura de QR Code de balcão/totem.
- **Notificações (`MobileNotificationsView.jsx`)** e **Perfil do Paciente (`MobileProfileView.jsx`)**.

### 3. Portal e Painel Operacional da Empresa (`/empresa`)
- **Controle Operacional de Filas (`CompanyDashboard.jsx`)**:
  - Chamada da próxima senha com alerta sonoro (*chime*) e sincronização imediata com o App do Cliente e WebSockets.
  - Notificação de atraso (`+5 min`) com recálculo automático pela IA para todos os clientes aguardando.
  - Emissão de senha manual de balcão (normal ou prioritária por lei).
- **Balcão da Recepção (`ReceptionDeskView.jsx` / `ReceptionDeskModal.jsx`)**: Triagem de pacientes, validação de convênio e encaminhamento direto para a fila do médico responsável.
- **Modo Totem / Painel de TV**: Tela cheia para exibição em monitores de sala de espera com histórico de senhas chamadas e alerta vocal.
- **Gestão de Equipe**: Visualização, adição e remoção de profissionais vinculados à unidade e acesso direto ao consultório de cada profissional.

### 4. Consultório Digital do Profissional (`/profissional`)
- **Workspace do Especialista (`ProfessionalWorkspace.jsx`)**:
  - Cronômetro em tempo real do atendimento em andamento com comparação frente à meta configurada (ex: `20 min`).
  - Indicador ao vivo de onde está cada paciente da fila (*No Saguão*, *Na Cafeteria*, *A Caminho*).
  - Ações rápidas: Chamar próximo, repetir chamada sonora, registrar observações clínicas e finalizar consulta.
  - Histórico de atendimentos concluídos no dia e métricas individuais de produtividade.

### 5. Checkout & Assinatura de Planos (`/checkout`)
- **Página Segura de Pagamento (`CheckoutPage.jsx`)**:
  - Seleção entre os planos **Starter (R$ 89/mês)**, **Profissional (R$ 189/mês)** e **Enterprise (R$ 499/mês)**, com desconto no ciclo anual.
  - Preenchimento automático dos dados da empresa vindos da etapa de cadastro.
  - Suporte a cupons de desconto, pagamento via **PIX** (com contador regressivo e código Copia e Cola), **Cartão de Crédito** em até 12x e **Boleto**.
  - Comprovante de ativação com redirecionamento automático para o Painel da Empresa.

### 💳 Planos e Recursos da Plataforma (`PRICING_PLANS`)

| Plano | Valor (Mensal / Anual) | Público Ideal | Recursos e Módulos Inclusos |
| :--- | :--- | :--- | :--- |
| **Starter** | `R$ 89` / `R$ 69` `/mês` | Consultórios & Autônomos | • Consultório Digital para até 2 profissionais (controle de turno e cronômetro)<br>• Cartaz QR Code de balcão pronto para impressão e check-in rápido<br>• App Mobile do Cliente com pré-check-in (*"Estou a caminho"* / *"Pedir mais tempo"*)<br>• Fila de atendimento Normal e Prioridade Legal (Lei 10.048)<br>• Emissão de Atestado, Receituário e Declaração Digital Express<br>• Sigilo de dados em conformidade com a LGPD (exibição de 1º nome e senha) |
| **Profissional** *(Mais Escolhido)* | `R$ 189` / `R$ 149` `/mês` | Clínicas, Restaurantes & Equipes | • Múltiplos Profissionais e Salas com login individual e limite de horas diárias<br>• Módulo Recepção & Convênios B2B (validação de guias e envio direto ao médico)<br>• Modo Telão TV com chamada sonora (gongo) e voz sintetizada em Português (PT-BR)<br>• IA Preditiva de Espera com recálculo automático de atrasos (`+5m` / `+10m`)<br>• Multi-Filas Simultâneas com Detector de Conflito de Horários no App<br>• Disparo de alertas via WhatsApp e notificações Push em tempo real<br>• Dashboard de Métricas & IA com fluxo por horário e exportação em PDF |
| **Enterprise** | `R$ 499` / `R$ 399` `/mês` | Redes, Hospitais & Franquias | • Profissionais, salas/guichês e senhas mensais ilimitados (Multi-unidades)<br>• Todos os módulos do Profissional (Recepção B2B, Telão TV com Voz e IA Preditiva)<br>• Calibração avançada do algoritmo de IA (*Equilibrado*, *Conservador* ou *Giro Rápido*)<br>• Sincronização em Tempo Real via API REST & WebSockets (FastAPI / ERP / Prontuário)<br>• Assinatura Digital com validação ICP-Brasil e relatórios consolidados de turno<br>• Gerente de conta dedicado, onboarding da equipe e SLA 99.9% 24/7 |

---

## 🗺️ Mapa de Rotas da Aplicação

O roteamento é gerenciado pelo hook customizado [`useAppRouter.js`](src/router/useAppRouter.js) utilizando a History API do navegador:

| Rota | Componente Principal | Descrição |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Site institucional com celular interativo e planos |
| `/app` | `ClientMobileApp.jsx` | Aplicativo mobile completo do cliente/paciente |
| `/empresa` | `CompanyDashboard.jsx` / `CompanyAuth.jsx` | Painel SaaS da empresa (ou tela de login se desconectado) |
| `/empresa/login` ou `/login` | `CompanyAuth.jsx` *(aba login)* | Login corporativo com conta demo conectada |
| `/empresa/cadastro` ou `/cadastro` | `CompanyAuth.jsx` *(aba register)* | Cadastro completo de empresa e equipe em 3 passos |
| `/empresa/dashboard` | `CompanyDashboard.jsx` | Painel operacional, recepção, totem e relatórios |
| `/empresa/perfil` | `CompanyProfileView.jsx` | Configurações cadastrais e operacionais da empresa |
| `/profissional` | `ProfessionalWorkspace.jsx` / `ProfessionalAuth.jsx` | Consultório digital do profissional |
| `/profissional/login` | `ProfessionalAuth.jsx` *(aba login)* | Login do profissional com contas demo conectadas |
| `/profissional/cadastro` | `ProfessionalAuth.jsx` *(aba autônomo)* | Cadastro de consultório autônomo individual |
| `/profissional/perfil` | `ProfessionalProfileView.jsx` | Configuração de horários, alertas e perfil do especialista |
| `/checkout` ou `/pagamento` | `CheckoutPage.jsx` | Contratação de plano e pagamento (PIX, Cartão, Boleto) |

---

## 📂 Arquitetura e Estrutura de Pastas

```text
FilaFlow/
├── public/                        # Logos e ícones estáticos da marca TemFyla
├── src/
│   ├── assets/                    # Recursos gráficos e variações da logo TemFyla
│   ├── components/
│   │   ├── Checkout/
│   │   │   └── CheckoutPage.jsx           # Página de planos e pagamento (PIX, Cartão, Boleto)
│   │   ├── Client/
│   │   │   ├── ClientMobileApp.jsx        # Container principal do App Mobile (/app)
│   │   │   ├── MobileAuthView.jsx         # Login, Cadastro e Recuperação de Senha do Cliente
│   │   │   ├── MobileDashboard.jsx        # Tela inicial do app com senha ativa e alertas IA
│   │   │   ├── MobileExploreView.jsx      # Busca de clínicas, restaurantes e serviços
│   │   │   ├── MobileNotificationsView.jsx# Central de alertas e chamadas em tempo real
│   │   │   ├── MobileProfileView.jsx      # Perfil do paciente, CPF e convênio médico
│   │   │   ├── MobileQueuesView.jsx       # Gerenciador Multi-Filas do cliente
│   │   │   ├── PreCheckinModal.jsx        # Modal para entrar remotamente em uma fila
│   │   │   ├── QrScannerModal.jsx         # Simulador de leitura de QR Code
│   │   │   └── QueueSearchModal.jsx       # Busca rápida de estabelecimentos
│   │   ├── Common/
│   │   │   ├── BrandLogo.jsx              # Componente oficial da marca TemFyla
│   │   │   ├── PricingModal.jsx           # Modal comparativo de planos SaaS
│   │   │   └── SimControlBar.jsx          # Barra auxiliar de simulação
│   │   ├── Company/
│   │   │   ├── CompanyAuth.jsx            # Login (com conta demo) e Cadastro em 3 Etapas
│   │   │   ├── CompanyDashboard.jsx       # Painel Operacional, Totem TV, Métricas e Equipe
│   │   │   ├── CompanyProfileView.jsx     # Perfil e preferências da empresa
│   │   │   ├── ReceptionDeskModal.jsx     # Modal de triagem da recepção
│   │   │   └── ReceptionDeskView.jsx      # Visão completa do balcão da secretária
│   │   ├── LandingPage/
│   │   │   ├── InteractiveHeroPhone.jsx   # Mockup interativo de smartphone na Hero
│   │   │   ├── LandingPage.jsx            # Página institucional completa
│   │   │   └── Navbar.jsx                 # Barra de navegação superior
│   │   └── Professional/
│   │       ├── ProfessionalAuth.jsx       # Login do Profissional (com conta demo) e Autônomo
│   │       ├── ProfessionalProfileView.jsx# Perfil e carga horária do profissional
│   │       └── ProfessionalWorkspace.jsx  # Consultório digital com cronômetro e chamadas
│   ├── data/
│   │   └── mockData.js            # Filas iniciais, empresas demo, planos e profissionais
│   ├── router/
│   │   └── useAppRouter.js        # Roteador client-side baseado na History API
│   ├── services/
│   │   ├── api.js                 # Cliente HTTP REST + WebSockets para o backend FastAPI
│   │   └── authService.js         # Gestão de sessões, empresas e profissionais (localStorage)
│   ├── App.jsx                    # Orquestrador global de estado, rotas e WebSockets
│   ├── index.css                  # Design system completo e estilização responsiva
│   └── main.jsx                   # Ponto de entrada do React 19
├── index.html
├── iniciar.bat                    # Script para iniciar apenas o Frontend (porta 5174)
├── iniciar_tudo.bat               # Script unificado para iniciar Backend (8000) + Frontend (5174)
├── package.json
└── vite.config.js                 # Configuração do Vite com proxy para /api e /ws
```

---

## 🔌 Integração com Backend (FastAPI + WebSockets)

O projeto conta com integração automática com o backend Python/FastAPI através do arquivo [`src/services/api.js`](src/services/api.js):

- **Autenticação JWT em Segundo Plano**: Ao iniciar, o frontend autentica automaticamente ou sincroniza tokens JWT com `/api/auth/login`.
- **Sincronização de Filas REST**: Busca filas ativas (`GET /api/queues`), chama próximas senhas (`POST /api/queues/{id}/call-next`), emite senhas manuais (`POST /api/tickets/manual`) e reporta atrasos (`POST /api/queues/{id}/delay`).
- **Tempo Real via WebSockets (`/ws/queues`)**: Escuta eventos `TICKET_CALLED`, `QUEUE_UPDATED` e `AI_PREDICTIONS_UPDATED`, disparando aviso sonoro e atualizando instantaneamente o painel e o celular do cliente.
- **Fallback Local Resiliente**: Caso o servidor Python não esteja em execução, todas as funcionalidades operam 100% offline/localmente através do estado reativo e persistência em `localStorage`, garantindo que demonstrações nunca falhem.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- **Node.js** (v18 ou superior)
- **Python 3.10+** *(opcional, caso deseje rodar integrado ao backend FastAPI)*

### Opção 1: Inicialização Rápida pelo Script (Windows)
- Para iniciar **apenas o Frontend**: dê um duplo clique em **`iniciar.bat`**.
- Para iniciar **Backend FastAPI + Frontend React juntos**: dê um duplo clique em **`iniciar_tudo.bat`**.

### Opção 2: Via Terminal (Manual)

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento (porta 5174)
npm run dev
```

Acesse no navegador:
- **Site / Landing Page**: http://localhost:5174/
- **App Mobile do Cliente**: http://localhost:5174/app
- **Login / Cadastro da Empresa**: http://localhost:5174/empresa/login
- **Login / Consultório do Profissional**: http://localhost:5174/profissional/login
- **Checkout de Planos**: http://localhost:5174/checkout

### Gerar Build de Produção

```bash
npm run build
npm run preview
```

