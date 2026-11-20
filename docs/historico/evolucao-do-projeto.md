# Evolução do projeto

- [Análise inicial](analise-inicial-legado.md)
- [Análise pós-merge](analise-pos-merge-main-backend.md)

A série inicial de backend adicionou saúde, catálogo, autenticação e operação de senhas. O merge c76d2b0 trouxe identidade visual e telas da main preservando a integração do painel empresarial. O commit 93d6291 atualizou dependências do frontend após a auditoria.

## Validação do checkpoint 1

Antes do commit, o teste manual confirmou a abertura da aplicação, a resposta de saúde da API e a emissão e chamada de senha. O build com Vite 6.4.6 passou, assim como 38 testes JavaScript e 61 testes Python. A saída registrou avisos de tamanho do bundle e de depreciação no ambiente de testes. O registro preserva os resultados e omite capturas, endereços de rede e logs brutos.

## Validação do checkpoint 2

O PostgreSQL local ficou saudável após o reinício. A fila de teste permaneceu
no volume e foi consultada pelo Psycopg a partir do Windows.

## Validação do checkpoint 3

A fila empresarial passou a persistir no PostgreSQL. No teste manual, o painel
emitiu, chamou e concluiu senhas na ordem de prioridade e chegada. O DBeaver
confirmou a persistência e os estados ativo e concluído com seus horários.

Com um atendimento ativo, a API bloqueou a chamada seguinte com HTTP 409.
Após o ajuste do painel, o operador confirmou que o aviso de conclusão
obrigatória ficou visível e que pôde chamar a próxima senha após concluir.

O build passou com Vite 6.4.6. Passaram 38 testes JavaScript e 61 testes Python,
incluindo o teste em PostgreSQL com schema descartável.

## Planejamento da próxima fase

Consulte o [registro de planejamento dos checkpoints 4 a 6](planejamento-checkpoints-4-a-6.md) para as decisões de identidade, integração e organização das páginas.

## Validação do checkpoint 4.1

A revisão do modelo e dos papéis por unidade está no
[registro do checkpoint 4.1](checkpoint-4-1-modelo-de-unidades.md).

## Validação do checkpoint 4.2

O responsável concluiu e aprovou o teste manual das permissões por unidade.
O [registro do checkpoint 4.2](checkpoint-4-2-autorizacao-por-unidade.md)
descreve as evidências e a interpretação das respostas da API.

## Validação do checkpoint 4.3

O responsável aprovou a seleção operacional e a visibilidade das ações.
O [registro do checkpoint 4.3](checkpoint-4-3-selecao-operacional.md)
descreve a evolução e as verificações realizadas.

## Integração dos checkpoints 4.1 a 4.3 na Homolog

A integração reuniu a identidade e as permissões por unidade, a recepção
fictícia do Norte e a seleção operacional no painel. O guia local recebeu
os roteiros das duas branches. O build e os 42 testes JavaScript passaram,
assim como os 65 testes Python com PostgreSQL em schemas descartáveis.
O teste manual do conjunto na Homolog é a verificação seguinte, antes
da promoção para main.

## Desenvolvimento do checkpoint 5.1

O [registro do pré-check-in persistido](checkpoint-5-1-precheckin.md)
descreve a decisão sobre confirmação, ordem de espera e repetição de pedidos.
O roteiro manual está no guia de ambiente local.


## Aceite do checkpoint 5.1

Em 20 de novembro de 2026, o responsável aprovou os oito cenários manuais
do pré-check-in e da confirmação pela recepção. O
[histórico do checkpoint 5.1](checkpoint-5-1-precheckin.md) reúne o aceite
e o resultado dos 68 testes Python com PostgreSQL.
O próximo checkpoint é o 5.2 na DEVBackEnd.
