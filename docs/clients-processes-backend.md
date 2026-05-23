# Documentação Técnica: Clientes, Estabelecimentos & Processos (Backend)

Esta documentação descreve as entidades de banco de dados e os endpoints da API REST implementados para gerenciar Clientes, Estabelecimentos e Processos sob isolamento completo de multi-tenancy.

---

## 1. Banco de Dados: Entidades PostgreSQL

O banco de dados foi estruturado com isolamento de `company_id` (Multi-Tenancy) para todas as entidades principais.

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

### 1.2. Tabela: `establishments`
Tabela que gerencia os estabelecimentos vinculados às empresas de apoio ao cliente (ex: CRAS, CREAS).
* **id**: `UUID` (Chave Primária, gerada via `uuid_generate_v4()`)
* **company_id**: `UUID` (Chave Estrangeira para `companies(id)`, `ON DELETE RESTRICT`)
* **name**: `VARCHAR(255)` (Nome do estabelecimento, Obrigatório)
* **address**: `VARCHAR(255)` (Endereço físico, Obrigatório)
* **city**: `VARCHAR(100)` (Cidade, Obrigatório)
* **state**: `VARCHAR(2)` (Estado/UF, Obrigatório)
* **created_at**: `TIMESTAMPTZ` (Data de criação UTC)
* **updated_at**: `TIMESTAMPTZ` (Data de atualização UTC)

**Constraints & Unicidade**:
* Restrição única em `(company_id, name)` para evitar estabelecimentos com o mesmo nome sob o mesmo inquilino.

---

### 1.3. Tabela: `processes`
Tabela que gerencia as ações e processos abertos.
* **id**: `UUID` (Chave Primária, gerada via `uuid_generate_v4()`)
* **company_id**: `UUID` (Chave Estrangeira para `companies(id)`, `ON DELETE RESTRICT`)
* **establishment_id**: `UUID` (Chave Estrangeira para `establishments(id)`, `ON DELETE RESTRICT`)
* **user_id**: `UUID` (Chave Estrangeira para `users(id)`, `ON DELETE RESTRICT`)
* **protocol**: `VARCHAR(255)` (Opcional, Código identificador ou protocolo do processo, Único por empresa)
* **observation**: `TEXT` (Opcional, Observações gerais sobre o andamento)
* **status**: `VARCHAR(50)` (Enum: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, Default: `'PENDING'`)
* **created_at**: `TIMESTAMPTZ` (Data de criação UTC)
* **updated_at**: `TIMESTAMPTZ` (Data de atualização UTC)

**Constraints**:
* Restrição única em `(company_id, protocol)` se o protocolo for informado.

---

### 1.4. Tabela Associativa: `client_processes`
Tabela muitos-para-muitos (M:N) ligando processos a múltiplos clientes da mesma empresa.
* **process_id**: `UUID` (Chave Estrangeira apontando para `processes(id)`, `ON DELETE CASCADE`)
* **client_id**: `UUID` (Chave Estrangeira apontando para `clients(id)`, `ON DELETE RESTRICT`)

---

### 1.5. Tabela: `deleted_clients`
Tabela de log e auditoria para armazenar dados cadastrais históricos completos de clientes excluídos fisicamente.
* **id**: `BIGSERIAL` (Chave Primária)
* **data**: `JSONB` (Dados completos serializados em JSON)
* **deleted_at**: `TIMESTAMPTZ` (Default: `CURRENT_TIMESTAMP`)

---

### 1.6. Tabela: `annotations`
Tabela que gerencia as anotações e observações de acompanhamento interno dos processos.
* **id**: `UUID` (Chave Primária, gerada via `uuid_generate_v4()`)
* **company_id**: `UUID` (Chave Estrangeira apontando para `companies(id)`, `ON DELETE RESTRICT`)
* **process_id**: `UUID` (Chave Estrangeira apontando para `processes(id)`, `ON DELETE CASCADE`)
* **user_id**: `UUID` (Chave Estrangeira apontando para `users(id)`, `ON DELETE RESTRICT`)
* **annotation**: `TEXT` (Texto da anotação, limite sugerido de 2000 caracteres, Obrigatório)
* **visibility**: `VARCHAR(50)` (Enum: `PUBLIC`, `PRIVATE`, Default: `'PUBLIC'`)
* **created_at**: `TIMESTAMPTZ` (Data de criação UTC)
* **updated_at**: `TIMESTAMPTZ` (Data de atualização UTC)

**Índices e Otimização**:
* Índice composto em `(process_id, company_id)` para otimizar a leitura cronológica das notas de cada processo de inquilinos diferentes.

---

## 2. Especificação da API REST

Todos os endpoints listados abaixo exigem autenticação via Token JWT Bearer no cabeçalho HTTP:
```http
Authorization: Bearer <token_jwt>
```
O `company_id` do registro é inferido automaticamente do token de acesso do usuário logado.

---

### 2.1. Clientes (Clients)
* **`POST /api/clients`**: Criar cliente (exige e-mail, cpf, rg e cnh únicos por tenant).
* **`GET /api/clients`**: Listar clientes da empresa com suporte a paginação e busca textual.
* **`PUT /api/clients/:id`**: Atualizar dados de um cliente.
* **`DELETE /api/clients/:id`**: Exclusão física atômica gravando dados históricos na tabela fria. Bloqueado caso haja processos associados na tabela `client_processes`.

