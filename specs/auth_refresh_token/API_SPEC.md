# API Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Endpoints

### `POST /api/auth/refresh`
Endpoint público (sem necessidade de header `Authorization: Bearer`), destinado à renovação da sessão via Refresh Token.

#### Request
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "refresh_token": "string (JWT refresh token obrigatório)"
}
```

#### Responses

- **`200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **`400 Bad Request`**:
```json
{
  "error": "refresh_token obrigatório ou mal formatado"
}
```

- **`401 Unauthorized`**:
```json
{
  "error": "token inválido, expirado ou revogado"
}
```

## Contrato de Erros
- Código 401 deve ser retornado caso:
  - O token informado não for do tipo `"refresh"`.
  - A assinatura JWT for inválida ou o token já tiver expirado.
  - O token constar na blacklist (já utilizado ou revogado).
  - O usuário ou companhia associada estiverem inativos/bloqueados.
