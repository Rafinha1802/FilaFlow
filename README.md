<p align="center">
  <img src="public/temfyla-logo.png" alt="TemFyla" width="240">
</p>

# 🚀 TemFyla · Gestão de filas e atendimento

**Uma experiência para quem espera e para quem atende.** O TemFyla reúne o app web do cliente, o painel da empresa e o consultório digital num monorepo React/Vite + FastAPI.

[Visão do produto](docs/produto/visao-e-modelo-de-negocio.md) · [Jornadas](docs/produto/jornadas-e-status.md) · [Ambiente local](docs/desenvolvimento/ambiente-local.md) · [Documentação](docs/README.md)

## ✨ Explore o ecossistema

| Área | O que você encontra | Estado atual |
| --- | --- | --- |
| Site · `/` | Segmentos, simulador, celular interativo e planos | Apresentação do produto |
| Cliente · `/app` | Explorar, QR, pré-check-in, múltiplas filas e notificações | Demonstração local |
| Empresa · `/empresa/login` | Login explícito, emissão comum ou prioritária, consulta e chamada | Operação integrada ao FastAPI |
| Painel · `/empresa/dashboard` | Operação, totem, equipe, perfil e métricas | Fila empresarial integrada; recursos auxiliares incluem demonstrações |
| Recepção · `/empresa/recepcao` | Triagem e autorização de convênio | Demonstração sem confirmação no servidor |
| Profissional · `/profissional` | Consultório, cronômetro, perfil e configuração de turnos | Demonstração local |
| Checkout · `/checkout` | Starter, Profissional e Enterprise, mensal ou anual, com PIX, cartão e boleto | Simulação de contratação; use dados fictícios |

## ⚡ Da emissão à chamada

O FastAPI valida a sessão empresarial e confirma as operações de fila. O painel consulta a fila após receber eventos por WebSocket. As senhas ficam em memória nesta versão. Cliente e profissional ainda não acompanham a mesma senha do painel. Cadastro empresarial, cobrança e previsão de espera são capacidades planejadas.

## 🛠️ Rode o projeto

Na raiz, instale as dependências com `npm ci`. Para explorar apenas a interface, use `npm run dev`. Para testar a fila empresarial, configure o Python e a conta fictícia seguindo o [guia Windows](docs/desenvolvimento/ambiente-local.md) e execute `.iniciar_tudo.bat`. O frontend abre em `http://localhost:5174/`. Use `npm run build` para gerar `dist/`.

O [README do backend](backend/README.md) apresenta a API e os contratos implementados. O [guia do desenvolvedor](docs/desenvolvimento/README.md) explica como atualizar as docs.

## 💳 Planos apresentados na interface

| Plano | Mensal | Equivalente mensal no anual | Público proposto |
| --- | ---: | ---: | --- |
| Starter | R$ 89 | R$ 69 | Consultórios e autônomos |
| Profissional | R$ 189 | R$ 149 | Clínicas e equipes |
| Enterprise | R$ 499 | R$ 399 | Redes e operações multiunidade |

Os valores descrevem a demonstração comercial. Veja a [visão de produto](docs/produto/visao-e-modelo-de-negocio.md) para o escopo de validação.