---

### 2.2. Estabelecimentos (Establishments)

#### Criar Estabelecimento (`POST /api/establishments`)
* **Request Body**:
```json
{
  "name": "CRAS Leste",
  "address": "Rua das Laranjeiras, 450",
  "city": "São Paulo",
  "state": "SP"
}
```
* **Respostas**:
  * `201 Created`: Estabelecimento cadastrado com sucesso.
  * `400 Bad Request`: Campos obrigatórios em branco ou inválidos.
  * `409 Conflict`: Nome de estabelecimento já cadastrado na mesma empresa.

#### Listar Estabelecimentos (`GET /api/establishments`)
* **Query Parameters**:
  * `page`: Página (default `1`)
  * `limit`: Limite (default `10`)
* **Resposta (200 OK)**:
```json
{
  "data": [
    {
      "id": "abcde123-1234-abcd-ef01-1234567890ab",
      "name": "CRAS Leste",
      "address": "Rua das Laranjeiras, 450",
      "city": "São Paulo",
      "state": "SP"
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

### 2.3. Processos (Processes)

#### Criar Processo (`POST /api/processes`)
* **Request Body**:
```json
{
  "establishment_id": "abcde123-1234-abcd-ef01-1234567890ab",
  "user_id": "987f6543-d21c-43ba-b567-876543210000",
  "protocol": "PROC-2026-99",
  "observation": "Observação importante",
  "client_ids": [
    "789e4567-e89b-12d3-a456-426614174000"
  ]
}
```
* **Validações**:
  * É obrigatório associar pelo menos 1 cliente.
  * Todos os clientes em `client_ids` devem ser ativos e da mesma empresa.
  * O estabelecimento `establishment_id` deve pertencer à mesma empresa.
* **Respostas**:
  * `201 Created`: Processo inicializado com sucesso.
  * `400 Bad Request`: Dados ou relacionamentos inválidos.

#### Listar Processos (`GET /api/processes`)
* **Query Parameters**:
  * `page` (default `1`), `limit` (default `10`)
* **Resposta (200 OK)**: Retorna a coleção de processos contendo os clientes associados completos, o estabelecimento e o usuário operador preenchidos por preload.

#### Buscar Processo por ID (`GET /api/processes/:id`)
* Retorna o processo detalhado completo por ID.

#### Atualizar Processo (`PUT /api/processes/:id`)
* Permite atualizar os dados do processo, incluindo o vínculo de múltiplos clientes e estabelecimento.

#### Excluir Processo (`DELETE /api/processes/:id`)
* Remove fisicamente o processo e seus vínculos de forma atômica e em cascata.

---

### 2.4. Anotações de Acompanhamento (Process Annotations)

#### Criar Anotação (`POST /api/processes/:processId/annotations`)
* **Request Body**:
```json
{
  "annotation": "Anotação contendo observações internas de teste do processo.",
  "visibility": "PRIVATE"
}
```
* **Respostas**:
  * `201 Created`: Anotação adicionada com sucesso.
  * `400 Bad Request`: Texto da anotação vazio ou com mais de 2000 caracteres.
  * `403 Forbidden`: O processo ou estabelecimento não pertencem à mesma empresa do usuário autenticado.

#### Listar Anotações do Processo (`GET /api/processes/:processId/annotations`)
* Retorna a lista cronológica decrescente de todas as anotações associadas ao processo.
* **Respostas (200 OK)**:
```json
[
  {
    "id": "e4567890-1234-abcd-ef01-1234567890cd",
    "company_id": "company123-1234-abcd-ef01-1234567890ab",
    "process_id": "process123-1234-abcd-ef01-1234567890bc",
    "user_id": "user123-1234-abcd-ef01-1234567890de",
    "annotation": "Anotação contendo observações internas de teste do processo.",
    "visibility": "PRIVATE",
    "created_at": "2026-05-23T12:00:00Z",
    "updated_at": "2026-05-23T12:00:00Z",
    "user": {
      "first_name": "Operador",
      "last_name": "Padrão",
      "email": "operador@test.com"
    }
  }
]
```

#### Editar Anotação (`PUT /api/processes/:processId/annotations/:annotationId`)
* Permite ao autor da anotação modificar seu texto.
* **Request Body**:
```json
{
  "annotation": "Anotação atualizada e modificada."
}
```
* **Restrições**:
  * Modificação bloqueada se o tempo decorrido desde a criação for maior que 15 minutos.
  * Apenas o próprio autor (`user_id`) pode modificar o registro.
* **Respostas**:
  * `200 OK`: Anotação atualizada.
  * `400 Bad Request`: Texto vazio, com mais de 2000 caracteres, ou se excedeu a janela de 15 minutos.
  * `403 Forbidden`: Se o usuário logado não for o criador original.

#### Deletar Anotação (`DELETE /api/processes/:processId/annotations/:annotationId`)
* Remove definitivamente (deleção física / Hard Delete) a anotação do banco de dados.
* **Restrições**:
  * Exclusão bloqueada se o tempo decorrido desde a criação for maior que 15 minutos.
  * Apenas o próprio autor (`user_id`) pode excluir o registro.
* **Respostas**:
  * `204 No Content`: Anotação excluída com sucesso.
  * `400 Bad Request`: Se excedeu a janela de 15 minutos.
  * `403 Forbidden`: Se o usuário logado não for o criador original.
