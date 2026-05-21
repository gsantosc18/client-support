# Especificação de Banco de Dados: DATABASE_SPEC.md

Esta especificação define o modelo de dados relacional e a arquitetura física no PostgreSQL para o sistema de suporte ao cliente.

---

## 1. Visão Geral da Arquitetura do Banco de Dados
* **SGBD**: PostgreSQL
* **Padronização de Chaves**: UUIDv4 para todas as chaves primárias.
* **Fuso Horário**: Todos os campos de timestamp devem armazenar fuso horário (`TIMESTAMP WITH TIME ZONE` ou `TIMESTAMPTZ`) e serem persistidos em **UTC**.
* **Integridade Referencial**: Uso estrito de chaves estrangeiras com ações de `ON DELETE RESTRICT` em relacionamentos principais para evitar deleções acidentais de tenants.

---

## 2. Modelagem das Tabelas

### 2.1. Tabelas Existentes (Referência)

#### Tabela: `companies`
Representa o tenant (empresa) na plataforma.
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `users`
Representa os operadores/usuários do sistema vinculados a uma empresa.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    birth_date DATE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hash BCrypt
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_company_email UNIQUE (company_id, email)
);
```

---

### 2.2. Novas Tabelas (Domínio de Suporte)

#### Tabela: `clients`
Representa os clientes atendidos pelas empresas. Os campos de identificação (CPF, RG, CNH) e de contato (E-mail) são opcionais, mas **únicos por empresa** se fornecidos.

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
    
    -- Restrições de Unicidade escopadas por empresa (Multi-Tenancy)
    -- O PostgreSQL permite múltiplos registros NULL para colunas com restrição UNIQUE
    CONSTRAINT uq_client_company_email UNIQUE (company_id, email),
    CONSTRAINT uq_client_company_cpf UNIQUE (company_id, cpf),
    CONSTRAINT uq_client_company_rg UNIQUE (company_id, rg),
    CONSTRAINT uq_client_company_cnh UNIQUE (company_id, cnh),
    
    -- Validação do Enum de Status do Cliente
    CONSTRAINT chk_client_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);
```

#### Tabela: `processes`
Representa o registro do atendimento ou processo aberto em plataforma externa.

```sql
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    external_id VARCHAR(255), -- Código na plataforma externa (opcional)
    status VARCHAR(50) NOT NULL DEFAULT 'STARTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restrições de Unicidade
    -- Garante que um mesmo código externo não se repita para a mesma empresa
    CONSTRAINT uq_process_company_external UNIQUE (company_id, external_id),
    
    -- Validação do Enum de Status do Processo (sempre persistido em maiúsculo)
    CONSTRAINT chk_process_status CHECK (status IN ('STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);
```

---

## 3. Índices e Otimização de Consultas

Para assegurar alta performance nas buscas do frontend ( Next.js) que serão realizadas pelas listagens da API, criaremos os seguintes índices adicionais:

### 3.1. Índices para Busca de Clientes
```sql
-- Otimização para filtros por nome completo (busca textual)
CREATE INDEX idx_clients_company_name ON clients (company_id, full_name);

-- Otimização para buscas exatas de documentos (para telas de pesquisa rápida)
CREATE INDEX idx_clients_company_cpf ON clients (company_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_clients_company_email ON clients (company_id, email) WHERE email IS NOT NULL;
```

### 3.2. Índices para Busca de Processos
```sql
-- Filtros frequentes: processos por cliente na mesma empresa
CREATE INDEX idx_processes_company_client ON processes (company_id, client_id);

-- Filtros frequentes: processos por operador (usuário) e status
CREATE INDEX idx_processes_company_user_status ON processes (company_id, user_id, status);

-- Busca por código externo
CREATE INDEX idx_processes_external_id ON processes (company_id, external_id) WHERE external_id IS NOT NULL;
```

---

## 4. Estratégias Transacionais e Regras de Negócio do Banco
1. **Regra de Multi-Tenancy**: Qualquer consulta ou alteração nas tabelas `clients` ou `processes` deve obrigatoriamente incluir a cláusula `WHERE company_id = ?` com o ID da empresa do usuário autenticado obtido na sessão/token JWT.
2. **Atualização automática de `updated_at`**: As alterações nas tabelas devem disparar uma atualização automática do campo `updated_at` (seja por Triggers do PostgreSQL ou controlado a nível de aplicação pelo GORM no backend em Golang).
3. **Deleção Lógica (Soft Delete)**: Para fins de auditoria e segurança, os clientes e processos **não devem ser excluídos fisicamente do banco de dados** via instrução `DELETE`. A desativação deve ocorrer mudando o campo `status` para `INACTIVE` (Soft Delete controlado pelo campo status).
