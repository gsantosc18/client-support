# Database Specification: Client CRUD

Este documento especifica a estrutura física do banco de dados PostgreSQL relacionada à feature de Clientes.

---

## 1. Definições Físicas de Tabelas

### 1.1. Tabela: `clients`
Armazena as informações cadastrais dos clientes atendidos pelas empresas.

```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    birth_date DATE,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    cnh VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restrições de Unicidade de Escopo (Multi-Tenancy)
    -- Permite múltiplos registros NULL para colunas UNIQUE no PostgreSQL
    CONSTRAINT uq_client_company_email UNIQUE (company_id, email),
    CONSTRAINT uq_client_company_cpf UNIQUE (company_id, cpf),
    CONSTRAINT uq_client_company_rg UNIQUE (company_id, rg),
    CONSTRAINT uq_client_company_cnh UNIQUE (company_id, cnh),
    
    -- Validação do Enum de Status do Cliente
    CONSTRAINT chk_client_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);
```

---

## 2. Índices e Otimização de Performance

Os índices a seguir são essenciais para otimizar as buscas no banco de dados e garantir a alta performance das listagens paginadas com filtros.

### 2.1. Índice para Busca Textual (Nome)
```sql
CREATE INDEX idx_clients_company_name ON clients (company_id, full_name);
```

### 2.2. Índices Parciais de Unicidade
Melhora a velocidade da validação de unicidade de documentos, ignorando valores nulos para economizar espaço de indexação.
```sql
CREATE INDEX idx_clients_company_cpf ON clients (company_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_clients_company_email ON clients (company_id, email) WHERE email IS NOT NULL;
```

---

## 3. Integridade Referencial em Deleções

### 3.1. Tabela `processes` (Relação com `clients`)
Garante que a deleção de um cliente seja bloqueada no banco de dados em nível de integridade se houver processos referenciando o cliente.
```sql
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    external_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_process_company_external UNIQUE (company_id, external_id),
    CONSTRAINT chk_process_status CHECK (status IN ('STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);
```
O campo `client_id` na tabela `processes` possui a constraint `ON DELETE RESTRICT`. Isso impede a remoção física do cliente.
Como trabalhamos com Soft Delete (`status = 'INACTIVE'`), a lógica de integridade de processos no domínio deve bloquear a transição de status para `INACTIVE` caso existam registros na tabela `processes` com aquele `client_id`.

---

## 4. Trigger de Atualização Automática de `updated_at`
Toda modificação nas tabelas deve disparar a atualização automática do campo `updated_at` via GORM (ou trigger a nível de banco de dados).
No backend em Go com GORM, isso é resolvido nativamente ao usar `Save()` ou callbacks estruturados de modelo.
