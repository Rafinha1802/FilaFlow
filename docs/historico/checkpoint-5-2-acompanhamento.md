# Checkpoint 5.2 — Operação profissional e acompanhamento individual

O desenvolvimento ampliou a autorização por unidade para representar a
atribuição do profissional à fila que opera. O vínculo com a unidade
define seu papel, e professional_queues identifica as filas atribuídas.
As contas de recepção e administração continuam usando as permissões
operacionais definidas na etapa 4.

O acompanhamento do cliente passou a oferecer a consulta de uma senha
própria com os horários de chamada e conclusão. Uma assinatura individual
avisa quando aquela senha é confirmada, chamada ou concluída. Após uma
reconexão, a consulta ao registro persistido recupera o estado atual.

A verificação considera sessões separadas para recepção, profissional e
cliente. Os cenários de teste incluem chamadas concorrentes, tentativa de
acesso à senha de outra conta, retirada de uma atribuição profissional e
desativação de cliente durante a assinatura. O roteiro manual está no
guia de ambiente local. O responsável concluiu e aprovou o roteiro manual.

A suíte registrou 71 testes Python aprovados com PostgreSQL em schemas
descartáveis. As verificações cobriram atualização exclusiva da senha,
recuperação após reconexão, chamada concorrente, isolamento de clientes
e revogação de acesso profissional.


## Aceite manual

Em 24 de novembro de 2026, o responsável confirmou os oito pontos do
roteiro. A consulta autenticada exibiu o estado pendente da senha e
respondeu 404 quando outra conta de cliente tentou consultá-la.
A recepção do Norte confirmou o mesmo registro. A chamada e a conclusão
pelo profissional atualizaram o estado e os horários observados pelo
cliente e no DBeaver.

O teste do bloqueio foi realizado com atendimento ativo e outra senha em
espera, condição que produz a resposta 409. A revisão distinguiu o id
numérico usado na consulta individual do ticket_number usado na conclusão,
que inclui o símbolo de número. O guia usa os valores retornados pela API
para orientar esse preenchimento.

O utilitário demonstrou o recebimento das atualizações e a recuperação
do estado após reconectar e reiniciar o backend. A conferência dos horários
explicou a equivalência entre UTC, identificado por Z na API, e a
apresentação com deslocamento de três horas no DBeaver. O utilitário passou
a exibir o horário local com o deslocamento explícito e uma única consulta
inicial após a confirmação da assinatura.

A conferência de professional_queues validou a atribuição explícita da
fila ao profissional. O responsável aprovou a etapa com esses resultados.
O checkpoint 5.3 dará continuidade à integração das interfaces de cliente
e recepção na DEVFrontEnd. Este registro usa dados fictícios e preserva
o relato de validação sem incorporar capturas com credenciais.
