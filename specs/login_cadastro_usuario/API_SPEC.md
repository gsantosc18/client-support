# API Specification

## Endpoints

### `POST /api/auth/register`
- **Request**: `{ "first_name", "last_name", "email", "phone", "birth_date", "password", "password_confirm", "company_id", "terms_accepted" }`
- **Response**: `201 Created` / `400 Bad Request`

### `POST /api/auth/login`
- **Request**: `{ "email", "password", "keep_logged_in" }`
- **Response**: `200 OK { "access_token", "refresh_token" }` / `401 Unauthorized`

### `POST /api/auth/recover-password`
- **Request**: `{ "email" }`
- **Response**: `200 OK` (Sempre retorna 200 genérico para evitar enumeração).

### `POST /api/auth/reset-password`
- **Request**: `{ "token", "password", "password_confirm" }`
- **Response**: `200 OK` / `400 Bad Request`

### `POST /api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

## Erros Esperados
- `401`: Credenciais inválidas, Token expirado, Conta bloqueada.
- `400`: Erro de validação de payload (ex: senha fraca).
- `404`: Companhia não encontrada.
