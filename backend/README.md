# Backend FilaFlow — etapas 1 a 5

API mínima em Python com FastAPI, independente do frontend React.
Disponibiliza `GET /api/health`, que responde com HTTP 200 e `{"status": "ok"}`,
e `GET /api/queues`, que lista uma fila demonstrativa em memória.
Também oferece `POST /api/auth/login` e `GET /api/auth/me` para autenticação
de desenvolvimento. Nenhum desses endpoints acessa banco de dados.

## Arquivos e responsabilidades

- `app/__init__.py`: identifica o pacote Python da aplicação.
- `app/main.py`: cria a aplicação e define o endpoint de saúde.
- `app/api/queues.py`: recebe a requisição HTTP de listagem e chama o serviço.
- `app/schemas/queues.py`: define os campos e tipos da resposta, sem criar tabelas.
- `app/services/queues.py`: fornece o resumo demonstrativo da Clínica Vida.
- `app/api/auth.py`: recebe o login JSON e protege a consulta do usuário atual.
- `app/schemas/auth.py`: define os dados de entrada e as respostas de autenticação.
- `app/services/auth.py`: verifica a senha, assina tokens e valida seu uso.
- `app/core/config.py`: lê as configurações opcionais de banco e autenticação.
- `.env.example`: documenta as variáveis previstas, sem credenciais.
- `tests/test_health.py`: verifica o código HTTP e o JSON da resposta.
- `tests/test_config.py`: verifica a leitura das configurações do ambiente.
- `tests/test_queues.py`: verifica a listagem pública com e sem configuração de banco.
- `tests/test_auth.py`: verifica login, acesso protegido e rejeição de tokens inválidos.
- `requirements.txt`: lista as dependências da aplicação e do teste.
- `.gitignore`: impede o versionamento do ambiente virtual, caches e arquivos `.env`.

## Dependências

- **FastAPI**: define a API em `app/main.py` e gera sua documentação interativa.
- **Uvicorn**: servidor que executa a aplicação e recebe as requisições HTTP.
- **Pydantic**: define e valida o formato da resposta em `app/schemas/queues.py`.
  Já era instalado pelo FastAPI; agora está declarado como dependência direta.
- **pytest**: executa os testes da pasta `tests/`.
- **HTTPX**: utilizado pelo `TestClient` do FastAPI para testar requisições sem iniciar um servidor externo.
- **PyJWT**: assina e valida tokens JWT em `app/services/auth.py`.
- **pwdlib[argon2]**: calcula e verifica hashes Argon2 de senhas; usado no serviço
  de autenticação e no comando de configuração abaixo. O extra `argon2` instala
  a implementação do algoritmo, evitando implementar criptografia manualmente.

## Preparar o ambiente no Windows (PowerShell)

Validado com Python 3.14.2. As versões das dependências diretas estão fixadas
em `requirements.txt` para registrar as versões usadas nesta etapa.

Com Python instalado, execute a partir da raiz do projeto:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

O ambiente virtual mantém as dependências Python isoladas deste projeto.
Os comandos usam seu executável diretamente, sem precisar ativar o ambiente
ou modificar a política de execução do PowerShell.

## Executar

Dentro de `backend/`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Em `app.main:app`, `app.main` indica o arquivo `app/main.py`, e o último
`app` é o objeto FastAPI definido nele. `--reload` reinicia o servidor
quando o código muda durante o desenvolvimento. Use `Ctrl+C` para parar.

- Saúde: http://127.0.0.1:8000/api/health
- Filas: http://127.0.0.1:8000/api/queues
- Documentação interativa: http://127.0.0.1:8000/docs

Para conferir a resposta em outro terminal PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

O resultado deve apresentar `status` com valor `ok`.

## Listagem demonstrativa de filas

`GET /api/queues` é público e retorna HTTP 200 com um array JSON:

```json
[
  {
    "id": "clinica-vida",
    "companyName": "Clínica Vida",
    "unitName": "Unidade Centro",
    "attendantName": "Dr. Carlos Mendes",
    "room": "Consultório 04",
    "serviceName": "Consulta Oftalmologia Geral"
  }
]
```

O fluxo é: `main.py` registra a rota de `api/queues.py`, que chama
`services/queues.py`. O schema `QueueSummary` descreve a resposta e é usado
pelo FastAPI para validá-la e documentá-la em `/docs`.

Os dados estão definidos no código Python e são recriados a cada consulta.
Não há cadastro, alteração ou persistência de filas nesta etapa.
O backend não importa arquivos React nem depende do frontend para iniciar.

