# DATABASE_SPEC.md - Estrutura de Tabelas e Relacionamentos

## 1. Tabela: `documents`
Armazena a referência física e os metadados dos arquivos e mídias vinculados a processos da companhia inquilina.

```sql
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    process_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Chaves Estrangeiras & Constraints
    CONSTRAINT fk_documents_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_process FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
    CONSTRAINT fk_documents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
```

---

## 2. Índices de Otimização
*   **`idx_documents_process_company`**: Índice composto em `(process_id, company_id)` acelerando consultas e buscas de arquivos por processo sob estrito isolamento multi-tenant.
```sql
CREATE INDEX IF NOT EXISTS idx_documents_process_company ON documents(process_id, company_id);
```
