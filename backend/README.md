# Backend FilaFlow — etapas 1 a 3

API mínima em Python com FastAPI, independente do frontend React.
Disponibiliza `GET /api/health`, que responde com HTTP 200 e `{"status": "ok"}`,
e `GET /api/queues`, que lista uma fila demonstrativa em memória.
Nenhum desses endpoints acessa banco de dados.

## Arquivos e responsabilidades

- `app/__init__.py`: identifica o pacote Python da aplicação.
- `app/main.py`: cria a aplicação e define o endpoint de saúde.
- `app/api/queues.py`: recebe a requisição HTTP de listagem e chama o serviço.
- `app/schemas/queues.py`: define os campos e tipos da resposta, sem criar tabelas.
- `app/services/queues.py`: fornece o resumo demonstrativo da Clínica Vida.
- `app/core/config.py`: lê a configuração opcional da futura conexão PostgreSQL.
- `.env.example`: documenta as variáveis previstas, sem credenciais.
- `tests/test_health.py`: verifica o código HTTP e o JSON da resposta.
- `tests/test_config.py`: verifica a leitura das configurações do ambiente.
- `tests/test_queues.py`: verifica a listagem pública com e sem configuração de banco.
- `requirements.txt`: lista as dependências da aplicação e do teste.
- `.gitignore`: impede o versionamento do ambiente virtual, caches e arquivos `.env`.

## Dependências

- **FastAPI**: define a API em `app/main.py` e gera sua documentação interativa.
- **Uvicorn**: servidor que executa a aplicação e recebe as requisições HTTP.
- **Pydantic**: define e valida o formato da resposta em `app/schemas/queues.py`.
  Já era instalado pelo FastAPI; agora está declarado como dependência direta.
- **pytest**: executa os testes da pasta `tests/`.
- **HTTPX**: utilizado pelo `TestClient` do FastAPI para testar requisições sem iniciar um servidor externo.

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
O painel deve manter Clínica Vida, Dr. Carlos Mendes e Consultório 04.

A chamada existente do React já aceita esses campos. A resposta não inclui
`aheadList`: a lista local de pacientes permanece intacta. As filas do aplicativo
cliente também continuam locais. Isso limita a integração desta etapa aos
dados de identificação da fila; operações de senhas ficam para etapas futuras.
Chamadas a login e WebSocket ainda podem falhar porque não foram implementadas.

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

## Testar

Dentro de `backend/`, sem precisar iniciar o servidor:

```powershell
.\.venv\Scripts\python.exe -m pytest tests -q
```

Resultado esperado: `7 passed` (saúde, configuração e listagem de filas).
Os testes de configuração e listagem isolam as variáveis
com `monkeypatch`, sem alterar permanentemente o ambiente e sem acessar banco.

Na combinação de versões validada, o Starlette (dependência do FastAPI)
emite um aviso de descontinuação do uso de HTTPX no cliente de testes.
O teste continua funcionando; o aviso não foi ocultado.

## Limites desta etapa

Não há persistência, autenticação, operações de senhas ou WebSocket implementados.
A listagem de filas é apenas demonstrativa e não exige autenticação.
A leitura de `DATABASE_URL` está preparada. A conexão PostgreSQL, seu driver
e os modelos de persistência ficam para uma etapa posterior;
nenhuma credencial ou conexão é necessária agora.

O frontend permanece com seu comportamento atual de demonstração. Suas chamadas
aos endpoints ainda não implementados não são atendidas por esta API.
O proxy Vite existente já direciona `/api` para a porta 8000 no desenvolvimento.
Execute o backend com o comando acima: `iniciar_tudo.bat` ainda não procura
a pasta `backend/`.

## Referências

- [Testes com FastAPI, pytest e HTTPX](https://fastapi.tiangolo.com/tutorial/testing/)
- [Execução com Uvicorn](https://fastapi.tiangolo.com/deployment/manually/)
- [Modelos de resposta](https://fastapi.tiangolo.com/tutorial/response-model/)
- [Organização de rotas com APIRouter](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
