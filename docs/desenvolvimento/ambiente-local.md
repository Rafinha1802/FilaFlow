# Ambiente local no Windows

Com Node.js, npm e Python disponíveis, execute na raiz do repositório:

```powershell
npm ci
python -m venv backend/.venv
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

Para testar o login empresarial, configure uma conta fictícia e uma chave JWT local na sessão do PowerShell. Leia a senha sem exibi-la e gere seu hash:

```powershell
$env:DEMO_USER_EMAIL = 'operador@example.invalid'
$env:DEMO_PASSWORD_HASH = .\backend\.venv\Scripts\python.exe -c "from getpass import getpass; from pwdlib import PasswordHash; print(PasswordHash.recommended().hash(getpass('Senha ficticia: ')))"
$env:JWT_SECRET_KEY = .\backend\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
.\iniciar_tudo.bat
```

Abra o frontend em http://localhost:5174/ e confirme a API em http://127.0.0.1:8000/api/health. Use a conta fictícia para entrar no painel. Feche os dois terminais dos serviços para encerrar. O script utiliza as variáveis herdadas do PowerShell e as dependências instaladas acima.

Para validar sem iniciar os servidores:

```powershell
npm run build
node --test tests/auth-api.test.js
Push-Location backend
.\.venv\Scripts\python.exe -m pytest tests -q
Pop-Location
```

## Acesso local e endereços de rede

O Vite mostra um endereço local e, com a configuração atual de escuta, pode listar um endereço por interface de rede do computador. Todos apontam para a mesma instância. Use localhost no próprio computador. A API escuta apenas em 127.0.0.1, mas o proxy do Vite encaminha as rotas da API e do WebSocket. Mantenha o servidor de desenvolvimento em redes confiáveis.

## PostgreSQL local

Abra o Docker Desktop e aguarde o motor Linux. Na raiz do repositório, defina
uma senha local descartável usando PowerShell 7. Guarde-a fora do Git para reutilizar com o mesmo
volume. O PostgreSQL mantém a senha configurada na primeira inicialização do
volume.

```powershell
$env:TEMFYLA_DB_PASSWORD = Read-Host 'Senha local do banco' -MaskInput
docker compose config --quiet
docker compose up -d --wait db
Get-Content -Raw -Encoding utf8 backend/migrations/001_create_queues.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
Get-Content -Raw -Encoding utf8 backend/migrations/seed_demo.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
docker compose exec -T db psql -U temfyla -d temfyla -c "SELECT id FROM queues;"
docker compose restart db
docker compose up -d --wait db
docker compose exec -T db psql -U temfyla -d temfyla -c "SELECT id FROM queues;"
```

Para testar o driver Python pelo endereço publicado no host, rode na raiz:

~~~powershell
.\backend\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\backend\.venv\Scripts\python.exe -c "import os, psycopg; c = psycopg.connect(host='127.0.0.1', port=os.getenv('TEMFYLA_DB_PORT', '5433'), dbname='temfyla', user='temfyla', password=os.environ['TEMFYLA_DB_PASSWORD'], connect_timeout=5); print(c.execute('SELECT id FROM queues').fetchall()); c.close()"
~~~

O resultado esperado antes e depois do reinício é a fila fictícia
`clinica-vida`. O banco escuta localmente na porta 5433 por padrão. Para
encerrar os serviços preservando o volume, use `docker compose down`.


### Arquivos de configuração local

Para reutilizar a configuração entre sessões, copie .env.example para .env na
raiz e preencha a senha do volume local. A variável da sessão PowerShell, quando
definida, tem precedência no Compose. O teste Python acima lê o ambiente do
PowerShell, então mantenha a variável da sessão ao executá-lo.

A raiz configura o Docker Compose. O backend tem seu próprio modelo em
backend/.env.example. O inicializador carrega backend/.env quando o arquivo existe. Use o prefixo VITE_ apenas
para valores públicos que podem chegar ao navegador.

### Gerar os dois arquivos com um assistente

Com as dependências Python instaladas, execute na raiz:

~~~powershell
.\backend\.venv\Scripts\python.exe scripts/configurar_ambiente_local.py
~~~

O assistente pede a porta, o e-mail fictício e as senhas sem exibi-las. Para
um volume PostgreSQL existente, informe a senha usada na primeira
inicialização. Para um volume novo, Enter gera a senha do banco. O script
gera o hash do operador, a chave JWT e a URL de conexão e preserva arquivos
existentes. As senhas e chaves ficam nos arquivos ignorados pelo Git.
### Validar a fila persistida

Com o banco saudável, a fila fictícia inserida e backend/.env configurado,
aplique a segunda migração antes de iniciar a API:

~~~powershell
Get-Content -Raw -Encoding utf8 backend/migrations/002_create_tickets.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
.\iniciar_tudo.bat
~~~

No painel, emita uma senha comum e uma prioritária. Chame a próxima e
confirme que é a prioritária. Reinicie a API e verifique se o atendimento
ativo e a espera foram preservados. Conclua o atendimento e chame a senha
restante. Com atendimento ativo e fila em espera, uma segunda chamada
deve pedir que você conclua o atendimento atual.

Para executar a suíte com PostgreSQL, configure TEST_DATABASE_URL no
PowerShell com a URL do banco local, sem imprimi-la. O teste usa um schema
descartável e exige permissão de criação de schema. Rode os testes conforme
o início deste guia. Sem a variável, o teste PostgreSQL aparece como ignorado.

### Validar unidades e vínculos (checkpoint 4.1)

Use apenas o PostgreSQL local de desenvolvimento. Com as migrações 001 e
002 aplicadas, rode na raiz:

~~~powershell
Get-Content -Raw -Encoding utf8 backend/migrations/003_create_unit_identity.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
Get-Content -Raw -Encoding utf8 backend/migrations/seed_unit_identity_demo.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
~~~

No DBeaver, confira as duas unidades fictícias em units, o vínculo de cada
fila em queue_units e os dois papéis da conta demo-multi em unit_memberships.
Confira que as senhas que já estavam em tickets mantêm os identificadores
e estados. As contas fictícias começam desativadas, sem senha, até a etapa
de autenticação. A migração atribui uma unidade separada a cada fila antiga
sem vínculo; filas da mesma unidade podem ser associadas explicitamente.

### Validar autenticação e permissões por unidade (checkpoint 4.2)

Com o PostgreSQL local saudável e o seed do 4.1 aplicado, confira se
backend/.env tem DATABASE_URL e JWT_SECRET_KEY. Na raiz, ative as contas
fictícias abaixo. O script pede a senha e a confirmação sem eco no terminal.
Contas já ativadas mantêm a senha definida anteriormente.

~~~powershell
.\backend\.venv\Scripts\python.exe backend/activate_demo_account.py demo-centro
.\backend\.venv\Scripts\python.exe backend/activate_demo_account.py demo-norte
.\backend\.venv\Scripts\python.exe backend/activate_demo_account.py demo-multi
.\iniciar_tudo.bat
~~~

Abra http://127.0.0.1:8000/docs. Para cada conta, faça POST /api/auth/login
com o e-mail fictício correspondente e use o access_token em Authorize.
Troque o token ao mudar de conta. Use GET /api/queues/me para conferir as
filas e o papel associado a cada unidade.

| Conta | Aceite esperado |
| --- | --- |
| centro@example.invalid | Consulta e emite na fila clinica-vida. Recebe 403 ao chamar nessa fila ou acessar a fila do Norte. |
| norte@example.invalid | Consulta, chama e conclui na fila clinica-vida-norte. Recebe 403 ao emitir ou acessar a fila do Centro. |
| multi@example.invalid | Opera como administrador na fila do Centro e como profissional na fila do Norte. Recebe 403 ao tentar emitir no Norte. |

O Norte começa sem senhas. Para exercitar uma chamada bem-sucedida no
Norte, o banco de testes precisa de uma senha em espera naquela fila.
A suíte automatizada valida o WebSocket com sessões independentes e
revogação de vínculo. As telas de seleção da unidade entram no 4.3.

Com DATABASE_URL configurada, o login usa contas persistidas. A conta de
demonstração de backend/.env é usada no modo em memória. O campo role do
login continua com o valor company para compatibilidade com o painel.
O papel efetivo vem de GET /api/queues/me e é aplicado pelo servidor.

### Cenário complementar de recepção no Norte

O seed inclui a conta demo-recepcao-norte, com e-mail
recepcao-norte@example.invalid e papel reception apenas na Unidade Norte.
Reaplique seed_unit_identity_demo.sql e ative a conta com o script
activate_demo_account.py. Em um worktree sem configuração própria, o
argumento --env-file permite selecionar o backend/.env local.

O teste manual deve confirmar emissão no Norte e bloqueio de emissão no
Centro. Chamada e conclusão ficam com as contas profissionais do Norte.
A execução automatizada verifica esse ciclo e a preservação dos vínculos
quando o seed é reaplicado.

### Validar seleção operacional no painel (checkpoint 4.3)

Na Homolog, valide o frontend e a API integrados com os checkpoints 4.1 a 4.3.
As contas precisam estar ativadas conforme o roteiro anterior.

1. Entre com multi@example.invalid em /empresa/login.
2. No seletor Unidade e fila, confira Centro com papel Administrador e Norte
   com papel Profissional.
3. No Centro, emita uma senha fictícia e confirme a fila no DBeaver.
4. Troque para o Norte. Confira o papel, os dados da fila selecionada e o
   botão de emissão oculto. Chamada e conclusão seguem disponíveis
   quando o estado da fila permite.
5. Volte ao Centro e confira a senha emitida. Recarregue a página e confira
   que o painel carrega uma fila permitida para a sessão.
6. Saia e entre como centro@example.invalid. Confira apenas a fila Centro,
   com emissão habilitada e chamada e conclusão desabilitadas.
7. Saia e entre como norte@example.invalid. Confira apenas a fila Norte,
   com emissão oculta. Repita a navegação com sessões independentes.
8. Durante uma consulta em rede lenta, troque a fila. A resposta da fila
   anterior deve ser descartada. Durante uma operação de gravação o seletor
   fica desabilitado até o término da requisição.

O seletor mostra somente as filas que a API autoriza para a conta atual.
Em cada opção aparecem empresa, unidade, serviço e sala. O papel fica
visível ao lado do seletor. As operações oficiais usam a fila selecionada.

### Validar pré-check-in e confirmação (checkpoint 5.1)

Na DEVBackEnd, com o PostgreSQL local saudável e as migrações 001 a 003
já aplicadas, encerre o backend antes de aplicar a migração 004.
Ela preserva o identificador, o estado e os horários das senhas anteriores.

~~~powershell
Get-Content -Raw -Encoding utf8 backend/migrations/004_create_precheckins.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
Get-Content -Raw -Encoding utf8 backend/migrations/seed_client_demo.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
& "./backend/.venv/Scripts/python.exe" backend/activate_demo_account.py demo-cliente
& "./backend/.venv/Scripts/python.exe" backend/activate_demo_account.py demo-cliente-2
& "./iniciar_tudo.bat"
~~~

As contas cliente@example.invalid e cliente-2@example.invalid usam senhas
escolhidas durante a ativação. No Swagger, faça login em /api/auth/login
e informe o access_token em Authorize. Essas contas recebem role client
e podem criar e consultar seus próprios pré-check-ins.

1. Com a conta cliente@example.invalid, execute POST /api/pre-checkins
   com o corpo abaixo. Guarde o id retornado. O status esperado é pending,
   e waiting_since fica vazio.
2. Repita o mesmo corpo. O id e a senha devem continuar iguais.
3. Troque request_id por um UUID novo mantendo a fila. Enquanto a primeira
   senha estiver aberta, a API responde 409.
4. Com a conta cliente-2@example.invalid, execute GET /api/pre-checkins/me.
   A senha criada pela primeira conta deve ficar fora da resposta.
5. Com centro@example.invalid, execute GET /api/pre-checkins usando
   queue_id clinica-vida. O pré-check-in deve aparecer. Em GET /api/tickets,
   ele ainda fica fora da espera.
6. Com o token da recepção do Centro, execute
   POST /api/pre-checkins/{ticket_id}/confirm usando o id guardado e o
   corpo {"is_priority": false}. Confira status waiting, confirmed_at e
   waiting_since preenchidos. Repita a confirmação e confira o mesmo id
   e os mesmos horários.
7. Confira no DBeaver o mesmo registro em tickets. A coluna confirmed_by
   indica a conta que confirmou. Faça GET /api/tickets para conferir a
   entrada na fila. O painel empresarial pode chamar e concluir a senha.
8. Tente confirmar com cliente@example.invalid ou norte@example.invalid.
   O resultado esperado é 403. Com o token do cliente original,
   GET /api/pre-checkins/me deve continuar mostrando a mesma senha e
   o estado persistido após confirmação e chamada.

Corpo do primeiro pedido, usando um request_id novo para cada intenção
de entrada na fila. Para repetir uma requisição incerta, reutilize o
request_id original.

~~~json
{
  "queue_id": "clinica-vida",
  "request_id": "4e443eba-c37c-4c80-b061-f61ec1904ccd"
}
~~~

A identidade e o nome vêm da conta de cliente autenticada. O serviço vem
do catálogo da fila. A recepção define a prioridade na confirmação.
A ordem entre senhas da mesma prioridade usa a entrada efetiva na espera.
Uma conta pode ter senhas abertas em filas diferentes. Cada conta admite
uma senha aberta por fila. Depois da conclusão, pode enviar um novo pedido
com outro request_id.

### Validar operação profissional e acompanhamento (checkpoint 5.2)

Com a migração 004 aplicada e as contas fictícias ativadas, encerre o
backend e execute na raiz:

~~~powershell
Get-Content -Raw -Encoding utf8 backend/migrations/005_create_professional_queues.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
Get-Content -Raw -Encoding utf8 backend/migrations/seed_professional_queue_demo.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U temfyla -d temfyla
& "./iniciar_tudo.bat"
~~~

A tabela professional_queues atribui a fila Norte às contas demo-norte e
demo-multi. Profissionais precisam do vínculo com a unidade e da atribuição
à fila para consultá-la, chamá-la, concluí-la ou assinar seus eventos.
Recepção e administrador mantêm suas operações dentro da unidade.
A migração cria a estrutura e o seed acrescenta somente as atribuições
fictícias. Para contas e filas próprias, registre as atribuições
explicitamente. O DBeaver permite conferir os vínculos.

1. Entre como cliente@example.invalid no Swagger. Crie um pré-check-in
   no Norte com um request_id novo, conforme o checkpoint 5.1.
   Guarde o id numérico retornado.
2. Use GET /api/pre-checkins/{ticket_id} com o token do cliente. Confira
   pending. Execute o mesmo GET com cliente-2@example.invalid. Espere 404.
3. Entre como recepcao-norte@example.invalid e confirme o pedido. Com o
   token do cliente original, confira waiting e confirmed_at preenchido.
4. Entre como norte@example.invalid. Confira a fila Norte em /api/queues/me.
   Chame a próxima senha. Com o token do cliente original, consulte o id
   guardado e confira active e called_at preenchido.
5. Tente chamar novamente com outra senha em espera e um atendimento
   ativo. Espere 409. Conclua com a conta profissional, informando o
   ticket_number retornado na chamada. O cliente deve observar finished
   e finished_at preenchido.
6. Para observar eventos ao vivo, abra outro terminal na raiz e execute
   o comando abaixo, substituindo 60 pelo id de uma senha do cliente.
   O utilitário pede o login sem exibir a senha. Ele imprime o estado
   inicial após READY e consulta novamente após cada atualização daquela senha.
   Os horários são exibidos no fuso do computador, com o deslocamento UTC.
   Na API, o sufixo Z indica UTC. Por exemplo, 15:14:39Z corresponde a
   12:14:39-03:00. Ambos representam o mesmo instante.
7. Encerre o acompanhamento com Ctrl+C, altere o estado pelo Swagger e
   execute o utilitário novamente. Ele deve recuperar o estado atual.
   Repita após reiniciar o backend para confirmar a persistência.
8. Confira no DBeaver as linhas de tickets e professional_queues.
   Uma fila adicional na mesma unidade só deve aparecer ao profissional
   depois de receber uma atribuição explícita.

~~~powershell
& "./backend/.venv/Scripts/python.exe" backend/watch_my_ticket.py 60
~~~

A assinatura individual usa /ws/tickets. A primeira mensagem contém
type subscribe, ticket_id e token. READY confirma a assinatura e
TICKET_UPDATED avisa sobre confirmação, chamada ou conclusão.
GET /api/pre-checkins/{ticket_id} fornece o estado persistido para a
recuperação após reconectar. As assinaturas empresariais usam /ws.
