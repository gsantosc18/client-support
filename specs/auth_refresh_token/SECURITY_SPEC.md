# Security Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Princípios de Segurança

### 1. Rotação de Refresh Token (Refresh Token Rotation)
- Todo `refresh_token` é de uso estritamente único.
- No momento em que um refresh token é apresentado e validado com sucesso, o backend imediatamente o insere na Blacklist no Redis.
- Um novo par de tokens (`access_token` e `refresh_token`) é devolvido ao cliente.

### 2. Detecção e Prevenção de Roubo de Sessão (Replay Attacks)
- Se um invasor interceptar e tentar reutilizar um `refresh_token` que já foi consumido, o backend identificará a presença do token na Blacklist e rejeitará a requisição com `401 Unauthorized`.

### 3. Validação de Claims e Tipagem Estrita
- Tokens possuem o claim `token_type`:
  - `access`: Aceito apenas nos middlewares de rotas protegidas normais (`Protected`).
  - `refresh`: Aceito única e exclusivamente na rota `/api/auth/refresh`.
- Trocas de tokens cruzadas (ex: enviar um token de acesso para a rota de refresh) são categoricamente rejeitadas com `401 Unauthorized`.

### 4. Ciclos de Vida Parametrizáveis por Variáveis de Ambiente
- `JWT_ACCESS_TOKEN_EXPIRATION`: Padrão de 30 minutos (limita a janela de exposição de um token interceptado).
- `JWT_REFRESH_TOKEN_EXPIRATION`: Padrão de 30 minutos quando "Manter-me logado" estiver desmarcado.
- `JWT_REFRESH_TOKEN_EXTENDED_EXPIRATION`: Padrão de 7 dias (168h) quando o usuário opta por persistência estendida.
- Os tempos são ajustáveis operacionalmente sem necessidade de recompilação do código.

### 5. Revogação no Logout
- Ao realizar logout explícito, tanto o `access_token` quanto o `refresh_token` são limpos no cliente, e o token ativo é adicionado à Blacklist no Redis.
