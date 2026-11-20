# Cenário complementar — Recepção na Unidade Norte

A revisão dos dados fictícios identificou que o Norte tinha profissionais
habilitados a chamar e concluir, mas precisava de uma recepção para
exercitar a emissão no fluxo de teste. Foi acrescentada uma conta
fictícia de recepção com vínculo exclusivo com essa unidade.

O responsável ativou a conta e confirmou a emissão no Norte, permitindo
que o profissional chamasse e concluísse a mesma senha. Os testes de
autorização também cobriram o bloqueio de emissão no Centro e o bloqueio
de chamada e conclusão pela recepção. A suíte Python registrou 65 testes
aprovados com PostgreSQL. O responsável aprovou o cenário manual.

O seed pode ser reaplicado preservando as contas existentes. A ativação
pede uma senha interativa, e a configuração local pode ser selecionada
explicitamente para uso em um worktree.
