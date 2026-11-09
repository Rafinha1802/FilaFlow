# Jornadas e integrações

| Área | Estado atual |
| --- | --- |
| Empresa | Login explícito validado pela API. Emissão, consulta e chamada de senha confirmadas pelo servidor. |
| Telão e painel | Atualização da fila via WebSocket na sessão empresarial. Apresentação e áudio no navegador. |
| Recepção | A interface demonstra triagem e autorização. A jornada de triagem ainda não cria uma senha oficial. |
| Cliente | Perfil, QR, pré-check-in e avisos de demonstração. A chamada oficial ainda não chega ao cliente. |
| Profissional | Consultório, configuração e cronômetro com dados locais. |
| Checkout | Seleção de plano e confirmação simuladas. Cadastro empresarial real e cobrança estão pendentes. |
| Atrasos e IA | Estimativas locais de demonstração. Falta medir os tempos do atendimento real. |

A operação oficial exige o FastAPI ativo. Com PostgreSQL configurado, a fila preserva o estado ao reiniciar. O registro de ausência ainda precisa de integração.
