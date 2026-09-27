# Architecture Decision Record

## ADR-001: Implementação de Renovação Silenciosa de Sessão com Rotação de Refresh Token e Configuração por Variáveis de Ambiente

### Contexto
O usuário experimentava deslogamentos indesejados após 30 minutos, mesmo ao marcar a opção "Manter-me logado" na tela de login. O diagnóstico revelou que o backend gerava o `refresh_token` (com validade de até 7 dias hardcoded), mas não disponibilizava nenhum endpoint para utilizá-lo. Concomitantemente, o interceptor do frontend deslogava o usuário imediatamente ao receber o status HTTP 401 provocado pela expiração natural do `access_token` de 30 minutos.
Adicionalmente, os tempos de expiração e segredos encontravam-se fixos em código, sem possibilidade de ajuste dinâmico em ambientes de staging/produção via `.env`.

### Decisão
1. **Adotar o padrão Refresh Token Rotation**:
   - Implementar no backend o endpoint `POST /api/auth/refresh`.
   - Ao receber um `refresh_token` válido, o backend invalida o token apresentado na Blacklist do Redis e emite um novo par de tokens (`access_token` e `refresh_token`).
2. **Parametrização Total via Variáveis de Ambiente**:
   - Adicionar variáveis de ambiente para controle dos tempos de vida:
     - `JWT_ACCESS_TOKEN_EXPIRATION` (ex: `30m`)
     - `JWT_REFRESH_TOKEN_EXPIRATION` (ex: `30m`)
     - `JWT_REFRESH_TOKEN_EXTENDED_EXPIRATION` (ex: `168h` / 7 dias)
   - Adicionar configurações correspondentes no `config.yaml` e struct de configuração do Viper.
3. **Implementar Mutex/Queue no Interceptor Axios do Frontend**:
   - Evitar disparos múltiplos de refresh caso requisições concorrentes falhem simultaneamente com 401.
   - Enfileirar requisições pendentes e reexecutá-las de modo transparente após a chegada do novo par de tokens.

### Consequências
- **Positivas**:
  - Experiência contínua e sem interrupções para o usuário que seleciona "Manter-me logado".
  - Flexibilidade operacional total para alterar os tempos de expiração sem alterar código.
  - Elevada segurança contra ataques de repetição e vazamento de tokens devido à rotação com blacklist no Redis.
- **Negativas / Atenções**:
  - Exige validação de formato da string de duração (`time.ParseDuration`) no carregamento das configurações para garantir inicialização segura.
