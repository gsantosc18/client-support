# API Spec: Client Credentials Vault

Todos os endpoints requerem o header `Authorization: Bearer <JWT_TOKEN>`. A validação do `company_id` do cliente é obrigatória em cada operação.

---

## 1. Listar Itens do Cofre
Retorna a lista de credenciais cadastradas para o cliente. As senhas e observações não devem ser decriptadas neste endpoint (valores ocultados).

- **URL**: `GET /api/clients/:client_id/vault`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": "a904d9c7-e544-482a-a92c-5674744d033a",
      "client_id": "b3e0c034-7389-4e7a-9b16-52c10b4279ab",
      "company_id": "11111111-1111-1111-1111-111111111111",
      "user_id": "987f6543-d21c-43ba-b567-876543210000",
      "title": "Acesso Portal e-CAC",
      "created_at": "2026-06-11T02:00:00Z",
      "updated_at": "2026-06-11T02:00:00Z"
    }
  ]
  ```

---

## 2. Revelar Item do Cofre
Decripta e retorna todos os dados do item do cofre.

- **URL**: `GET /api/clients/:client_id/vault/:id`
- **Response (200 OK)**:
  ```json
  {
    "id": "a904d9c7-e544-482a-a92c-5674744d033a",
    "client_id": "b3e0c034-7389-4e7a-9b16-52c10b4279ab",
    "company_id": "11111111-1111-1111-1111-111111111111",
    "user_id": "987f6543-d21c-43ba-b567-876543210000",
    "title": "Acesso Portal e-CAC",
    "password": "SenhaSuperSecreta123",
    "notes": "Utilizar certificado digital caso a senha falhe",
    "created_at": "2026-06-11T02:00:00Z",
    "updated_at": "2026-06-11T02:00:00Z"
  }
  ```

---

## 3. Cadastrar Item no Cofre
Encripta e insere uma nova credencial para o cliente. O campo `user_id` é inferido de forma automática no backend a partir do JWT e não deve ser enviado no corpo.

- **URL**: `POST /api/clients/:client_id/vault`
- **Request Body**:
  ```json
  {
    "title": "Acesso Portal e-CAC",
    "password": "SenhaSuperSecreta123",
    "notes": "Utilizar certificado digital caso a senha falhe"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "a904d9c7-e544-482a-a92c-5674744d033a",
    "client_id": "b3e0c034-7389-4e7a-9b16-52c10b4279ab",
    "company_id": "11111111-1111-1111-1111-111111111111",
    "user_id": "987f6543-d21c-43ba-b567-876543210000",
    "title": "Acesso Portal e-CAC",
    "created_at": "2026-06-11T02:00:00Z",
    "updated_at": "2026-06-11T02:00:00Z"
  }
  ```

---

## 4. Atualizar Item do Cofre
Atualiza e re-encripta os dados da credencial do cliente.

- **URL**: `PUT /api/clients/:client_id/vault/:id`
- **Request Body**:
  ```json
  {
    "title": "Acesso Portal e-CAC Atualizado",
    "password": "NovaSenhaSuperSecreta456",
    "notes": "Notas atualizadas"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "a904d9c7-e544-482a-a92c-5674744d033a",
    "client_id": "b3e0c034-7389-4e7a-9b16-52c10b4279ab",
    "company_id": "11111111-1111-1111-1111-111111111111",
    "title": "Acesso Portal e-CAC Atualizado",
    "created_at": "2026-06-11T02:00:00Z",
    "updated_at": "2026-06-11T02:00:00Z"
  }
  ```

---

## 5. Remover Item do Cofre
Remove permanentemente o item do cofre.

- **URL**: `DELETE /api/clients/:client_id/vault/:id`
- **Response (204 No Content)**
