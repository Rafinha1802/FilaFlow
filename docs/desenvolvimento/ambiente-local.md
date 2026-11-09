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
