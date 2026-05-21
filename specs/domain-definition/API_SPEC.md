# Especificação de APIs: API_SPEC.md

Esta especificação define os contratos de endpoints, payloads de requisição/resposta, códigos de status HTTP e padrões de autenticação para as APIs do sistema de suporte ao cliente.

---

## 1. Regras Gerais de Integração

### 1.1. Autenticação e Segurança
* **Protocolo**: HTTP/1.1 ou superior rodando sobre TLS.
* **Autenticação**: JWT (JSON Web Token) passado no Header da requisição:
  ```http
  Authorization: Bearer <token_jwt_aqui>
  ```
* **Isolamento de Tenants (Multi-Tenancy)**: 
  > [!IMPORTANT]
  > O `company_id` **nunca** deve ser enviado nos payloads JSON de criação (`POST`) ou atualização (`PUT/PATCH`). 
  > O backend em Golang deve extrair o `company_id` de forma 100% segura a partir dos *Claims* decodificados do Token JWT do usuário autenticado.

### 1.2. Padrão de Erros
Em caso de erro (status codes `4xx` ou `5xx`), a API retornará o seguinte formato JSON padronizado:
```json
{
  "error": "NOME_DO_ERRO_EM_MAIUSCULO",
  "message": "Mensagem detalhada e amigável sobre o ocorrido para o usuário final.",
  "details": [] // Opcional, lista de validações específicas (ex: campos inválidos)
}
```

---

## 2. Endpoints de Clientes (Clients)

### 2.1. Criar Cliente
* **Rota**: `POST /api/clients`
* **Autenticação**: Obrigatória (JWT)
* **Request Body**:
```json
{
  "full_name": "Gedalias Caldas",
  "email": "gedalias@example.com", // Opcional (pode ser omitido ou null)
  "phone": "+5511999999999",       // Opcional
  "birth_date": "1990-05-20",      // Opcional, formato YYYY-MM-DD
  "cpf": "123.456.789-00",         // Opcional
  "rg": "12.345.678-9",            // Opcional
  "cnh": "12345678900"             // Opcional
}
```
* **Respostas**:
  * **201 Created**: Cliente criado com sucesso.
    ```json
    {
      "id": "789e4567-e89b-12d3-a456-426614174000",
      "company_id": "11111111-1111-1111-1111-111111111111",
      "full_name": "Gedalias Caldas",
      "email": "gedalias@example.com",
      "phone": "+5511999999999",
      "birth_date": "1990-05-20",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "cnh": "12345678900",
      "status": "ACTIVE",
      "created_at": "2026-05-20T09:00:00Z",
      "updated_at": "2026-05-20T09:00:00Z"
    }
    ```
  * **400 Bad Request**: Erro de validação de dados (ex: CPF com formato inválido).
  * **409 Conflict**: E-mail, CPF, RG ou CNH já cadastrados nesta mesma empresa.

---

### 2.2. Listar Clientes (com Paginação e Busca)
* **Rota**: `GET /api/clients`
* **Autenticação**: Obrigatória (JWT)
* **Query Parameters**:
  * `page` (opcional): Número da página (Default: `1`).
  * `limit` (opcional): Quantidade de registros por página (Default: `10`, Máximo: `100`).
  * `search` (opcional): Termo de busca textual para filtrar por `full_name`, `email` ou `cpf`.
  * `status` (opcional): Filtrar por status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
