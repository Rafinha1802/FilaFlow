# TemFyla (FilaFlow) — reavaliação pós-merge

Escopo: branch backend no commit 93d6291, após integrar a main em c76d2b0. O README da raiz descreve a visão e a experiência demonstrativa. CONTEXT.md fica como registro da análise anterior. Para determinar o que está integrado, a referência desta revisão é o código executado e as rotas registradas pelo FastAPI.

## Modelo de negócio e proposta de valor

O README apresenta um SaaS de filas e atendimento para estabelecimentos, com um aplicativo para o cliente final e uma área para profissionais vinculados ou autônomos. A empresa é a compradora mais evidente. Recepção e profissional operam a fila, enquanto o cliente recebe posição, estimativa e avisos. O ganho esperado é reduzir espera presencial e melhorar a previsibilidade. O repositório demonstra essa proposta, mas ainda não mede redução de espera, abandono ou ganho de capacidade em operação.

A oferta comercial inclui Starter, Profissional e Enterprise, ciclos mensal e anual e preços exibidos na interface. Os valores são configuração da demonstração. O checkout simula PIX, cartão e boleto, e não há cobrança, recorrência, confirmação por provedor ou autorização de recursos por plano no servidor. IA, integrações externas, notificações, assinatura digital, SLA e conformidade são itens da visão comercial que precisam de implementação ou evidência própria. O projeto mostra vários segmentos, mas a jornada que tem suporte operacional real é o balcão de uma clínica demonstrativa.

## Jornadas e fontes de estado

| Jornada | Estado na branch pós-merge | Onde o fluxo para |
| --- | --- | --- |
| Visitante conhece o produto | Landing, segmentos, simulador e celular interativo no React. | Cenários e dados da demonstração. |
| Empresa entra no painel | Login explícito no FastAPI, sessão JWT validada em /api/auth/me e logout no navegador. | Uma conta de desenvolvimento configurada no servidor. Sem cadastro empresarial ativo, recuperação ou isolamento por empresa. |
| Empresa emite e chama senha | Emissão normal ou prioritária, consulta e chamada confirmadas pelo FastAPI. O servidor ordena por prioridade e, dentro do grupo, por chegada. | O painel usa clinica-vida. As senhas vivem na memória de um processo. Encerrar e registrar ausência exibem aviso de funcionalidade pendente. |
| Empresa alterna abas e usa telão | Dashboard com navegação por rota, apresentação de chamadas e síntese de voz no navegador. Atualizações da fila chegam aos painéis autenticados via WebSocket e disparam consulta REST. | A confirmação da fila é compartilhada pelo servidor. Recursos de apresentação, histórico de interface, perfil, equipe e métricas precisam ser avaliados separadamente de persistência e relatórios oficiais. |
| Recepção tria e autoriza | Tela com dados iniciais e chamadas de API para recepção, com alterações locais e geração de códigos na interface. | As rotas de recepção não existem no FastAPI desta branch. A autorização local não cria uma senha oficial nem confirma convênio. |
| Cliente entra, cria conta ou usa login social | Interface mobile com perfil e sessão demonstrativos no armazenamento local. O login pode selecionar ou criar um perfil de demonstração sem autenticar a identidade no servidor. | Sem login de paciente no FastAPI, OAuth ou recuperação efetiva. |
| Cliente explora, lê QR, entra em fila ou pede mais tempo | Catálogo, QR simulado, pré-check-in e mudanças de posição no React. A aprovação do convênio é simulada por temporizador. | Não há vínculo com a senha da recepção, inscrição autenticada do paciente ou confirmação de chegada em outro dispositivo. |
| Cliente recebe chamada ou previsão | Notificações e conflitos demonstrativos na interface. Reportar atraso tenta uma rota ausente e muda a estimativa local por regra fixa. | O WebSocket integrado pertence à sessão empresarial. A chamada oficial não fecha a jornada do paciente e o toast de IA não representa cálculo preditivo do servidor. |
| Profissional entra, configura perfil e atende | Login e cadastro demonstrativos, perfis no navegador, fila local, cronômetro, chamadas sonoras e anotações. | Sem identidade de profissional no FastAPI, fila compartilhada com a recepção ou prontuário persistido. Código de validação gerado na interface não comprova assinatura. |
| Empresa contrata um plano | Página, seleção de ciclo e formas de pagamento, confirmação e redirecionamento simulados. | Sem provedor, webhook, assinatura ativa no servidor ou criação de credencial empresarial. A tela de cadastro em etapas existe no código, mas a rota empresarial atual usa o fluxo de login do FastAPI e avisa que cadastro está indisponível. |

## Arquitetura que existe hoje

- **Monorepo com dois processos em desenvolvimento.** React/Vite na raiz e FastAPI/Uvicorn em backend/. Vite na porta 5174 encaminha /api e /ws ao backend na 8000. O frontend é uma SPA com History API e roteador próprio. O app mobile é uma experiência web.
- **Backend em camadas dentro de um processo.** app/api recebe HTTP e WebSocket, app/schemas define contratos Pydantic, app/services implementa autenticação, catálogo, senhas e eventos e app/core concentra configuração. O catálogo é fixo, o contador e as senhas usam estruturas em memória protegidas por um lock, e as conexões WebSocket são registradas em memória. DATABASE_URL é lida como configuração, sem repositório de dados ou migração aplicada pelo código atual. Reiniciar perde a fila. Workers distintos teriam estados distintos.
- **Frontend organizado por áreas, com coordenação central em App.jsx.** O roteador define a área, App.jsx reúne sessão, efeitos, modais, navegação e regras de simulação, e os componentes renderizam as telas. api.js conversa com o backend. authService.js e mockData.js alimentam fluxos locais. Há estado no servidor, no React e no localStorage, dependendo da jornada.
- **Fluxo operacional implementado.** CompanyLogin chama POST /api/auth/login. App valida GET /api/auth/me. O painel consulta GET /api/tickets, emite em POST /api/tickets/manual e chama em POST /api/tickets/next. A resposta REST é a confirmação da operação. Em /ws, o painel envia subscribe com queue_id e token na primeira mensagem. READY, QUEUE_UPDATED e TICKET_CALLED provocam nova consulta, inclusive após reconexão. O catálogo público GET /api/queues tem dados de demonstração servidos pelo backend. GET /api/health confirma que a API responde.