Para consultar em PowerShell com o servidor iniciado:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/queues | ConvertTo-Json -Depth 5
```

Para conferir a integração manualmente, mantenha o backend na porta 8000 e
execute `npm run dev` em outro terminal na raiz do projeto (após `npm ci`,
caso as dependências do frontend ainda não estejam instaladas).
Abra http://localhost:5174/empresa/dashboard e confira, na aba Network das
ferramentas do navegador, a resposta 200 de `/api/queues` e seu array JSON.
Faça login com o usuário de desenvolvimento configurado abaixo. Após entrar,
o painel deve manter Clínica Vida, Dr. Carlos Mendes e Consultório 04.

A chamada existente do React já aceita esses campos. A resposta não inclui
`aheadList`: a lista local de pacientes permanece intacta. As filas do aplicativo
cliente também continuam locais. Isso limita a integração desta etapa aos
dados de identificação da fila; operações de senhas ficam para etapas futuras.
O login empresarial agora exige as credenciais configuradas no backend.
Não há login automático com credenciais fixas. WebSocket ainda não foi
implementado, portanto suas tentativas de conexão podem gerar avisos no console.

## Configuração por variáveis de ambiente

`DATABASE_URL` será a URL de conexão PostgreSQL. Ela é opcional nesta etapa:
ausente, vazia ou contendo apenas espaços, `get_database_url()` retorna `None`.
Quando preenchida, a função retorna o texto sem espaços nas extremidades.
Ela apenas lê o valor; não valida a URL nem tenta abrir uma conexão.

O módulo `os`, da biblioteca padrão do Python, permite ler as variáveis do
processo. Não foi necessário instalar uma biblioteca de configuração.
No futuro, o código de conexão importará `get_database_url` de `app.core.config`.
O endpoint de saúde continua independente dessa configuração.

O arquivo `.env.example` é uma referência. Nem ele nem um arquivo `.env` são
carregados automaticamente nesta etapa. Copiá-lo para `.env` não configura o
processo. Quando você receber a URL real, defina-a no mesmo terminal PowerShell
em que iniciará o servidor:

```powershell
$env:DATABASE_URL = Read-Host 'Informe a URL PostgreSQL recebida'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Não é necessário executar esse passo agora. Para executar sem configuração
de banco, em um terminal que já tenha a variável definida:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
```

Esse comando remove somente a variável da sessão atual, não arquivos ou dados.
Não coloque credenciais reais no código nem em `.env.example`.

## Autenticação de desenvolvimento

Esta etapa permite um único usuário empresarial, configurado por ambiente.
Não cria usuários no banco nem oferece cadastro. O login recebe JSON
com `email` e `password`, compatível com o serviço HTTP existente do React.

| Variável | Uso |
| --- | --- |
| `DEMO_USER_EMAIL` | E-mail escolhido para o usuário de desenvolvimento. |
| `DEMO_PASSWORD_HASH` | Hash Argon2 da senha escolhida; não é a senha em texto. |
| `JWT_SECRET_KEY` | Chave aleatória para assinatura, com pelo menos 32 bytes. |

Nenhum valor é preenchido automaticamente. Configuração ausente ou incompleta
faz o login responder `503`, enquanto saúde e filas continuam disponíveis.
O hash não reconhecido também gera `503`. E-mail é comparado sem distinguir
maiúsculas e minúsculas e sem espaços nas extremidades; a senha é preservada.

Atualize as dependências, dentro de `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

No mesmo terminal em que iniciará o servidor, configure seu usuário. O comando
da senha solicita a digitação sem mostrá-la e guarda somente o hash no ambiente:

