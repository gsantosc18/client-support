# API SPECIFICATION (API_SPEC.md) - Cadastro Seguro de Usuários

## Endpoints Novos e Modificados

### 1. Modificação do Endpoint: Cadastro de Usuário
- **Rota**: `POST /api/auth/register`
- **Payload** (JSON):
```json
{
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao@empresa.com",
  "phone": "11987654321",
  "birth_date": "1990-01-01T00:00:00Z",
  "password": "Password123!",
  "password_confirm": "Password123!",
  "terms_accepted": true,
  "access_code": "AcmeSecret2026", // Opcional se usar convite
  "invitation_token": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" // Opcional se usar código de acesso
}
```
- **Respostas**:
  - `201 Created`: Cadastro realizado.
  - `400 Bad Request`: "código de acesso inválido", "convite inválido ou expirado" ou e-mail de registro incompatível com o convite.

---

### 2. Novo Endpoint: Validar Convite (Público)
- **Rota**: `GET /api/auth/validate-invitation?token={token}`
- **Respostas**:
  - `200 OK`:
    ```json
    {
      "valid": true,
      "email": "convidado@empresa.com",
      "company_id": "11111111-1111-1111-1111-111111111111"
    }
    ```
  - `400 Bad Request`:
    ```json
    {
      "error": "convite inválido, expirado ou já utilizado"
    }
    ```

---

### 3. Novo Endpoint: Criar Convite (Privado - Apenas Admin)
- **Rota**: `POST /api/auth/invitations`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>` (Token do Administrador logado)
- **Payload** (JSON):
```json
{
  "email": "novo.funcionario@acme.com"
}
```
- **Respostas**:
  - `201 Created`:
    ```json
    {
      "token": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "email": "novo.funcionario@acme.com",
      "expires_at": "2026-06-10T10:00:00Z",
      "invitation_link": "http://localhost:3000/register?invitation_token=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
    }
    ```
  - `401 Unauthorized`: Se o token for inválido.
  - `403 Forbidden`: Se o usuário logado não for um administrador da mesma empresa.
  - `400 Bad Request`: Se o e-mail for inválido ou já estiver cadastrado.
