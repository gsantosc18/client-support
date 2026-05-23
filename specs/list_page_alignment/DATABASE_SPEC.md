# Database Specification — Alinhamento da Página de Listagem

Este documento descreve o suporte a nível de banco de dados para indexação e filtragem das listagens. Nenhuma tabela é criada ou excluída.

---

## 1. Tabelas Consultadas

### 1.1. Tabela `clients`
Campos indexados e utilizados nas cláusulas de filtros e buscas (`WHERE`):
* `full_name` (Text Search)
* `email` (B-Tree index)
* `cpf` (B-Tree index)
* `status` (B-Tree index)

### 1.2. Tabela `processes`
Campos indexados e utilizados nas cláusulas de filtros (`WHERE`):
* `protocol` (B-Tree index)
* `status` (B-Tree index)
