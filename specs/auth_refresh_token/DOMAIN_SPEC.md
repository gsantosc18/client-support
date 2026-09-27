# Domain Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Bounded Context
**Identidade e Acesso (IAM / Auth)**: Responsável pelo ciclo de vida das credenciais, tokens JWT, permissões e sessões de usuários vinculados às companhias.

## Agregados e Entidades
- **User (Entidade Raiz)**: Possui atributos como ID, Email, CompanyID, Status, FailedLoginAttempts, LockedUntil.
- **Company**: Entidade que delimita o tenant. Deve estar ativa para que a renovação de sessão seja concedida.

## Value Objects
- **TokenPair**:
  - `AccessToken`: String JWT contendo claims de autorização e curta duração (30m).
  - `RefreshToken`: String JWT contendo claims de identidade e longa duração (até 7d).
- **Claims**:
  - `UserID`: UUID do usuário.
  - `CompanyID`: UUID da empresa do usuário.
  - `TokenType`: Tipo do token (`"access"` ou `"refresh"`).
  - `KeepMeLoggedIn`: Booleano identificando persistência estendida.
  - `RegisteredClaims`: Padrão RFC 7519 (`IssuedAt`, `ExpiresAt`).

## Regras de Domínio
1. Um `Claims` do tipo `"refresh"` não pode ser utilizado para acessar rotas protegidas comuns (regras de autorização de recursos).
2. Um `Claims` do tipo `"access"` não pode ser aceito na rota de renovação de sessão (`POST /api/auth/refresh`).
3. Uma renovação só é válida se a entidade `User` e a entidade `Company` estiverem ativas no banco de dados e o token não constar na lista de revogados (blacklist).

## Estados da Aplicação
- **Autenticado com Acesso Válido**: `access_token` e `refresh_token` válidos.
- **Autenticado com Acesso Expirado**: `access_token` expirado (>30m), `refresh_token` válido. Transição automática via refresh silencioso.
- **Não Autenticado / Sessão Expirada**: Ambos os tokens expirados ou revogados. Requisições retornam 401 e o estado é resetado.
