# Documentação Técnica: Clientes & Processos (Backend)

Esta documentação descreve as entidades de banco de dados e os endpoints da API REST implementados para gerenciar Clientes e Processos sob isolamento de multi-tenancy.

---

## 1. Banco de Dados: Entidades PostgreSQL

As tabelas foram desenvolvidas de modo a suportar o cadastramento de múltiplos documentos e contatos opcionais por cliente, garantindo que a unicidade seja respeitada apenas para o escopo de cada empresa (Multi-Tenancy).

### 1.1. Tabela: `clients`
Tabela que armazena os clientes atendidos pelas empresas.
* **id**: `UUID` (Chave Primária, gerada via `uuid_generate_v4()`)
* **company_id**: `UUID` (Chave Estrangeira apontando para `companies(id)`, `ON DELETE RESTRICT`)
* **full_name**: `VARCHAR(255)` (Nome completo do cliente, Obrigatório)
* **email**: `VARCHAR(255)` (Opcional, Único por empresa)
* **phone**: `VARCHAR(50)` (Opcional)
* **birth_date**: `DATE` (Opcional)
* **cpf**: `VARCHAR(14)` (Opcional, Único por empresa)
* **rg**: `VARCHAR(20)` (Opcional, Único por empresa)
* **cnh**: `VARCHAR(20)` (Opcional, Único por empresa)
* **status**: `VARCHAR(50)` (Enum: `ACTIVE`, `INACTIVE`, `SUSPENDED`, Default: `'ACTIVE'`)
* **created_at**: `TIMESTAMPTZ` (Data de criação UTC)
* **updated_at**: `TIMESTAMPTZ` (Data de atualização UTC)

**Índices e Constraints**:
* `uq_client_company_email`: Restrição única em `(company_id, email)`
* `uq_client_company_cpf`: Restrição única em `(company_id, cpf)`
* `uq_client_company_rg`: Restrição única em `(company_id, rg)`
* `uq_client_company_cnh`: Restrição única em `(company_id, cnh)`
* `idx_clients_company_name`: Otimiza busca textual por nome de clientes da mesma empresa.

---

### 1.2. Tabela: `processes`
Tabela que gerencia os chamados ou processos abertos para os clientes.
* **id**: `UUID` (Chave Primária, gerada via `uuid_generate_v4()`)
* **company_id**: `UUID` (Chave Estrangeira para `companies(id)`, `ON DELETE RESTRICT`)
* **client_id**: `UUID` (Chave Estrangeira para `clients(id)`, `ON DELETE RESTRICT`)
* **user_id**: `UUID` (Chave Estrangeira para `users(id)`, `ON DELETE RESTRICT`)
* **external_id**: `VARCHAR(255)` (Opcional, código identificador na plataforma de origem, único por empresa)
* **status**: `VARCHAR(50)` (Enum: `STARTED`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, Default: `'STARTED'`)
* **created_at**: `TIMESTAMPTZ` (Data de criação UTC)
* **updated_at**: `TIMESTAMPTZ` (Data de atualização UTC)

**Constraints**:
* `uq_process_company_external`: Restrição única em `(company_id, external_id)`
* `chk_process_status`: Restrição CHECK limitando os valores aos enums válidos.

---

### 1.3. Tabela: `deleted_clients`
Tabela de log e auditoria fria para armazenar os dados cadastrais históricos completos de clientes que foram excluídos fisicamente do sistema.
* **id**: `BIGSERIAL` (Chave Primária, Autoincremento)
* **data**: `JSONB` (Payload contendo os dados completos serializados em JSON da struct de cliente no momento do delete)
* **deleted_at**: `TIMESTAMPTZ` (Data e hora em UTC em que o registro foi excluído e arquivado, Default: `CURRENT_TIMESTAMP`)

---

## 2. Especificação da API REST

Todos os endpoints listados abaixo exigem autenticação via Token JWT Bearer no cabeçalho HTTP:
```http
Authorization: Bearer <token_jwt>
```
O `company_id` do registro é inferido automaticamente do token de acesso do usuário.

---

### 2.1. Clientes (Clients)

