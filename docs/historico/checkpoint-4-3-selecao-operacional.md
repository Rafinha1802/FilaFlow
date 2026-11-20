# Checkpoint 4.3 — Seleção operacional no painel

A integração do painel passou a usar as filas autorizadas para a sessão.
O seletor identifica empresa, unidade, serviço e sala, enquanto o papel
operacional aparece ao lado. As consultas, a assinatura de eventos e as
operações de senha usam a fila selecionada. A troca de unidade descarta
respostas pendentes da seleção anterior e limpa o estado visual da fila.

A validação manual confirmou os cenários das contas fictícias. Durante
a revisão, observou-se que os controles de emissão desabilitados não
comunicavam claramente a disponibilidade da ação. O responsável escolheu
exibir os botões somente para quem pode emitir. O painel passou a mostrar
a emissão para recepção e administrador no escopo da unidade escolhida.
O responsável repetiu os testes e aprovou todos os cenários.

O build passou com Vite 6.4.6 e os 42 testes JavaScript foram aprovados.
Uma verificação de renderização confirmou a presença e a ausência dos
dois botões de emissão conforme a permissão. O aceite manual concluiu a
validação da interface para este checkpoint. A integração das branches
na Homolog e seu teste conjunto constituem a próxima verificação.
