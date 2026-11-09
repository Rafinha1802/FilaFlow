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
