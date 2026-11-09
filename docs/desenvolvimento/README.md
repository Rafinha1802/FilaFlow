# Guia do desenvolvedor

Comece pelo [ambiente local](ambiente-local.md) e pelas [jornadas](../produto/jornadas-e-status.md). Consulte [arquitetura](../arquitetura/arquitetura-atual.md) para localizar responsabilidades e [histórico](../historico/evolucao-do-projeto.md) para entender mudanças de escopo.

- Atualize a jornada quando mudar o comportamento percebido pelo usuário.
- Atualize a arquitetura quando mudar um contrato, dependência ou fonte de estado.
- Registre decisões duráveis com contexto, decisão e consequências. Registre no histórico os marcos verificados e a referência do commit.
- Use dados fictícios. Antes de versionar, revise diffs e anexos para excluir segredos, dados pessoais, dumps e detalhes de incidentes ainda abertos.
- Em cada checkpoint, execute os testes relevantes e registre o resultado do teste manual antes do commit.
