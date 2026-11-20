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
