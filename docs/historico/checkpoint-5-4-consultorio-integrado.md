# Checkpoint 5.4 — Consultório integrado à mesma senha

A rota profissional passou a autenticar a conta operacional na API e a
consultar as filas em que ela pode atender. A seleção considera os papéis
de administrador e profissional retornados por unidade. A chamada e a
conclusão alteram o registro persistido e atualizam o atendimento exibido.

A revisão substituiu o uso da sessão profissional demonstrativa pela
sessão operacional já utilizada no painel. Assim, as permissões seguem
os vínculos e as atribuições persistidas. A validação simultânea da
recepção e do profissional usa perfis de navegador distintos.

As atualizações de fila utilizam a assinatura empresarial existente.
A tela do cliente passou a assinar individualmente suas senhas abertas.
Os eventos provocam uma nova consulta ao estado persistido. A mensagem
READY aplica esse mesmo procedimento após reconectar. A lógica de
heartbeat e reconexão passou a ser compartilhada pelos dois tipos de
assinatura.

O build e os testes JavaScript verificam os contratos e a autenticação
das conexões. O roteiro manual acompanha cliente, recepção e profissional
em sessões separadas e inclui persistência após recarga e reconexão.
O responsável confirmou o funcionamento da jornada e aprovou todos os
pontos do roteiro manual. O build e os 51 testes JavaScript passaram.

O aceite encerra a etapa 5 com a mesma senha acompanhada pelo cliente,
confirmada pela recepção e chamada e concluída pelo profissional.
A recuperação do estado após recarga e reconexão também foi validada.
O próximo checkpoint reorganiza páginas, rotas e componentes, começando
pelo painel empresarial. A validação conjunta na Homolog antecede a
promoção para a main após a etapa 6.
