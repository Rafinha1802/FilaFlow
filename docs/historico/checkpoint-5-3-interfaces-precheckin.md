# Checkpoint 5.3 — Interfaces de cliente e recepção

A implementação liga a rota /app às contas persistidas de cliente e aos
pré-check-ins da API. A tela permite entrar, escolher um estabelecimento,
enviar o pedido e consultar as próprias senhas. A sessão de cliente tem
armazenamento e encerramento independentes da sessão empresarial para
permitir o teste dos dois papéis em abas do mesmo navegador.

O pedido usa um identificador persistido antes do envio. Se houver perda
da resposta, a repetição reutiliza esse identificador até confirmar o
resultado. A tela conserva o erro de envio para que uma consulta periódica
bem-sucedida não o apague antes da leitura.

Na recepção, a interface apresenta os pedidos pendentes da fila selecionada.
A confirmação informa a prioridade escolhida, preserva o número da senha e
retira o pedido dos pendentes após a resposta do servidor. As consultas
periódicas descartam respostas anteriores à operação de confirmação.

As páginas consultam o estado a cada cinco segundos e oferecem atualização
manual. Os testes automatizados verificam sessões independentes, expiração,
cancelamento do login, repetição após perda de resposta e confirmação com
permissão. O build e os 49 testes JavaScript foram aprovados.

Após testar as interfaces, o responsável confirmou o funcionamento do
checkpoint e aprovou a entrega. A jornada preparada para o aceite abrange
o envio pelo cliente, a confirmação pela recepção e a consulta da mesma
senha nos dois perfis. A integração do consultório profissional segue no
checkpoint 5.4.
