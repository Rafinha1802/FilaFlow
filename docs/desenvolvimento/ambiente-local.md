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

### Validar interfaces de cliente e recepção (checkpoint 5.3)

Use a DEVFrontEnd com as migrações 001 a 005 aplicadas e as contas
fictícias dos checkpoints anteriores ativadas. Inicie a aplicação pelo
inicializador integrado na raiz.

1. Abra /app e entre como cliente@example.invalid. A tela integrada
   apresenta estabelecimentos e suas senhas persistidas.
2. Escolha a Unidade Norte e envie um pré-check-in. Confira a senha
   retornada e o estado Aguardando recepção. O botão fica indisponível
   enquanto houver uma senha aberta para essa conta nessa fila.
3. Abra /empresa/login em outra aba e entre como
   recepcao-norte@example.invalid. Na aba Pré-check-ins, confira a mesma
   senha e o nome do cliente de teste. A lista consulta o servidor a
   cada cinco segundos e permite atualização manual.
4. Selecione a prioridade adequada ao teste e confirme. Confira que a
   senha saiu dos pendentes e apareceu na fila operacional com o mesmo
   número. No app do cliente, espere até cinco segundos ou clique em
   Atualizar. O estado deve mudar para Na fila de espera.
5. Recarregue as duas páginas. Confira a sessão e o estado da senha.
   A sessão do cliente e a sessão empresarial são independentes no
   mesmo navegador.
6. Saia do app do cliente e entre como cliente-2@example.invalid.
   As senhas da outra conta devem ficar fora da lista. O logout do
   cliente deve preservar a sessão empresarial.
7. Durante um envio, simule falha de rede. A tela deve informar o erro.
   Ao tentar novamente, o mesmo identificador de pedido é reutilizado.
   Confira que a senha aparece uma única vez na lista e no DBeaver.
8. Teste uma confirmação com API indisponível. A recepção deve mostrar
   o erro e manter o pedido na lista até uma confirmação bem-sucedida.
   Troque de unidade e confira que aparecem somente os pendentes da
   fila selecionada.
9. Entre como norte@example.invalid no painel. A aba de pré-check-ins
   deve orientar o uso da fila operacional. A API continua exigindo
   recepção ou administrador para confirmar os pedidos.

A rota /app usa a interface de pré-check-in integrada ao backend.
A interface da recepção usa os pedidos pendentes retornados pela API.
O cadastro aberto de cliente e a validação externa de convênio têm
etapas próprias no produto.

### Validar consultório integrado e jornada completa (checkpoint 5.4)

Use a DEVFrontEnd com o backend do 5.2 e as migrações até 005 aplicadas.
Inicie o sistema na raiz. A área profissional usa a autenticação
operacional da API. Recepção e profissional devem usar perfis de navegador
separados ou uma janela privada, pois compartilham a sessão operacional
dentro do mesmo perfil. A sessão de cliente é independente.

1. Em /app, entre como cliente@example.invalid e envie um pré-check-in
   para a Unidade Norte com a recepção e o consultório abertos.
2. No painel empresarial, entre como recepcao-norte@example.invalid
   e confirme o pedido. Confira o mesmo número no cliente e na espera.
3. Em outro perfil de navegador, abra /profissional e entre como
   norte@example.invalid. Confira a fila atribuída da Unidade Norte,
   o nome do cliente e a mesma senha na espera.
4. Chame a próxima senha. Confira o atendimento atual no consultório
   e a mudança para Sua senha foi chamada no cliente.
5. Com outra senha aguardando, tente chamar novamente durante o
   atendimento ativo. Confira o aviso de conclusão obrigatória.
6. Conclua pelo consultório. Confira Atendimento concluído no cliente
   e os horários persistidos no DBeaver. Chame a próxima senha.
7. Recarregue o consultório e o cliente. O estado exibido deve
   corresponder ao banco. Interrompa temporariamente a conexão e
   reconecte. O evento READY provoca uma consulta ao estado atual.
8. Saia no consultório e entre como centro@example.invalid.
   Confira a mensagem de ausência de permissão de atendimento.
   Com multi@example.invalid, confira as filas do Centro e Norte
   e valide a troca de unidade.
9. Repita a jornada com cliente-2@example.invalid e confirme que
   somente suas senhas aparecem no app. O logout do cliente deve
   preservar a sessão operacional e vice-versa.

O consultório integrado apresenta a fila, o atendimento ativo e as ações
confirmadas pelo servidor. A tela do cliente mantém a consulta periódica
e passa a consultar também após os eventos individuais da senha.


### Validar página empresarial e rotas (checkpoint 6.1)

Use a DEVFrontEnd com as migrações e contas fictícias já utilizadas na
etapa 5. Inicie o sistema pelo inicializador habitual, na raiz:

```powershell
.\iniciar_tudo.bat
```

Este checkpoint reorganiza o frontend e utiliza o contrato de backend
já validado. Não exige nova migração nem recriação do banco.

1. Encerre a sessão empresarial e abra diretamente
   http://localhost:5174/empresa/dashboard. Confira a validação inicial
   e o formulário de login. Acesso direto a /empresa/recepcao também
   deve pedir uma sessão válida. Entre com a conta multivínculo.
2. Selecione a Unidade Norte. Confira o papel profissional e a ausência
   do botão de emissão manual. Navegue por Pré-check-ins, Operação e
   Perfil. A seleção deve continuar no Norte durante a navegação interna.
   Na recepção, a conta sem permissão de confirmação deve receber a
   orientação já existente.
