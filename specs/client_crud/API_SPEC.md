# API Specification: Client CRUD

Este documento define formalmente os contratos da API HTTP exposta pelo backend para o gerenciamento de Clientes.

---

## 1. Visão Geral das Rotas

Todas as rotas exigem autenticação via cabeçalho HTTP `Authorization: Bearer <JWT_TOKEN>`. O token JWT deve conter o payload correspondente com a chave `company_id`.

* **Base URL**: `http://localhost:8080/api`
* **Prefixo de Clientes**: `/clients`

---

## 2. Especificação dos Endpoints

### 2.1. Criar Cliente
Cria um novo cliente para a empresa do usuário autenticado.

* **Método**: `POST`
* **Rota**: `/clients`
* **Content-Type**: `application/json`
* **Corpo da Requisição (Request Body)**:
```json
{
  "full_name": "João da Silva",
  "email": "joao@email.com",
  "phone": "11988887777",
  "birth_date": "1990-05-15",
  "cpf": "12345678901",
  "rg": "123456789",
  "cnh": "12345678901"
}
```
* > [!NOTE]
  > Os campos `email`, `phone`, `birth_date`, `cpf`, `rg` e `cnh` são opcionais. Caso não informados, podem ser omitidos ou enviados como `null` ou strings vazias. Se preenchidos, os dados de identificação e contato de CPF, RG, CNH e E-mail devem ser únicos por empresa. O CPF e Telefone devem ser enviados limpos (apenas números).

* **Respostas**:
  * **201 Created**: Cliente criado com sucesso.
    ```json
    {
      "id": "a58742b6-dc04-4b5a-be44-c689d04bfde6",
      "company_id": "87c4bf7f-4428-48b9-8e4a-5fcf1cbe04a4",
      "full_name": "João da Silva",
      "email": "joao@email.com",
      "phone": "11988887777",
      "birth_date": "1990-05-15T00:00:00Z",
      "cpf": "12345678901",
      "rg": "123456789",
      "cnh": "12345678901",
      "status": "ACTIVE",
      "created_at": "2026-05-20T11:00:00Z",
      "updated_at": "2026-05-20T11:00:00Z"
    }
    ```
  * **400 Bad Request**: Dados inválidos ou ausentes (ex: `full_name` em branco).
    ```json
    {
      "error": "BAD_REQUEST",
      "message": "o nome completo do cliente é obrigatório"
    }
    ```
  * **409 Conflict**: Algum dos campos opcionais únicos informados já está cadastrado para outro cliente na mesma empresa.
    ```json
    {
      "error": "CONFLITO",
      "message": "este CPF já está cadastrado para outro cliente nesta empresa"
    }
    ```

---

### 2.2. Listar Clientes
Retorna a listagem paginada de clientes pertencentes à empresa autenticada.

* **Método**: `GET`
* **Rota**: `/clients`
* **Query Parameters (Opcionais)**:
  * `search` (string): Busca por nome completo (busca aproximada), e-mail ou CPF.
  * `status` (string): Filtra pelo status do cliente (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
  * `page` (int): Número da página (padrão: `1`).
  * `limit` (int): Quantidade de registros por página (padrão: `10`).

* **Respostas**:
  * **200 OK**:
    ```json
    {
      "data": [
        {
          "id": "a58742b6-dc04-4b5a-be44-c689d04bfde6",
          "company_id": "87c4bf7f-4428-48b9-8e4a-5fcf1cbe04a4",
          "full_name": "João da Silva",
          "email": "joao@email.com",
          "phone": "11988887777",
          "birth_date": "1990-05-15T00:00:00Z",
          "cpf": "12345678901",
          "rg": "123456789",
          "cnh": "12345678901",
          "status": "ACTIVE",
          "created_at": "2026-05-20T11:00:00Z",
          "updated_at": "2026-05-20T11:00:00Z"
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

### 2.3. Obter Detalhes do Cliente
Retorna os detalhes de um único cliente pelo ID.

* **Método**: `GET`
* **Rota**: `/clients/:id`

* **Respostas**:
  * **200 OK**: Dados completos do cliente.
  * **404 Not Found**: Cliente não encontrado ou não pertence à empresa autenticada.
    ```json
    {
      "error": "cliente não encontrado"
    }
    ```

---

### 2.4. Atualizar Cliente
Atualiza os dados de um cliente existente.

* **Método**: `PUT`
* **Rota**: `/clients/:id`
* **Content-Type**: `application/json`
* **Corpo da Requisição (Request Body)**: Mesma estrutura do `POST` (criar cliente).
* **Respostas**:
  * **200 OK**: Cliente atualizado com sucesso.
  * **400 Bad Request**: Dados inválidos.
  * **404 Not Found**: Cliente não encontrado.
  * **409 Conflict**: Um dos campos únicos informados pertence a outro cliente cadastrado.

---

### 2.5. Remover (Desativar) Cliente
Executa a desativação lógica (soft delete) de um cliente, se ele não possuir processos vinculados.

* **Método**: `DELETE`
* **Rota**: `/clients/:id`

* **Respostas**:
  * **200 OK**: Cliente desativado logicamente com sucesso.
    ```json
    {
      "message": "Cliente desativado com sucesso.",
      "id": "a58742b6-dc04-4b5a-be44-c689d04bfde6",
      "status": "INACTIVE"
    }
    ```
  * **400 Bad Request**: O cliente possui processos vinculados na empresa e não pode ser removido, ou cliente não encontrado.
    ```json
    {
      "error": "O cliente está vinculado a um processo e não pode ser removido."
    }
    ```
  * **404 Not Found**: Cliente não encontrado ou não pertence a esta empresa.