* **Resposta (200 OK)**:
```json
{
  "data": [
    {
      "id": "789e4567-e89b-12d3-a456-426614174000",
      "full_name": "Gedalias Caldas",
      "email": "gedalias@example.com",
      "phone": "+5511999999999",
      "cpf": "123.456.789-00",
      "status": "ACTIVE"
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

---

### 2.3. Obter Cliente por ID
* **Rota**: `GET /api/clients/:id`
* **Autenticação**: Obrigatória (JWT)
* **Respostas**:
  * **200 OK**: Retorna o cadastro completo do cliente (estrutura idêntica ao retorno do `POST`).
  * **404 Not Found**: Cliente não encontrado ou pertence a outra empresa.

---

### 2.4. Atualizar Cliente
* **Rota**: `PUT /api/clients/:id`
* **Autenticação**: Obrigatória (JWT)
* **Request Body**: (Estrutura idêntica ao body do `POST`)
* **Respostas**:
  * **200 OK**: Retorna o cliente atualizado com os novos dados.
  * **404 Not Found**: Cliente não existe ou pertence a outra empresa.
  * **409 Conflict**: Tentativa de duplicar dados de identificação exclusivos da empresa.

---

### 2.5. Alterar Status (Desativar Cliente / Soft Delete)
* **Rota**: `DELETE /api/clients/:id`
* **Autenticação**: Obrigatória (JWT)
* **Descrição**: Realiza a desativação lógica (muda o status para `INACTIVE`).
* **Resposta (200 OK)**:
```json
{
  "message": "Cliente desativado com sucesso.",
  "id": "789e4567-e89b-12d3-a456-426614174000",
  "status": "INACTIVE"
}
```

---

## 3. Endpoints de Processos (Processes)

### 3.1. Criar Processo
* **Rota**: `POST /api/processes`
* **Autenticação**: Obrigatória (JWT)
* **Regras de Negócio**: 
  * O `user_id` é o usuário operador responsável.
  * O backend deve validar se o `client_id` e o `user_id` informados pertencem ao mesmo `company_id` do token JWT do usuário autenticado.
* **Request Body**:
```json
{
  "client_id": "789e4567-e89b-12d3-a456-426614174000",
  "user_id": "987f6543-d21c-43ba-b567-876543210000",
  "external_id": "PROC-2026-XYZ" // Opcional
}
```
* **Respostas**:
  * **201 Created**: Processo inicializado com sucesso.
    ```json
    {
      "id": "111e4567-e89b-12d3-a456-426614174111",
      "company_id": "11111111-1111-1111-1111-111111111111",
      "client_id": "789e4567-e89b-12d3-a456-426614174000",
      "user_id": "987f6543-d21c-43ba-b567-876543210000",
      "external_id": "PROC-2026-XYZ",
      "status": "STARTED", // Status inicial padrão
      "created_at": "2026-05-20T09:10:00Z",
      "updated_at": "2026-05-20T09:10:00Z"
    }
    ```
  * **400 Bad Request**: Validação de chaves falhou ou violação de multi-tenancy (ex: cliente pertence a outra empresa).

---

### 3.2. Listar Processos (com Paginação e Filtros)
* **Rota**: `GET /api/processes`
* **Autenticação**: Obrigatória (JWT)
* **Query Parameters**:
  * `page` / `limit` (opcionais): Para paginação.
  * `client_id` (opcional): Filtrar processos de um cliente específico.
  * `user_id` (opcional): Filtrar processos de um operador específico.
  * `status` (opcional): Filtrar por `STARTED`, `PENDING`, `IN_PROGRESS`, `COMPLETED` ou `CANCELLED`.
  * `external_id` (opcional): Busca exata do ID externo.
* **Resposta (200 OK)**:
```json
{
  "data": [
    {
      "id": "111e4567-e89b-12d3-a456-426614174111",
      "client": {
        "id": "789e4567-e89b-12d3-a456-426614174000",
        "full_name": "Gedalias Caldas"
      },
      "user": {
        "id": "987f6543-d21c-43ba-b567-876543210000",
        "first_name": "Admin",
        "last_name": "System"
      },
      "external_id": "PROC-2026-XYZ",
      "status": "STARTED",
      "created_at": "2026-05-20T09:10:00Z"
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

---

### 3.3. Atualizar Status do Processo (Transição de Fluxo)
* **Rota**: `PATCH /api/processes/:id/status`
* **Autenticação**: Obrigatória (JWT)
* **Request Body**:
```json
{
  "status": "IN_PROGRESS" // STARTED, PENDING, IN_PROGRESS, COMPLETED, CANCELLED
}
```
* **Respostas**:
  * **200 OK**: Retorna o processo com o status atualizado e data de modificação.
  * **400 Bad Request**: Transição ou valor de status inválido.
  * **404 Not Found**: Processo não encontrado ou de outra empresa.

---

### 3.4. Atualizar Dados do Processo
* **Rota**: `PUT /api/processes/:id`
* **Autenticação**: Obrigatória (JWT)
* **Request Body**:
```json
{
  "client_id": "789e4567-e89b-12d3-a456-426614174000",
  "user_id": "987f6543-d21c-43ba-b567-876543210000",
  "external_id": "PROC-2026-NEW-ID"
}
```
* **Resposta (200 OK)**: Retorna o processo completo atualizado.
