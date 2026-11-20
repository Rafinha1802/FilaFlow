# Checkpoint 4.2 — Aceite da autorização por unidade

A validação manual foi concluída em 20 de novembro de 2026 por meio da
documentação interativa da API. O responsável confirmou o login das contas
fictícias habilitadas e verificou a coerência das respostas com os vínculos
por unidade estabelecidos no checkpoint anterior.

A consulta GET /api/queues/me apresentou a unidade e o papel operacional
de cada fila acessível. A conta multivínculo demonstrou a diferenciação
esperada entre administração no Centro e atuação profissional no Norte.
Na repetição do teste com os identificadores de fila retornados pela API,
o responsável confirmou que a emissão respeitou as permissões de cada
unidade e aprovou o checkpoint.

A análise também esclareceu a escolha da unidade durante uma operação.
O identificador da fila determina o contexto da requisição, e o servidor
consulta o vínculo da conta com a unidade correspondente. O campo company
na resposta de login atende à compatibilidade do painel existente. O papel
operacional por unidade é informado pela consulta autenticada de filas.

A suíte automatizada registrou 65 testes Python aprovados com PostgreSQL,
incluindo isolamento entre unidades, papéis diferentes para a mesma conta
e encerramento da assinatura de eventos após remoção do vínculo.
A seleção da unidade pela interface será desenvolvida no checkpoint 4.3.

Este registro preserva o resultado da validação e utiliza somente
identificadores fictícios. As capturas fornecidas durante o teste
permanecem na conversa.
