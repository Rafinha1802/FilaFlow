# Arquitetura atual

O monorepo mantém a SPA React/Vite na raiz e a API FastAPI em backend/. Em desenvolvimento, o Vite encaminha HTTP e WebSocket à API. O frontend organiza telas por área e concentra a coordenação das rotas e jornadas em App.jsx.

O backend é organizado em camadas lógicas. api/ recebe requisições, schemas/ define contratos, services/ aplica regras e core/ lê configuração. repositories/ persiste filas e senhas no PostgreSQL quando DATABASE_URL está configurada. Sem a URL, a API usa memória para demonstração e testes.

A chamada oficial usa POST /api/tickets/next. O painel assina atualizações em /ws. Ao receber eventos, o painel consulta novamente o estado oficial da fila.
