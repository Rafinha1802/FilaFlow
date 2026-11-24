# Organização do frontend

## Primeiro recorte: checkpoint 6.1

A organização é introduzida por área, conforme os fluxos são revisados.
A SPA continua na raiz do monorepo e o backend permanece em backend/.
As pastas antigas ainda utilizadas serão reorganizadas no checkpoint 6.2.

```text
src/
  pages/
    empresa/
      painel/CompanyDashboardPage.jsx
  components/
    compartilhados/
      OperationalLogin.jsx
    exclusivos/
      empresa/
        painel/
          CompanyDashboard.jsx
          CompanyProfileView.jsx
  hooks/
    useCompanySession.js
    useCompanyQueue.js
    useOperationalQueues.js
  router/
    routes.js
    historyRouter.js
    useAppRouter.js
  services/
    api.js
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
A divisão interna desses blocos e a organização das demais páginas serão
avaliadas na continuidade da extração.

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
