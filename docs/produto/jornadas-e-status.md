# Jornadas e integrações

| Área | Estado atual |
| --- | --- |
| Empresa | Login explícito validado pela API. Emissão, consulta e chamada de senha confirmadas pelo servidor. |
| Telão e painel | Atualização da fila via WebSocket na sessão empresarial. Apresentação e áudio no navegador. |
| Recepção | Lista os pré-check-ins pendentes da fila selecionada e confirma a mesma senha, com prioridade definida pelo operador. |
| Cliente | A rota /app autentica a conta persistida, envia pré-check-ins e acompanha confirmação, chamada e conclusão por consulta e eventos individuais. |
| Profissional | A rota /profissional autentica a conta operacional e permite consultar, chamar e concluir senhas nas filas autorizadas. |
| Checkout | Seleção de plano e confirmação simuladas. Cadastro empresarial real e cobrança estão pendentes. |
| Atrasos e IA | Estimativas locais de demonstração. Falta medir os tempos do atendimento real. |

A operação oficial exige o FastAPI ativo. Com PostgreSQL configurado, a fila preserva o estado ao reiniciar. O registro de ausência ainda precisa de integração.
