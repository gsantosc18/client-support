# Database Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Persistência e Estratégia de Dados

### 1. Redis (Blacklist de Tokens Revogados)
- **Chave**: `blacklist:<refresh_token>`
- **Valor**: `"revoked"`
- **TTL**: Definido dinamicamente com base no tempo restante até a expiração original do Refresh Token (`time.Until(claims.ExpiresAt.Time)`).
- **Finalidade**: Armazenar os refresh tokens antigos invalidados na rotação (Refresh Token Rotation), impedindo que tokens consumidos sejam reutilizados por invasores.

### 2. PostgreSQL (Relacional)
Não são necessárias novas tabelas relacionais ou alterações de schema no banco PostgreSQL, pois a infraestrutura atual já possui:
- `users`: Validação de integridade do usuário (`id`, `company_id`, `status`).
- `companies`: Validação do tenant (`id`, `status`).

### Estratégia Transacional
- As validações de usuário e companhia são idempotentes e somente-leitura (`SELECT`).
- A gravação na blacklist no Redis é uma operação atômica `SET key value EX seconds`.
