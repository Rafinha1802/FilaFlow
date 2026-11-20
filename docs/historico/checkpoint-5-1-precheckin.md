# Checkpoint 5.1 — Pré-check-in persistido

A implementação iniciou a ligação entre o cliente e a operação empresarial
pela identidade da senha. Um pedido autenticado cria uma senha pendente,
vinculada ao cliente. A recepção autorizada na unidade confirma esse
registro e o torna elegível à chamada.

O pedido recebe um identificador de requisição. Repetir esse identificador
preserva o resultado anterior. Pedidos adicionais para a mesma fila
durante o atendimento aberto recebem uma resposta de conflito. O cliente
pode participar de filas distintas, conforme a proposta de múltiplas filas.

A revisão adotou o horário de confirmação como entrada na espera. Assim,
um pré-check-in ainda não aprovado não passa à frente de uma senha de
balcão já em espera apenas por ter sido solicitado antes. A prioridade
é definida pela recepção e permanece como o primeiro critério da chamada.

A migração acrescenta o vínculo com o cliente e os horários de confirmação
e entrada na espera. O identificador e os dados anteriores das senhas
persistidas são preservados. Duas contas fictícias permitem validar a
separação entre os pedidos dos clientes pelo Swagger.

O responsável aprovou os oito pontos de validação manual em 20 de novembro
de 2026. A integração das interfaces de cliente e recepção pertence ao
checkpoint 5.3.

A validação automatizada registrou 68 testes Python aprovados com
PostgreSQL em schemas descartáveis. Os testes exercitaram pedidos e
confirmações simultâneos, isolamento das consultas entre clientes,
restrição da confirmação por unidade e papel e preservação dos dados
anteriores ao aplicar e reaplicar a migração.


Durante o aceite, foram confirmados o pedido pendente, a repetição com o
mesmo identificador, o bloqueio de um segundo pedido aberto na mesma fila,
a separação das consultas entre clientes e a confirmação pela recepção
autorizada. A verificação também demonstrou a preservação da mesma senha
na fila oficial e a rejeição de confirmações por contas sem permissão.

O guia local recebeu uma correção nos caminhos dos comandos PowerShell
usados para ativar os clientes e iniciar o ambiente. O registro preserva
o resultado do teste com dados fictícios e omite credenciais e capturas.
