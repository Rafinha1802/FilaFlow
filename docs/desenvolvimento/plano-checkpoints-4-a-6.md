# Plano de implementação dos checkpoints 4 a 6

Base do planejamento: main, DEVBackEnd, DEVFrontEnd e Homolog em 593bc3d.

## 4. Identidade e permissões por unidade

| Entrega | Branch | Teste automatizado | Aceite manual |
| --- | --- | --- | --- |
| 4.1 · Unidades, contas e vínculos por papel | DEVBackEnd | Aplicar a migração em banco vazio e sobre dados do checkpoint 3. Preservar senhas existentes. | Conferir duas unidades e vínculos fictícios no DBeaver. |
| 4.2 · Autorização HTTP e WebSocket | DEVBackEnd | Cobrir acesso permitido, acesso cruzado negado, papel diferente por unidade e revogação em conexão ativa. | Usar duas contas de unidades distintas e uma conta com múltiplos vínculos. |
| 4.3 · Seleção da unidade operacional | DEVFrontEnd | Cobrir sessão com um ou mais vínculos, troca de unidade, logout e respostas tardias da unidade anterior. | Conferir em duas sessões que cada conta só acessa suas filas. Trocar a unidade com a conta multivínculo. |

A API é a autoridade sobre o papel na unidade. A recepção confirma e emite.
O profissional chama e conclui nas filas autorizadas. O administrador reúne
essas permissões no escopo da unidade.

## 5. Jornada compartilhada da senha

| Entrega | Branch | Teste automatizado | Aceite manual |
| --- | --- | --- | --- |
| 5.1 · Pré-check-in e confirmação persistidos | DEVBackEnd | Testar repetição do pedido, confirmação concorrente e transições inválidas. | Acompanhar a mesma senha antes e depois da confirmação da recepção. |
| 5.2 · Operação do profissional e acompanhamento do cliente | DEVBackEnd | Testar escopo da fila, titularidade da senha, conclusão e recuperação após reconexão. | Executar a jornada com contas fictícias separadas e conferir estados e horários. |
| 5.3 · Interfaces do cliente e da recepção | DEVFrontEnd | Testar envio, confirmação, falha de rede e repetição sem duplicidade. | Fazer pré-check-in em um navegador e confirmar em outro. |
| 5.4 · Consultório integrado | DEVFrontEnd | Testar chamada, conclusão, atualização do cliente e reconexão. | Repetir a jornada dos três papéis em sessões separadas na Homolog. |

O cliente usará uma conta fictícia pré-criada. A senha passa de pré-check-in
pendente para espera após confirmação, depois para atendimento ativo e
conclusão. A emissão manual entra diretamente na espera.

## 6. Páginas, rotas e componentes

Adotar rotas explícitas para páginas navegáveis. Preservar as URLs atuais,
acesso direto, recarga, histórico do navegador e atalhos documentados. Usar
layouts por área para telas com navegação comum. Manter estados internos,
como modais ou etapas de formulário, no componente responsável quando não
precisarem de URL própria. O frontend pode redirecionar uma sessão sem acesso.
A autorização permanece na API.

A estrutura abaixo usa nomes de pastas minúsculos e agrupa páginas pelo público.
Os arquivos são exemplos de destino, a introduzir durante a extração.

```text
src/
  assets/
  pages/
    publico/
      landing/LandingPage.jsx
      checkout/CheckoutPage.jsx
    cliente/
      app/ClientAppPage.jsx
    empresa/
      login/CompanyLoginPage.jsx
      painel/CompanyDashboardPage.jsx
      recepcao/ReceptionPage.jsx
    profissional/
      login/ProfessionalLoginPage.jsx
      consultorio/ProfessionalWorkspacePage.jsx
  components/
    compartilhados/
      BrandLogo.jsx
    exclusivos/
      publico/
        landing/
        checkout/
      cliente/
        app/
      empresa/
        login/
        painel/
        recepcao/
      profissional/
        login/
        consultorio/
  contexts/                   # Estado que precisa atravessar páginas
  hooks/                      # Lógica reutilizada, como sessão ou fila
  router/                     # Mapa de rotas, layouts e redirecionamentos
  services/                   # HTTP e WebSocket
  App.jsx
  index.css
  main.jsx
```

Páginas são entradas de rota e compõem a interface. Componentes exclusivos
pertencem à página que os utiliza. Quando duas páginas da mesma área
compartilharem um componente, ele pode ficar no nível dessa área.
O diretório compartilhados é para componentes usados por áreas distintas.
Contexts fica reservado ao estado que precisa sobreviver à navegação ou ser
consumido por várias páginas. Pastas serão criadas à medida que forem usadas.

| Entrega | Branch | Teste automatizado | Aceite manual |
| --- | --- | --- | --- |
| 6.1 · Rotas e extração do painel | DEVFrontEnd | Build, URLs diretas, recarga, histórico e proteção de páginas. | Repetir login, troca de unidade, emissão, chamada e conclusão. |
| 6.2 · Extração das páginas da jornada | DEVFrontEnd | Regressão de cliente, recepção e profissional, incluindo reconexão. | Repetir a jornada completa em três sessões na Homolog. |

Começar pelo roteador existente, que já trata navegação e histórico. Avaliar
uma biblioteca de roteamento apenas se layouts aninhados, composição de rotas
ou testes ficarem difíceis de manter após o primeiro recorte.

## Integração e aceite

Preparar o diff em sua branch de responsabilidade. Executar os testes
automatizados e entregar um roteiro manual. Após o aceite do responsável,
registrar o resultado e criar o commit. Integrar por PR à Homolog com o
contrato de backend compatível antes de ativar as telas. Se os dois lados
precisarem mudar juntos, validar a combinação antes da promoção. Depois
do teste integrado com banco e dados fictícios próprios, abrir PR de
Homolog para main e sincronizar as branches de desenvolvimento.