## Onde código e documentação divergem

| Afirmação ou expectativa | Evidência no código |
| --- | --- |
| Login empresarial de um clique, autenticação em segundo plano e fallback offline para todas as funções | O merge preservou CompanyLogin com credenciais explícitas e sessão validada. Operações oficiais falham quando o servidor não confirma. |
| Cadastro empresarial completo e pagamento ativam o painel | CompanyAuth permanece no código, mas a rota empresarial usa CompanyLogin. O checkout pode gerar confirmação local, sem criar conta utilizável no FastAPI. |
| Login de paciente ligado ao FastAPI | Nenhuma rota /api/auth/patient foi registrada. MobileAuthView usa apenas armazenamento local. |
| Chamada por /api/queues/{id}/call-next e WebSocket em /ws/queues | Os contratos implementados são POST /api/tickets/next e /ws. |
| Atraso, IA e alertas em todos os dispositivos | A rota de atraso não existe, o cálculo atual é local e a assinatura WebSocket do painel não atualiza o cliente. |
| Inicialização integrada pelo .bat | iniciar_tudo.bat procura app/main.py na raiz ou em repositórios vizinhos. Não procura backend/app/main.py e pode iniciar outro checkout. O caminho manual permite apontar para o backend correto. |

O fluxo empresarial de emitir, listar e chamar é consistente entre a tela e o contrato atual. A principal inconsistência é de domínio: o cliente e o profissional manipulam filas que não representam as mesmas senhas do servidor. A chamada seguinte pode substituir o atendimento ativo sem um registro de encerramento. Sem um ciclo persistido da senha, as métricas de espera e atendimento e a previsão ainda não têm uma fonte confiável.

Os fluxos demonstrativos devem ser usados com dados fictícios. A revisão de segurança para uso com dados reais é uma etapa separada.

## O que mudou em relação ao CONTEXT.md

- A marca, as páginas, o mapa de rotas e a oferta comercial cresceram com a main. A estrutura continua sendo React na raiz mais FastAPI em backend/.
- A análise anterior continua útil para separar empresa, cliente e profissional e para identificar a falta de persistência e multi-tenancy. O README atual é mais amplo em escopo, mas a existência de uma tela não altera o status da integração.
- O mapa de endpoints e as jornadas devem usar a matriz acima. A principal capacidade comprovada segue sendo autenticação empresarial e fila operacional em memória com atualização entre painéis.
- O roadmap anterior continua relevante como referência. A ordem sugerida nesta revisão começa com uma única jornada vertical para obter dados operacionais antes de ampliar IA, cobrança e segmentos.

## Ordem sugerida para evoluir

1. **Tornar a demonstração inequívoca.** Ajustar README, script de inicialização e mensagens de sucesso. Indicar o que é local e impedir que um erro de API pareça aprovação real. Separar os campos de demonstração de qualquer dado sensível real.
2. **Fechar uma jornada real de atendimento.** Persistir empresa, unidade, fila, senha e transições. Ligar um check-in de cliente à mesma senha visível na recepção e no consultório. Validar permissões por papel e por unidade, e completar chamada, atendimento, ausência e encerramento.
3. **Validar em dois navegadores.** Cliente faz check-in, recepção confirma, profissional chama, cliente vê a atualização, profissional encerra. Recarregar as telas e reiniciar o backend deve preservar o histórico quando a persistência existir. Também testar fila vazia, falha de rede e isolamento entre empresas.
4. **Medir antes de vender previsão.** Registrar tempos reais de chegada, chamada e conclusão. Comparar uma estimativa simples com os tempos observados antes de introduzir um modelo preditivo. Integrar cobrança e permissões dos planos quando a jornada central estiver validada.

## Como verificar as conclusões

- Referências de produto: README.md, seções Visão Geral, Planos e Integração com Backend, e CONTEXT.md, seções Jornadas, Estado Atual e Roadmap.
- Contrato executável: backend/app/main.py, backend/app/api/ e backend/app/services/tickets.py.
- Fluxos web: src/App.jsx, src/services/api.js, src/services/authService.js e componentes em src/components/.
- Validação disponível: build Vite, testes JavaScript de autenticação, fila e WebSocket e testes FastAPI. O walkthrough em navegador de todas as jornadas e a validação comercial em operação ficam pendentes.

Nesta revisão, os 38 testes JavaScript passaram e o build local passou. O build local usou o Vite 6.4.3 instalado em node_modules, enquanto o lockfile fixa 6.4.6. O terminal do usuário já registrou um build bem-sucedido após o audit fix e 61 testes Python aprovados. Esses resultados cobrem os contratos testados, sem substituir a verificação das jornadas em navegador.
