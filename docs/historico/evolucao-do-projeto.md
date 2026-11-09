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