3. Volte ao Centro com a conta multivínculo e emita senhas fictícias
   comum e prioritária. Confira o retorno do servidor, a ordem de espera
   e a presença das senhas na consulta persistida.
4. Chame e conclua um atendimento. Com outra senha aguardando, tente
   chamar antes de concluir o atendimento ativo. Confira o aviso de
   conflito e que a senha ativa foi preservada. Conclua e chame a seguinte.
5. Navegue por Operação, Pré-check-ins, Métricas, Totem, Equipe e Perfil.
   Confira a URL de cada aba. Use Voltar e Avançar do navegador e
   confira a correspondência entre URL e aba. Recarregue uma URL interna
   e abra /empresa/recepcao diretamente. A fila exibida deve pertencer
   às filas autorizadas; após recarga, a seleção pode voltar à primeira.
6. Saia do painel e confira que o acesso direto a uma aba pede login.
   Entre com uma conta de recepção e depois com uma profissional.
   Confira a visibilidade das ações conforme o papel da unidade.
7. Repita uma jornada curta em sessões separadas: pré-check-in em /app,
   confirmação em /empresa/recepcao, chamada e conclusão em /profissional.
   Confira o mesmo número e as mudanças de estado no cliente.
8. Durante uma consulta, interrompa e restabeleça a conexão. Confira a
   recuperação da fila. Navegue para fora do painel e retorne; a tela
   deve consultar o estado atual. Confira também a landing page e o
   acesso ao login pelos atalhos anteriores.

Os testes automatizados deste recorte são executados na raiz:

```powershell
node --test tests/auth-api.test.js tests/precheckin-api.test.js tests/router.test.js tests/company-page.test.js
npm run build
```

O teste de navegação exercita o adaptador da History API com um navegador
simulado. O teste de composição renderiza a página sem efeitos de
navegador. O roteiro acima valida os efeitos, as interações e a jornada
com o backend real. O commit depende do aceite manual do responsável.


### Validar páginas e componentes da jornada (checkpoint 6.2)

Use a DEVFrontEnd com o backend compatível da etapa 5 e as mesmas
migrações, contas fictícias e banco local usados no 6.1. A reorganização
não exige reinstalação das dependências nem nova migração. Se o Vite
estiver aberto durante as movimentações, reinicie o frontend para uma
validação a partir de uma montagem completa.

```powershell
.\iniciar_tudo.bat
```

1. Abra a landing page em http://localhost:5174/. Confira a marca,
   navegação, preview do celular e os modais de busca e QR Code.
   Navegue até os planos e abra o checkout com um plano selecionado.
   Confira o plano, a marca e a volta ao site. Use somente dados fictícios
   no checkout, que conserva sua experiência demonstrativa anterior.
2. Abra /app diretamente e entre com cliente@example.invalid. Confira
   a consulta de estabelecimentos e envie um pré-check-in para o Norte.
   Anote o número retornado e confira Aguardando recepção.
3. Em /empresa/recepcao, entre como recepcao-norte@example.invalid.
   Confira a mesma senha pendente, ajuste a prioridade para o cenário
   escolhido e confirme a entrada. Confira o mesmo número na espera e
   Na fila de espera no cliente.
4. Em outro perfil de navegador, abra /profissional e entre como
   norte@example.invalid. Chame a senha após encerrar eventual atendimento
   ativo anterior. Confira o mesmo número e Sua senha foi chamada no
   cliente. Conclua e confira Atendimento concluído e os horários no
   cliente e no DBeaver.
5. Com outro cliente fictício aguardando, tente chamar durante atendimento
   ativo. Confira o aviso e a preservação do atendimento. Em seguida,
   conclua e chame a próxima senha. Confira prioridade e ordem de chegada.
6. Entre como multi@example.invalid no painel e alterne Centro e Norte.
   Confira as filas permitidas, os papéis e a visibilidade das ações.
   Navegue pelas abas, use Voltar e Avançar e recarregue uma URL interna.
   Confira a mesma correspondência entre URL, página e unidade autorizada.
7. Recarregue cliente, recepção e consultório em suas sessões. Confira
   a recuperação do estado persistido. Interrompa temporariamente a
   conexão do frontend e restabeleça; acompanhe uma alteração de estado
   para confirmar a recuperação após reconexão.
8. Saia do cliente e entre como cliente-2@example.invalid. Confira que
   a lista apresenta somente suas senhas e que a sessão operacional
   permanece disponível. Saia do portal operacional e confira que a
   sessão do cliente continua válida. Acesso direto ao painel sem sessão
   deve apresentar o login.
9. Teste emissão manual com a recepção, chamada e conclusão com o
   profissional e bloqueio de ações incompatíveis com cada papel.
   Simule uma falha de envio ou confirmação e confira o aviso, a
   possibilidade de recuperar o estado e a ausência de duplicidade.

Os testes automatizados são executados na raiz:

```powershell
node --test tests/auth-api.test.js tests/precheckin-api.test.js tests/router.test.js tests/company-page.test.js
npm run build
```

Os testes de composição renderizam as páginas sem executar efeitos de
navegador. Os testes de serviço cobrem os contratos e a reconexão das
assinaturas; o roteiro manual verifica essas interações com a API e o banco.

Após o aceite manual e o commit, integrar as branches de desenvolvimento
na Homolog conforme o fluxo de revisão acordado. Repetir os pontos 2 a 9
no ambiente de homologação, com banco e dados fictícios próprios.
Registrar esse resultado antes de propor o PR de Homolog para main.
