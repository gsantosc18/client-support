# Especificação do Banco de Dados e Cache: Empresa

Este documento descreve as tabelas físicas do banco de dados relacional (MariaDB) e o esquema de armazenamento de cache chave-valor (Redis) utilizados nesta feature.

---

## 1. Banco de Dados Relacional (MariaDB)

Esta feature utiliza a tabela existente `companies` e seus relacionamentos.

### Tabela `companies`

| Campo | Tipo | Nullable | Padrão | Descrição |
|---|---|---|---|---|
| `id` | `char(36)` | `NOT NULL` | (Chave Primária) | Identificador único da empresa (UUID) |
| `name` | `varchar(255)` | `NOT NULL` | | Nome comercial/cadastrado da empresa |
| `status` | `varchar(50)` | `NOT NULL` | `'ACTIVE'` | Estado operacional (`ACTIVE` / `INACTIVE`) |
| `created_at` | `datetime` | `YES` | | Data/hora de inserção |
| `updated_at` | `datetime` | `YES` | | Data/hora de modificação |

### Relacionamentos e Restrições Físicas

* A tabela `users` possui `company_id CHAR(36) NOT NULL` referenciando `companies(id)` via chave estrangeira.
* A tabela `clients` possui `company_id CHAR(36) NOT NULL` referenciando `companies(id)`.
* A tabela `processes` possui `company_id CHAR(36) NOT NULL` referenciando `companies(id)`.

---

## 2. Estrutura do Cache NoSQL (Redis)

O cache de banco de dados reduz a latência da consulta das informações do tenant.

### Chaves de Cache

* **Formato**: `company:<company_uuid>`
* **Tipo de Dado**: String (JSON Serializado)
* **Tempo de Expiração (TTL)**: `24 horas` (86400 segundos)

### Exemplo de Conteúdo no Redis

Para a chave `company:e9db195c-7d9a-4c2c-8cb0-cf324976722d`:

```json
{
  "id": "e9db195c-7d9a-4c2c-8cb0-cf324976722d",
  "name": "Empresa Alfa",
  "status": "ACTIVE",
  "created_at": "2026-06-09T06:00:00Z",
  "updated_at": "2026-06-09T06:30:00Z"
}
```

### Invalidação do Cache

* O cache expira automaticamente em 24 horas.
* *Nota*: Para futuras implementações de atualização de dados cadastrais da empresa, o cache correspondente àquela chave deverá ser deletado (`DEL company:<uuid>`) no mesmo fluxo de alteração de banco de dados para garantir consistência.
