# Tarefas: Autenticação Persistente e Renovação de Sessão (Refresh Token)

# Backend
- [x] Atualizar `internal/config/config.go` e `configs/config.yaml` para incluir as chaves de expiração de token (`JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXTENDED_EXPIRATION`).
- [x] Atualizar `pkg/utils/jwt.go` para suportar configuração dinâmica de durações (`SetTokenDurations`) e adicionar flag `KeepMeLoggedIn` nas claims.
- [x] Inicializar durações em `cmd/api/main.go` a partir do `cfg.JWT`.
- [x] Implementar método `RefreshToken` no `AuthService` (`internal/service/auth_service.go`).
- [x] Implementar handler `RefreshToken` no `AuthHandler` (`internal/handlers/http/auth_handler.go`).
- [x] Registrar rota `POST /api/auth/refresh` no Fiber em `cmd/api/main.go`.
- [x] Criar testes unitários para `RefreshToken` e leitura de configurações de duração no serviço e no handler HTTP.

# Frontend
- [x] Implementar método `refreshToken` em `app/src/services/auth.service.ts`.
- [x] Atualizar o interceptor de resposta em `app/src/services/api.ts` com fila de requisições e renovação transparente com mutex.
- [x] Atualizar testes unitários em `app/src/services/api.test.ts` e `app/src/services/auth.service.test.ts`.

# QA e Validação
- [x] Executar testes de backend (`make tests-back`).
- [x] Executar testes de frontend (`make tests-front`).
- [x] Subir infraestrutura (`make infra`) e validar estabilidade.
- [x] Criar cenário de teste E2E com Cypress simulando token expirado e validação do fluxo transparente.
