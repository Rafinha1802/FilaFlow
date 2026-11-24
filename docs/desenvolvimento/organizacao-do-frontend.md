# Organização do frontend

## Estrutura introduzida nos checkpoints 6.1 e 6.2

A SPA continua na raiz do monorepo e o backend permanece em backend/.
A organização agrupa entradas de página por público e apresentações pelo
uso efetivo. O checkpoint 6.1 iniciou o painel; o 6.2 estende a estrutura
às demais páginas. O aceite integrado continua sendo realizado na Homolog.

```text
src/
  assets/
  pages/
    publico/
      landing/LandingPage.jsx
      checkout/CheckoutPage.jsx
    cliente/
      app/ClientAppPage.jsx
    empresa/
      login/CompanyLoginPage.jsx
      painel/CompanyDashboardPage.jsx
      recepcao/ReceptionPage.jsx
    profissional/
      login/ProfessionalLoginPage.jsx
      consultorio/ProfessionalWorkspacePage.jsx
  components/
    compartilhados/
      BrandLogo.jsx
      OperationalLogin.jsx
      NotificationBanner.jsx
      demonstracao/
    exclusivos/
      publico/
        landing/
        checkout/
      cliente/
        app/
      empresa/
        login/
        painel/
        recepcao/
      profissional/
        login/
        consultorio/
  hooks/
    useClientCheckin.js
    useCompanySession.js
    useCompanyQueue.js
    useOperationalQueues.js
    useLandingDemo.js
  router/
    routes.js
    historyRouter.js
    useAppRouter.js
  services/
  App.jsx
  index.css
  main.jsx
```

App.jsx compõe as áreas e coordena a navegação de alto nível. A sessão
empresarial é obtida por useCompanySession e consumida pela navegação
pública e pela página empresarial. Essa necessidade de dois consumidores
justifica manter a chamada do hook em App.jsx. O hook restaura a sessão
pela API e trata a saída e as alterações de armazenamento entre abas.

CompanyDashboardPage compõe o login ou o painel conforme a validação da
sessão. Ela associa as abas às URLs, fornece callbacks de navegação e
adapta o estado operacional para a apresentação. useCompanyQueue concentra
a seleção das filas permitidas, consulta, assinatura de eventos, emissão,
chamada e conclusão. As requisições continuam em services/api.js.
A autorização definitiva permanece no backend.

CompanyDashboard e CompanyProfileView pertencem exclusivamente ao painel.
OperationalLogin é compartilhado entre os portais empresarial e
profissional. A classificação considera os consumidores efetivos do
componente. Uma apresentação visual semelhante, isoladamente, não exige
que dois componentes sejam fundidos. Tampouco é necessário criar uma
pasta vazia para cada destino previsto no planejamento.

As abas de métricas, equipe e totem preservam o comportamento anterior.
Sua presença na interface não representa uma nova integração com a API.
Esses blocos ainda compõem uma apresentação extensa em CompanyDashboard.
Uma subdivisão visual posterior pode ser feita por aba; o recorte atual
separa a coordenação operacional das apresentações sem reescrever essas
funcionalidades demonstrativas.

## Responsabilidades das páginas e componentes

| Área | Página | Lógica e apresentação |
| --- | --- | --- |
| Site público | LandingPage | Compõe Navbar, LandingContent e modais locais. useLandingDemo mantém a demonstração pública. |
| Checkout | CheckoutPage | Adapta os callbacks do fluxo demonstrativo; CheckoutForm mantém a apresentação e as etapas locais. |
| Cliente | ClientAppPage | Compõe a interface integrada. useClientCheckin restaura a sessão, consulta dados, envia pedidos e acompanha eventos. ClientTicketList apresenta estados e horários. |
| Login empresarial | CompanyLoginPage | Compõe OperationalLogin e encaminha o login confirmado à sessão e ao painel. |
| Painel | CompanyDashboardPage | Relaciona abas, sessão e fila operacional. CompanyDashboard mantém a apresentação. |
| Recepção | ReceptionPage | Consulta pendentes e confirma pedidos. PendingPrecheckins apresenta a lista e seus controles. |
| Login profissional | ProfessionalLoginPage | Configura o formulário compartilhado para o acesso profissional. |
| Consultório | ProfessionalWorkspacePage | Restaura a sessão e seleciona filas autorizadas. Consultation mantém consulta, eventos, chamada e conclusão no contexto da fila selecionada. |

