# Database Specification — Alinhamento de Páginas de Formulário

Este documento descreve os relacionamentos no banco de dados que dão suporte aos formulários de cadastro. Este alinhamento é estritamente de arquitetura frontend; nenhuma migração ou alteração de tabela no PostgreSQL é executada.

---

## 1. Tabelas Consultadas

As transações dos formulários refletem-se diretamente nas seguintes tabelas relacionais do backend:

### A. Tabela `clients`
- Armazena as informações básicas cadastrais dos clientes.
- Valida restrições exclusivas (`UNIQUE`) nos campos `cpf` e `email` a nível de banco de dados.

### B. Tabela `processes`
- Armazena metadados do processo.
- Possui chaves estrangeiras (`FK`) apontando para:
  - `users` (campo `user_id`, obrigatório)
  - `establishments` (campo `establishment_id`, obrigatório)

### C. Tabela Associativa `client_processes`
- Tabela de ligação many-to-many que relaciona um processo a múltiplos clientes (`client_id`, `process_id`).
- Criada e gerida automaticamente pelo backend quando o array `client_ids` é submetido.
