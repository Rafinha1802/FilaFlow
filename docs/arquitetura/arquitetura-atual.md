# Arquitetura atual

O monorepo mantém a SPA React/Vite na raiz e a API FastAPI em backend/. Em desenvolvimento, o Vite encaminha HTTP e WebSocket à API. App.jsx compõe as áreas do frontend. No checkpoint 6.1, a página empresarial passa a ficar em pages/empresa/painel, com sessão e operação da fila extraídas para hooks próprios. A organização das demais páginas continua no checkpoint 6.2.

O backend é organizado em camadas lógicas. api/ recebe requisições, schemas/ define contratos, services/ aplica regras e core/ lê configuração. repositories/ persiste filas e senhas no PostgreSQL quando DATABASE_URL está configurada. Sem a URL, a API usa memória para demonstração e testes.

A chamada oficial usa POST /api/tickets/next. O painel assina atualizações em /ws. Ao receber eventos, o painel consulta novamente o estado oficial da fila.

O mapa de abas e a resolução das áreas estão em router/routes.js. O adaptador historyRouter.js controla a History API e useAppRouter integra a navegação ao React. Consulte a [organização do frontend](../desenvolvimento/organizacao-do-frontend.md) para localizar páginas, componentes exclusivos e compartilhados.