As páginas de login são compostas pelos portais quando falta uma sessão
validada. A recepção é composta dentro do painel na URL já existente.
A separação de arquivos não implica criar uma nova URL para cada componente
ou mudar os endereços usados pelos participantes da jornada.

O estado da demonstração pública permanece montado no nível de App.jsx
para preservar a experiência durante navegação interna. Ele está separado
do estado persistido usado em /app. A reorganização não implementa cobrança,
convênio externo ou previsão por IA. O checkout conserva a simulação anterior.

Componentes demonstrativos preservados ficam em subpastas demonstracao
junto de suas áreas. MobileDashboard e SimControlBar ficam na demonstração
compartilhada. Nem todo arquivo preservado está ligado a uma rota ativa;
o preview da landing utiliza MobileDashboard, enquanto os portais integrados
utilizam suas páginas próprias. Essas pastas são uma classificação do código,
não uma barreira de autorização. O conteúdo histórico não foi reativado.

Não foi necessário introduzir um contexto global. A pasta contexts/ permanece
uma possibilidade prevista quando houver consumidores que justifiquem essa
distribuição de estado. A passagem de propriedades e os hooks atendem ao
recorte atual sem adicionar uma dependência de roteamento.

## Navegação

routes.js reúne a classificação das áreas e o mapa das abas empresariais.
historyRouter.js adapta a History API, incluindo pushState, replaceState
e a assinatura de popstate. useAppRouter liga esse adaptador ao estado
React. A separação permite testar a navegação sem adicionar uma biblioteca.

| Aba empresarial | URL |
| --- | --- |
| Operação | /empresa/dashboard |
| Pré-check-ins | /empresa/recepcao |
| Métricas | /empresa/metricas |
| Totem | /empresa/totem |
| Equipe | /empresa/equipe |
| Perfil | /empresa/perfil |

Permanecem os atalhos /empresa, /login e /cadastro, a área /app, a área
/profissional e o checkout em /checkout ou /pagamento. O reconhecimento
de uma área respeita a fronteira entre segmentos de URL. Caminhos sem
área reconhecida mantêm o destino público anterior. Os atalhos de cadastro
não adicionam um cadastro operacional ao produto.

A recarga lê o pathname do navegador. Na implantação, o servidor que
entrega a SPA deve encaminhar as URLs do frontend ao index.html.
O servidor de desenvolvimento do Vite já oferece esse comportamento.
A seleção de fila acompanha a navegação interna do painel; uma nova
montagem consulta novamente as filas autorizadas e usa a seleção padrão.

## Como manter a estrutura

Coloque entradas de rota em pages/<público>/<página>. Coloque apresentações
exclusivas em components/exclusivos/<público>/<página>. Componentes com
consumidores de áreas distintas pertencem a components/compartilhados.
Extraia lógica de sessão ou sincronização para hooks quando ela tiver
responsabilidade própria. Use contexts quando houver uma necessidade
concreta de distribuição de estado entre consumidores distantes.

Ao alterar URLs, atualize o mapa de rotas, seus testes e o roteiro manual.
Ao mover componentes, revise todos os imports e execute o build. Ao tocar
na operação da fila, repita o fluxo de emissão, chamada e conclusão e a
jornada compartilhada. Registre no histórico o que foi implementado, os
limites da verificação automatizada e o aceite manual correspondente.
