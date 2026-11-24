# Checkpoint 6.2 — Organização das páginas da jornada

Em 24 de novembro de 2026, após a aprovação e o commit do checkpoint 6.1,
o responsável autorizou a continuidade da organização do frontend. A
pergunta sobre a implantação da árvore de diretórios explicitou a
expectativa de que o segundo recorte abrangesse as páginas públicas,
a experiência do cliente e os acessos empresarial e profissional.

A revisão partiu dos consumidores reais dos componentes e das fontes de
estado. As entradas passaram a ocupar pages/publico, pages/cliente,
pages/empresa e pages/profissional. As apresentações foram agrupadas em
components/exclusivos segundo a área e a página. A marca, o formulário
operacional de login e o aviso global foram classificados como
compartilhados. A árvore planejada foi mantida com subpastas adicionais
de demonstração para identificar o código histórico preservado.

A extração não se limitou à movimentação física. A restauração da sessão
do cliente, o envio de pré-check-ins, as consultas e as assinaturas de
eventos passaram a useClientCheckin. A apresentação das senhas ficou em
ClientTicketList. Na recepção, ReceptionPage mantém o controle da consulta
e da confirmação, enquanto PendingPrecheckins apresenta a lista e os
controles. No consultório, Consultation concentra a operação de uma fila,
e ProfessionalWorkspacePage coordena a sessão e a seleção autorizada.

No site público, LandingPage compõe navegação, conteúdo e modais.
useLandingDemo reúne as ações locais que antes sobrecarregavam App.jsx.
Seu estado permanece montado no nível superior para preservar a experiência
durante a navegação. O fluxo persistido do cliente continua independente
dessa demonstração. CheckoutPage compõe o formulário anterior e coordena
os callbacks demonstrativos, sem introduzir cobrança ou cadastro operacional.

As páginas de login consomem o mesmo formulário compartilhado. O painel
continua compondo a recepção na URL existente. Essa organização mantém
a navegação e as interfaces verificadas anteriormente, sem exigir nova
migração ou alteração de contrato do backend. A criação de contexts/ foi
considerada desnecessária para os consumidores atuais: os hooks e a
composição por propriedades atendem à distribuição de estado deste recorte.

O build e os 69 testes JavaScript passaram. A suíte inclui os contratos
HTTP e WebSocket, o adaptador de navegação, a composição das páginas e a
resolução dos imports dos componentes preservados. A renderização desses
testes ocorre sem efeitos de navegador; portanto, não substitui a
validação de reconexão e da jornada com API e PostgreSQL disponíveis.

O roteiro manual foi incluído no guia de ambiente local. Em 24 de novembro
de 2026, o responsável confirmou o funcionamento dos cenários e aprovou
o checkpoint na DEVFrontEnd. Esse aceite complementa o build e os 69
testes JavaScript e autoriza o registro do commit da reorganização.

A integração na Homolog deve reunir as etapas 5 e 6 e repetir a jornada
em ambiente próprio. O aceite deste checkpoint encerra a validação local
da reorganização; a aprovação integrada na Homolog permanece pendente
antes de propor a promoção do conjunto para main.
