# Tech Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Arquitetura Técnica
A solução abrange o ecossistema completo de autenticação entre Go (Fiber) e Next.js/React (Redux + Axios).

### Configurações via Variáveis de Ambiente
Todas as durações dos tokens e segredos são parametrizáveis via variáveis de ambiente e arquivo `config.yaml`, com valores padrão de contingência:
- `JWT_SECRET`: Segredo de assinatura dos tokens HMAC-SHA256 (padrão: valor do `config.yaml`).
- `JWT_ACCESS_TOKEN_EXPIRATION`: Duração do Access Token (ex: `30m`, padrão `30m`).
- `JWT_REFRESH_TOKEN_EXPIRATION`: Duração padrão do Refresh Token sem persistência (ex: `30m`, padrão `30m`).
- `JWT_REFRESH_TOKEN_EXTENDED_EXPIRATION`: Duração do Refresh Token com "Manter-me logado" ativo (ex: `168h` ou `7d`, padrão `168h`).

### Divisão de Camadas

#### Backend (Clean Architecture / Hexagonal)
- **internal/config/config.go**:
  - Expandir `JWTConfig` com `AccessExpiration`, `RefreshExpiration` e `RefreshExtendedExpiration`.
  - Mapear variáveis via `viper.BindEnv` e definir fallbacks seguros.
- **pkg/utils/jwt.go**:
  - Adicionar helpers para configuração das durações (`SetTokenDurations(access, refresh, extended time.Duration)`).
  - Incluir flag `keep_me_logged_in` nas claims do token JWT.
  - Utilizar as durações parametrizadas ao gerar o par de tokens (`GenerateTokenPair`).
- **internal/repository/blacklist_repository.go**:
  - Utilizado para invalidar o `refresh_token` consumido no Redis com TTL dinâmico baseado na expiração do token.
- **internal/service/auth_service.go**:
  - Implementar caso de uso `RefreshToken(ctx context.Context, refreshTokenString string) (*utils.TokenPair, error)`.
  - Validar tipo do token (`TokenType == "refresh"`), verificar blacklist no Redis, checar status do usuário e da companhia no banco.
  - Invalidar o refresh token antigo adicionando à blacklist com o tempo restante de vida do token.
  - Emitir novo `TokenPair` mantendo o status de `keep_me_logged_in`.
- **internal/handlers/http/auth_handler.go**:
  - Handler `RefreshToken(c *fiber.Ctx) error`.
  - Recebe `{ "refresh_token": string }`.
  - Responde `200 OK` com novo `TokenPair` ou `401 Unauthorized` com mensagem de erro amigável.
- **cmd/api/main.go**:
  - Inicializar durações configuradas e registrar a rota pública `auth.Post("/refresh", authHandler.RefreshToken)`.

#### Frontend (Next.js / TypeScript / Redux)
- **services/auth.service.ts**:
  - Adicionar método `refreshToken(refreshToken: string): Promise<{ access_token: string, refresh_token: string }>`.
- **services/api.ts**:
  - Criar fila de requisições pendentes (`failedQueue`) e trava booleana (`isRefreshing`).
  - No interceptor de resposta para status 401:
    - Se for a própria rota de refresh ou login, ou se não houver `refreshToken`, deslogar e redirecionar.
    - Se houver `refreshToken`, enfileirar chamadas subsequentes e disparar a renovação uma única vez.
    - Em caso de sucesso, atualizar Redux e `localStorage`, processar a fila com o novo token e reexecutar a requisição original.
    - Em caso de falha, deslogar, limpar storages e rejeitar a fila.

## Dependências
- Backend: `github.com/golang-jwt/jwt/v5`, `github.com/spf13/viper`, Redis (`blacklistRepo`), PostgreSQL/MySQL (`userRepo`, `companyRepo`).
- Frontend: `axios`, `@reduxjs/toolkit`.
