# API Specification — Alinhamento da Página de Listagem

Este documento descreve os contratos de API consumidos pelas páginas de listagem. Não há alterações nos contratos existentes do backend; esta especificação formaliza a integração com os filtros do frontend.

---

## 1. Clientes

* **Endpoint:** `GET /api/v1/clients`
* **Query Parameters:**
  * `search` (string): Busca por nome, CPF ou e-mail.
  * `status` (string): Status do cliente (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
  * `page` (integer): Número da página.
  * `limit` (integer): Quantidade de registros por página.

---

## 2. Processos

* **Endpoint:** `GET /api/v1/processes`
* **Query Parameters:**
  * `protocol` (string): Código de protocolo do processo.
  * `status` (string): Status do processo (`PENDING`, `IN_PROGRESS`, `AWAITING_DOCUMENTATION`, etc.).
  * `page` (integer): Número da página.
  * `limit` (integer): Quantidade de registros por página.