#### Criar Cliente (`POST /api/clients`)
* **Request Body**:
```json
{
  "full_name": "Gedalias Caldas",
  "email": "gedalias@example.com",
  "phone": "+5511999999999",
  "birth_date": "1990-05-20",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "cnh": "12345678900"
}
```
* **Respostas**:
  * `201 Created`: Cliente criado com sucesso (retorna o objeto completo).
  * `400 Bad Request`: Dados inválidos ou formato incorreto.
  * `409 Conflict`: E-mail, CPF, RG ou CNH já existentes para outro cliente na mesma empresa.

#### Listar Clientes (`GET /api/clients`)
* **Query Parameters**:
  * `page`: Página (default `1`)
  * `limit`: Quantidade de registros (default `10`)
  * `search`: Filtrar por nome completo, e-mail ou CPF.
  * `status`: Filtrar por status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
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

#### Atualizar Cliente (`PUT /api/clients/:id`)
* **Request Body**: (Suporta os mesmos campos do POST e opcionalmente o campo `"status"` para atualização de status)
```json
{
  "full_name": "Gedalias Caldas Alterado",
  "email": "gedalias@example.com",
  "phone": "+5511999999988",
  "birth_date": "1990-05-20",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "cnh": "12345678900",
  "status": "SUSPENDED"
}
```
* **Respostas**:
  * `200 OK`: Atualizado com sucesso (retorna objeto completo).
  * `400 Bad Request`: Dados ou status inválido.
  * `404 Not Found`: Cliente não existe ou pertence a outra empresa.

#### Excluir e Arquivar Cliente (`DELETE /api/clients/:id`)
* Realiza a **exclusão física definitiva** (Hard Delete) do cliente da tabela `clients` e grava seus dados cadastrais históricos como log JSONB na tabela fria de auditoria `deleted_clients`.
* **Atomicidade**: Toda a operação é executada sob uma transação atômica única de banco de dados (`db.Transaction`). Se houver qualquer falha no arquivamento ou na exclusão, a transação sofre rollback.
* **Regra de Negócio de Integridade Referencial**: A exclusão só é permitida se o cliente **não possuir nenhum processo ativo ou associado no banco de dados**. Caso existam processos associados, a operação será barrada pela regra de negócios (e protegida no banco pela constraint `ON DELETE RESTRICT`).
* **Respostas**:
  * `200 OK`: Excluído e arquivado com sucesso.
  ```json
  {
    "message": "Cliente excluído e arquivado com sucesso.",
    "id": "789e4567-e89b-12d3-a456-426614174000"
  }
  ```
  * `400 Bad Request`: Operação negada se houverem processos ativos vinculados ao cliente.
  ```json
  {
    "error": "O cliente está vinculado a um processo e não pode ser removido."
  }
  ```
  * `404 Not Found`: Cliente não existe ou pertence a outra empresa.

---

### 2.2. Processos (Processes)

#### Criar Processo (`POST /api/processes`)
* **Request Body**:
```json
{
  "client_id": "789e4567-e89b-12d3-a456-426614174000",
  "user_id": "987f6543-d21c-43ba-b567-876543210000",
  "external_id": "PROC-2026-XYZ"
}
```
* **Validações de Domínio**:
  * O `client_id` deve ser de um cliente ativo da mesma empresa.
  * O `user_id` deve pertencer a um operador ativo da mesma empresa.
* **Respostas**:
  * `201 Created`: Processo inicializado com status `STARTED`.
  * `400 Bad Request`: Usuário ou cliente inválidos/pertencentes a outro tenant.

#### Listar Processos (`GET /api/processes`)
* **Query Parameters**:
  * `page` / `limit` (opcionais)
  * `client_id` / `user_id` / `status` / `external_id` (filtros opcionais)
* **Resposta (200 OK)**: Retorna a coleção de processos preenchidos com os dados aninhados do cliente e do usuário operador.

#### Atualizar Status do Processo (`PATCH /api/processes/:id/status`)
* **Request Body**:
```json
{
  "status": "IN_PROGRESS"
}
```
* **Respostas**:
  * `200 OK`: Transição efetuada com sucesso.
  * `400 Bad Request`: Transição de status inválida.
