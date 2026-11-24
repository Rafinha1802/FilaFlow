# Checkpoint 6.1 — Extração do painel e organização das rotas

Em 24 de novembro de 2026, após o aceite manual do consultório integrado,
o trabalho avançou para a organização do frontend na DEVFrontEnd. A
jornada persistida passou a constituir a referência para a reorganização:
a mudança estrutural deve preservar a emissão, a confirmação, a chamada,
a conclusão e a consulta da mesma senha pelos participantes autorizados.

A análise do código mostrou que App.jsx ainda coordenava a restauração
da sessão empresarial, a escolha da fila, as consultas, a assinatura de
eventos e as operações de atendimento. Essas responsabilidades foram
extraídas para useCompanySession e useCompanyQueue. A nova página
CompanyDashboardPage compõe a interface e relaciona as abas do painel
às rotas existentes. App.jsx mantém a composição das áreas e o estado
ainda utilizado pelas experiências públicas.

A classificação dos componentes seguiu o critério de uso discutido no
planejamento. O painel e seu perfil empresarial foram colocados em um
diretório exclusivo da página. O formulário de login passou ao diretório
compartilhado porque atende empresa e profissional. Essa decisão evita
classificar como exclusivo um componente que já possui dois consumidores.
A organização completa das demais páginas permanece no recorte do 6.2.

O roteador existente foi mantido e dividido entre resolução das áreas,
adaptação da History API e integração com o React. O mapa empresarial
centraliza a relação entre aba e URL. Foram preservados os atalhos,
as URLs da jornada e a navegação pelo histórico. A seleção operacional
permanece acima das abas, de forma que a navegação interna não escolha
outra unidade. Ao desmontar a página, a assinatura é encerrada e as
respostas pendentes deixam de atualizar seu contexto.

O build e os 61 testes JavaScript passaram. Os testes existentes cobrem
os contratos HTTP e WebSocket utilizados pela jornada. Os novos testes
verificam a resolução das áreas, os atalhos, a leitura da URL na recarga,
as operações de histórico e a composição do login ou do painel conforme
o estado de validação. A renderização automatizada da página verifica
também a integridade dos imports após as movimentações.

O teste do adaptador utiliza uma simulação da History API; a renderização
da página ocorre sem executar efeitos de navegador. Esses testes não
substituem a operação da interface com API e banco disponíveis. O roteiro
manual foi incluído no guia de ambiente local. Em 24 de novembro de 2026,
o responsável confirmou que todos os pontos foram validados e que o
sistema funcionou conforme esperado, aprovando o checkpoint para commit.
O aceite abrange a navegação e a operação do painel após a extração,
incluindo a regressão da jornada compartilhada indicada no roteiro.

O próximo recorte é o checkpoint 6.2, dedicado à organização das demais
páginas e dos componentes da jornada. A validação integrada na Homolog
antecede a promoção para main, conforme o fluxo de branches acordado.
