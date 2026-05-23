# Domain Specification — Alinhamento da Página de Listagem

Este documento descreve as entidades de visão e os estados do domínio que são expostos na interface das listagens.

---

## 1. Contexto Delimitado e Entidades

O alinhamento visual de listagens opera no contexto de apresentação das entidades de domínio já existentes no sistema:

* **Cliente (Client):** Conforme definido em `specs/client_crud/DOMAIN_SPEC.md`.
* **Processo (Process):** Conforme definido em `specs/process_crud/DOMAIN_SPEC.md`.

---

## 2. Estados da Interface de Listagem

A listagem deve gerenciar os seguintes estados de domínio local/apresentação:

### 2.1. Filtros Ativos (ActiveFilters)
Estrutura que encapsula os parâmetros de busca em vigor:
* `search`: string de busca textual (nome, e-mail, CPF, ou protocolo).
* `status`: string contendo a chave do status ativo (ex: `ACTIVE`, `INACTIVE`, `PENDING`).

### 2.2. Ordenação (SortState)
Representa o estado de ordenação ativo na tabela:
* `field`: campo de ordenação.
* `direction`: direção da ordenação (`asc` | `desc`).

### 2.3. Paginação (PaginationState)
* `page`: página atual.
* `limit`: registros por página (padrão: 10).
* `total_records`: totalizador do banco de dados.
