# Planejamento da integração por unidade e da jornada compartilhada

## Ponto de partida

A conclusão do terceiro checkpoint demonstrou que o painel empresarial opera
uma fila persistida em PostgreSQL. O teste manual no painel e no DBeaver
confirmou a ordem de chamada, o registro de conclusão e o bloqueio de uma
segunda chamada durante um atendimento ativo. Essa evidência valida a operação
de balcão. A jornada do cliente e o consultório ainda precisam ser ligados ao
mesmo registro de atendimento.

## Decisões discutidas com o responsável pela validação

A discussão começou pela definição de quem pode operar uma fila. A conta
empresarial de desenvolvimento permitia testar o painel, mas a expansão para
mais de uma unidade exige relacionar cada operação à identidade e ao vínculo
vigente. Foi aprovado um modelo em que uma conta pode atuar em várias unidades.
O primeiro teste usará contas com vínculos distintos para demonstrar isolamento.
Uma conta com mais de um vínculo também será testada, pois o papel pode variar
entre unidades.

A divisão do trabalho operacional foi aprovada com base na jornada de
atendimento. A recepção poderá confirmar o pré-check-in e emitir uma senha de
balcão. O profissional poderá chamar e concluir nas filas que estiver
autorizado a operar. O administrador poderá executar essas ações dentro da
unidade em que tiver esse papel. A autorização será verificada no servidor
tanto para requisições HTTP quanto para a assinatura de atualizações.

Para observar a jornada sem depender de cadastro público, foi acordado usar
contas fictícias de clientes pré-criadas. A recepção e o profissional devem
acompanhar a mesma senha criada para o cliente, e o cliente só poderá consultar
seu próprio atendimento. A validação ficará restrita ao ciclo de atendimento.
Cobrança, convênio real, recuperação de conta e notificações externas serão
tratados em etapas próprias.

## Organização da implementação

O responsável pela validação propôs organizar o frontend em páginas por público,
com componentes compartilhados e componentes exclusivos identificados pela
página que os utiliza. A proposta orienta o checkpoint 6. A navegação já utiliza
a History API. A primeira mudança prevista é tornar explícita a relação entre
URL, página e layout, mantendo as URLs existentes e testando seu comportamento
antes de avaliar a necessidade de uma biblioteca adicional.

As alterações de servidor serão desenvolvidas na DEVBackEnd e as de interface
na DEVFrontEnd. A Homolog foi alinhada à main e receberá os dois lados da
integração. A ordem de publicação seguirá as dependências entre contratos e
telas. O ambiente de homologação usará um banco separado, com dados fictícios.
A promoção para a main ocorrerá após validação do conjunto.

Cada checkpoint será dividido em mudanças verificáveis. A revisão automatizada
precederá o teste manual feito pelo responsável pela validação. O aceite manual
será registrado antes de criar o commit. A sequência, os testes e a estrutura
de pastas propostas estão no [plano de implementação](../desenvolvimento/plano-checkpoints-4-a-6.md).

Este registro descreve decisões de planejamento. As evidências de execução
serão acrescentadas conforme cada entrega for validada.
