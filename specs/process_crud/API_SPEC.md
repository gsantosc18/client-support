# API Specification: Process & Establishment CRUD

Este documento especifica o contrato completo da API HTTP REST para a feature de Processos e Estabelecimentos.

---

## 1. Autenticação e Cabeçalhos Obrigatórios
Todas as requisições exigem o cabeçalho de autorização Bearer Token JWT:
```http
Authorization: Bearer <token_jwt>
```
O `company_id` do operador será inferido automaticamente através das claims do token JWT decodificado no middleware de autenticação.

---

## 2. Endpoints de Estabelecimentos

### 2.1. GET `/api/establishments`
Lista estabelecimentos com paginação e busca textual.

* **Query Parameters**:
  * `search` (opcional): Busca por nome do estabelecimento.
  * `page` (opcional): Padrão `1`.
  * `limit` (opcional): Padrão `10` (máximo `100`).
* **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "1e912440-e18e-4a64-83b4-82fe13b190f2",
        "company_id": "8bb8e76b-f9c6-4ab3-958c-8b2d419eefb7",
        "name": "CRAS Centro",
        "address": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "created_at": "2026-05-21T20:00:00Z",
        "updated_at": "2026-05-21T20:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "limit": 10,
      "total_records": 1,
      "total_pages": 1
    }
  }
  ```

### 2.2. POST `/api/establishments`
Cadastra um novo estabelecimento.

* **Request Body**:
  ```json
  {
    "name": "CRAS Centro",
    "address": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "id": "1e912440-e18e-4a64-83b4-82fe13b190f2",
    "company_id": "8bb8e76b-f9c6-4ab3-958c-8b2d419eefb7",
    "name": "CRAS Centro",
    "address": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "created_at": "2026-05-21T20:00:00Z",
    "updated_at": "2026-05-21T20:00:00Z"
  }
  ```

---

## 3. Endpoints de Processos

### 3.1. GET `/api/processes`
Retorna uma lista paginada e filtrada de processos.

* **Query Parameters**:
  * `status` (opcional): Filtrar por status (`PENDING`, `IN_PROGRESS`, etc.).
  * `protocol` (opcional): Filtrar ou buscar por protocolo.
  * `client_id` (opcional): Filtrar processos associados a um cliente específico.
  * `user_id` (opcional): Filtrar por usuário responsável.
  * `page` (opcional): Padrão `1`.
  * `limit` (opcional): Padrão `10`.
* **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "id": "a461df08-0fe9-427e-9e78-15ef10660aa5",
        "company_id": "8bb8e76b-f9c6-4ab3-958c-8b2d419eefb7",
        "protocol": "PROC-2026-0091",
        "observation": "Acompanhamento de benefício assistencial.",
        "status": "IN_PROGRESS",
        "establishment_id": "1e912440-e18e-4a64-83b4-82fe13b190f2",
        "establishment": {
          "id": "1e912440-e18e-4a64-83b4-82fe13b190f2",
          "name": "CRAS Centro"
        },
        "user_id": "2de31ef9-b511-4814-81ec-cdaf68e97671",
        "user": {
          "id": "2de31ef9-b511-4814-81ec-cdaf68e97671",
          "name": "João da Silva",
          "email": "joao@empresa.com"
        },
        "clients": [
          {
            "id": "f68083c9-7196-410b-8c50-c2e2b560785c",
            "full_name": "Maria Souza",
            "cpf": "123.456.789-00"
          }
        ],
        "created_at": "2026-05-21T20:00:00Z",
        "updated_at": "2026-05-21T20:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "limit": 10,
      "total_records": 1,
      "total_pages": 1
    }
  }
  ```

### 3.2. GET `/api/processes/:id`
Busca detalhes de um processo pelo ID.

* **Response `200 OK`**:
  * Retorna o objeto JSON detalhado do processo (semelhante ao item da listagem, contendo os objetos completos pré-carregados).

### 3.3. POST `/api/processes`
Cria um novo processo.

* **Request Body**:
  ```json
  {
    "client_ids": ["f68083c9-7196-410b-8c50-c2e2b560785c"],
    "establishment_id": "1e912440-e18e-4a64-83b4-82fe13b190f2",
    "user_id": "2de31ef9-b511-4814-81ec-cdaf68e97671",
    "protocol": "PROC-2026-0091",
    "observation": "Acompanhamento de benefício assistencial."
  }
  ```
* **Response `201 Created`**:
  * Retorna o objeto completo do processo recém-criado.

### 3.4. PUT `/api/processes/:id`
Atualiza dados cadastrais, responsável, estabelecimento e vínculos de clientes do processo.

* **Request Body**:
  * Mesma estrutura do `POST` para redefinição completa dos vínculos e campos cadastrais.
* **Response `200 OK`**:
  * Retorna o objeto completo atualizado do processo.

### 3.5. PATCH `/api/processes/:id/status`
Atualiza especificamente o status do processo.

* **Request Body**:
  ```json
  {
    "status": "COMPLETED"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "message": "status atualizado com sucesso",
    "id": "a461df08-0fe9-427e-9e78-15ef10660aa5",
    "status": "COMPLETED"
  }
  ```

### 3.6. DELETE `/api/processes/:id`
Deleta permanentemente um processo.

* **Response `200 OK`**:
  ```json
  {
    "message": "Processo excluído com sucesso.",
    "id": "a461df08-0fe9-427e-9e78-15ef10660aa5"
  }
  ```

---

## 4. Endpoints de Usuários / Operadores

### 4.1. GET `/api/users`
Retorna a listagem de todos os operadores ativos cadastrados no mesmo tenant (empresa autenticada) para possibilitar a atribuição do responsável.

* **Response `200 OK`**:
  ```json
  [
    {
      "id": "2de31ef9-b511-4814-81ec-cdaf68e97671",
      "first_name": "João",
      "last_name": "da Silva",
      "email": "joao@empresa.com",
      "status": "ACTIVE"
    }
  ]
  ```
