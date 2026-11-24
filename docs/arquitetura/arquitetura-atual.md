# Arquitetura atual

O monorepo mantém a SPA React/Vite na raiz e a API FastAPI em backend/. Em desenvolvimento, o Vite encaminha HTTP e WebSocket à API. App.jsx compõe as áreas do frontend. Os checkpoints 6.1 e 6.2 distribuem as entradas em pages/publico, pages/cliente, pages/empresa e pages/profissional. Os componentes se dividem entre compartilhados e exclusivos por público e página. Hooks próprios coordenam a sessão e fila empresarial, o pré-check-in integrado do cliente e a demonstração pública. A operação do consultório fica no componente Consultation, com escopo da fila selecionada.

O backend é organizado em camadas lógicas. api/ recebe requisições, schemas/ define contratos, services/ aplica regras e core/ lê configuração. repositories/ persiste filas e senhas no PostgreSQL quando DATABASE_URL está configurada. Sem a URL, a API usa memória para demonstração e testes.

A chamada oficial usa POST /api/tickets/next. O painel assina atualizações em /ws. Ao receber eventos, o painel consulta novamente o estado oficial da fila.

O mapa de abas e a resolução das áreas estão em router/routes.js. O adaptador historyRouter.js controla a History API e useAppRouter integra a navegação ao React. Consulte a [organização do frontend](../desenvolvimento/organizacao-do-frontend.md) para localizar páginas, componentes exclusivos e compartilhados.
