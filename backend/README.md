# Backend FilaFlow — etapa 1

API mínima em Python com FastAPI, independente do frontend React.
Esta etapa disponibiliza somente `GET /api/health`, que responde com HTTP 200
e `{"status": "ok"}`. Esse endpoint confirma que a API está respondendo;
ele não verifica banco de dados.

## Arquivos e responsabilidades

- `app/__init__.py`: identifica o pacote Python da aplicação.
- `app/main.py`: cria a aplicação e define o endpoint de saúde.
- `tests/test_health.py`: verifica o código HTTP e o JSON da resposta.
- `requirements.txt`: lista as dependências da aplicação e do teste.
- `.gitignore`: impede o versionamento do ambiente virtual, caches e arquivos `.env`.

## Dependências

- **FastAPI**: define a API em `app/main.py` e gera sua documentação interativa.
- **Uvicorn**: servidor que executa a aplicação e recebe as requisições HTTP.
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
- Documentação interativa: http://127.0.0.1:8000/docs

Para conferir a resposta em outro terminal PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

O resultado deve apresentar `status` com valor `ok`.

## Testar

Dentro de `backend/`, sem precisar iniciar o servidor:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Resultado esperado: `1 passed`.

Na combinação de versões validada, o Starlette (dependência do FastAPI)
emite um aviso de descontinuação do uso de HTTPX no cliente de testes.
O teste continua funcionando; o aviso não foi ocultado.

## Limites desta etapa

Não há persistência, autenticação, filas ou WebSocket implementados.
PostgreSQL e variáveis de ambiente serão preparados em uma etapa posterior;
nenhuma credencial ou conexão é necessária agora.

O frontend permanece com seu comportamento atual de demonstração. Suas chamadas
aos endpoints ainda não implementados não são atendidas por esta API.
O proxy Vite existente já direciona `/api` para a porta 8000 no desenvolvimento.
Execute o backend com o comando acima: `iniciar_tudo.bat` ainda não procura
a pasta `backend/`.

## Referências

- [Testes com FastAPI, pytest e HTTPX](https://fastapi.tiangolo.com/tutorial/testing/)
- [Execução com Uvicorn](https://fastapi.tiangolo.com/deployment/manually/)