```powershell
$env:DEMO_USER_EMAIL = Read-Host 'E-mail de desenvolvimento'
$env:DEMO_PASSWORD_HASH = .\.venv\Scripts\python.exe -c "from getpass import getpass; from pwdlib import PasswordHash; print(PasswordHash.recommended().hash(getpass('Senha de desenvolvimento: ')))"
$env:JWT_SECRET_KEY = .\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

As variáveis valem somente para essa sessão e os processos iniciados nela.
Não há carregamento automático de `.env`. Reinicie o servidor após alterar
as variáveis; gerar outra chave invalida os tokens assinados com a anterior.

Para testar em outro terminal PowerShell, informe o mesmo e-mail e senha:

```powershell
$authCredential = Get-Credential -Message 'Credenciais configuradas no backend'
$loginBody = @{
    email = $authCredential.UserName
    password = $authCredential.GetNetworkCredential().Password
} | ConvertTo-Json
$loginResult = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/auth/login -ContentType 'application/json' -Body $loginBody
Invoke-RestMethod -Uri http://127.0.0.1:8000/api/auth/me -Headers @{ Authorization = "Bearer $($loginResult.access_token)" }
```

O login retorna `access_token`, `token_type: "bearer"` e `user`, contendo
`id: "demo-company"`, seu e-mail e `role: "company"`. A consulta `/me` retorna
esse mesmo usuário. As respostas não contêm senha, hash ou chave secreta.

O JWT dura 30 minutos. O servidor exige assinatura HS256 válida, emissor
`filaflow-dev`, identificação do usuário configurado e os campos de emissão
e expiração. JWT é assinado, não criptografado: seu conteúdo pode ser lido.
Não contém dados secretos. Sem token, com credenciais incorretas ou com token
inválido/expirado, a resposta é `401`. Corpo de login inválido retorna `422`.
Um token enviado quando falta configuração de autenticação recebe `503`.

Em `/docs`, execute o login, copie o `access_token` para **Authorize**
e teste `/api/auth/me`. O botão usa Bearer; não faz login automaticamente.

A função `get_current_user` é uma dependência FastAPI: ela verifica o token
antes de executar `/me`. Outras rotas poderão usá-la em etapas futuras.
`/api/queues` continua público. Não há refresh token, logout no servidor ou
revogação individual; um token emitido permanece válido até expirar, salvo
troca da chave ou do e-mail configurado. A autenticação é destinada ao
desenvolvimento local. O painel empresarial exige login; os acessos de cliente
e profissional continuam demonstrativos.

## Integração do login empresarial (etapa 5)

O formulário existente em `src/components/Company/CompanyLogin.jsx` envia
as credenciais usando `src/services/api.js`. Só uma resposta válida do servidor
libera o painel em `src/App.jsx`. Não há senha padrão nem atalho de demonstração
que contorne o login. Cadastro empresarial e recuperação de senha continuam
indisponíveis; os botões informam essa limitação.

O token e o usuário são armazenados nas chaves existentes `filaflow_token` e
`filaflow_user` do `localStorage`. A senha não é armazenada. Ao acessar a rota
empresarial ou recarregar a página, o frontend consulta `/api/auth/me` antes de
exibir o painel, sem confiar apenas no usuário salvo no navegador.
Se a validação falhar, o formulário reaparece. Uma resposta `401` limpa a sessão
sem tentar autenticar novamente com credenciais de demonstração.

O botão Sair remove a sessão empresarial do navegador. As outras abas recebem
a atualização de armazenamento e também perdem acesso. Isso não revoga o JWT
no servidor: uma cópia do token continua sujeita à validade descrita acima.
O login simulado do cliente deixou de chamar o endpoint empresarial, para não
sobrescrever sua sessão. Os estilos e os demais fluxos demonstrativos foram mantidos.

Para conferir manualmente:

1. Configure o usuário e inicie o backend na porta 8000 conforme as instruções acima.
2. Na raiz do projeto, execute `npm ci` se necessário e depois `npm run dev`.
3. Abra http://localhost:5174/empresa/dashboard. Sem sessão válida, o formulário deve aparecer.
4. Tente uma senha incorreta: deve aparecer uma mensagem de erro, sem abrir o painel.
5. Informe as credenciais configuradas: o painel deve abrir. Recarregue para conferir a restauração via `/api/auth/me`.
6. Abra o painel em outra aba e clique em Sair na primeira. Ambas devem perder o acesso empresarial.
7. Pare o backend e tente entrar: deve aparecer uma mensagem de conexão, sem sucesso simulado.

O backend continua sendo responsável por validar tokens nas rotas protegidas.
A restrição de navegação React não substitui essa validação. Operações de senhas
ainda usam as simulações existentes e serão integradas nas próximas etapas.

## Testar

Dentro de `backend/`, sem precisar iniciar o servidor:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Resultado esperado: `28 passed` (saúde, configuração, filas e autenticação).
Os testes isolam as variáveis
com `monkeypatch`, sem alterar permanentemente o ambiente e sem acessar banco.

Na combinação de versões validada, o Starlette (dependência do FastAPI)
emite um aviso de descontinuação do uso de HTTPX no cliente de testes.
O teste continua funcionando; o aviso não foi ocultado.

Para testar o serviço HTTP e o gerenciamento de sessão, execute na raiz do projeto
(validado com Node.js 24.13.0):

```powershell
node --test tests/auth-api.test.js
npm run build
```

Resultado esperado: 15 testes JavaScript aprovados e compilação concluída.
Os testes usam `node:test`, integrado ao Node, com respostas HTTP simuladas.
Cobrem login, erros, restauração, logout e respostas atrasadas, sem credenciais reais.
Na validação desta etapa também foi usado Edge com Playwright temporário para
exercitar o fluxo completo com o backend local. Playwright não foi adicionado
ao `package.json` ou ao `package-lock.json`.

## Limites desta etapa

Não há persistência, operações de senhas ou WebSocket implementados.
Autenticação está disponível apenas para o usuário de desenvolvimento configurado.
A listagem de filas é apenas demonstrativa e não exige autenticação.
A leitura de `DATABASE_URL` está preparada. A conexão PostgreSQL, seu driver
e os modelos de persistência ficam para uma etapa posterior;
nenhuma credencial ou conexão de banco é necessária agora.

O login empresarial está integrado. Os demais fluxos do frontend continuam
demonstrativos; chamadas a endpoints ainda não implementados não são atendidas
por esta API.
O proxy Vite existente já direciona `/api` para a porta 8000 no desenvolvimento.
Execute o backend com o comando acima: `iniciar_tudo.bat` ainda não procura
a pasta `backend/`.

## Referências

- [Testes com FastAPI, pytest e HTTPX](https://fastapi.tiangolo.com/tutorial/testing/)
- [Execução com Uvicorn](https://fastapi.tiangolo.com/deployment/manually/)
- [Modelos de resposta](https://fastapi.tiangolo.com/tutorial/response-model/)
- [Organização de rotas com APIRouter](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Hashes de senha e JWT com pwdlib e PyJWT](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [Executor de testes do Node.js](https://nodejs.org/api/test.html)
- [Validação com navegadores no Playwright](https://playwright.dev/docs/browsers)
