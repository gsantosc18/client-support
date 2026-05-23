# Database Specification: Process Annotations

Este documento descreve a modelagem lógica e física do banco de dados (PostgreSQL) para suportar o armazenamento e consultas rápidas de Anotações de Processo.

---

## 1. Esquema da Tabela: `annotations`

A tabela `annotations` guardará as notas vinculadas a cada caso. Ela utiliza chaves do tipo `UUID` para assegurar o alinhamento com a arquitetura do projeto.

### 1.1. Definição de Colunas

| Coluna | Tipo de Dados | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY, DEFAULT `uuid_generate_v4()` | Chave primária da anotação. |
| `process_id` | `UUID` | NOT NULL, FOREIGN KEY -> `processes(id)` ON DELETE CASCADE | Vínculo com o processo. |
| `company_id` | `UUID` | NOT NULL, FOREIGN KEY -> `companies(id)` ON DELETE CASCADE | ID da empresa (multitenancy). |
| `user_id` | `UUID` | NOT NULL, FOREIGN KEY -> `users(id)` ON DELETE CASCADE | ID do usuário autor da anotação. |
| `annotation` | `TEXT` | NOT NULL | Texto do comentário de acompanhamento. |
| `visibility` | `VARCHAR(10)` | NOT NULL, DEFAULT `'PUBLIC'`, CHECK `(visibility IN ('PUBLIC', 'PRIVATE'))` | Regra de visibilidade da nota. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Carimbo de data/hora de criação. |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `CURRENT_TIMESTAMP` | Carimbo de data/hora de atualização. |

---

## 2. Índices e Performance

Para garantir consultas rápidas no banco de dados com isolamento por tenant e ordenação cronológica reversa, serão criados os seguintes índices:

1. **Índice Composto de Consulta (`idx_annotations_process_created`)**:
   * **Campos**: `(process_id, created_at DESC)`
   * **Objetivo**: Acelera o carregamento das notas na tela de detalhes do processo, já retornando ordenadas da mais recente para a mais antiga.
2. **Índice de Segurança/Tenant (`idx_annotations_company`)**:
   * **Campos**: `(company_id)`
   * **Objetivo**: Garante isolamento estrito de dados e performance nas varreduras administrativas ou filtros de auditoria por empresa.

---

## 3. Script de Migração de Referência (Goose)

Este script SQL serve como modelo para o arquivo de migração na pasta `backend/migrations/`:

```sql
-- +goose Up
-- SQL in this section is executed when the migration is applied.
CREATE TABLE annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL,
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    annotation TEXT NOT NULL,
    visibility VARCHAR(10) NOT NULL DEFAULT 'PUBLIC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_annotations_process FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE,
    CONSTRAINT fk_annotations_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_annotations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_annotations_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE'))
);

CREATE INDEX idx_annotations_process_created ON annotations (process_id, created_at DESC);
CREATE INDEX idx_annotations_company ON annotations (company_id);

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
DROP TABLE IF EXISTS annotations;
```
