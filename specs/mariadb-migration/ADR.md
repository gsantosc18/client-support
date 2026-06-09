ADR-007
Migração de Banco de Dados de PostgreSQL para MariaDB

Contexto
O sistema de Client Support foi inicialmente projetado utilizando o PostgreSQL 15 como banco de dados principal. Entretanto, por requisitos operacionais e de infraestrutura do cliente, faz-se necessário substituir o PostgreSQL pelo MariaDB.
O banco de dados armazena dados críticos estruturados e utiliza recursos específicos do PostgreSQL, como UUIDs gerados automaticamente via extensão `uuid-ossp`, índices parciais (filtrados) e colunas `JSONB`.
Para suportar o MariaDB, precisamos garantir que o mapeamento objeto-relacional (GORM) e a execução das migrações de esquema (Goose) funcionem corretamente sob o dialeto do MariaDB/MySQL.

Decisão
1. **Substituição do Banco e Driver**: Substituiremos a imagem do banco no Docker Compose e Docker Swarm pelo MariaDB 10.11. O driver de banco de dados do GORM no backend em Golang será alterado de `gorm.io/driver/postgres` para `gorm.io/driver/mysql`.
2. **Compatibilidade de UUID e JSON**:
   - Os campos de tipo `uuid.UUID` nas entidades de domínio em Golang serão mapeados no banco como `CHAR(36)` com valor padrão `(UUID())` para garantir integridade e compatibilidade entre plataformas.
   - As colunas de log com dados JSON (como na tabela `deleted_clients` e `deleted_processes`) serão migradas de `JSONB` no Postgres para `JSON` no MariaDB.
3. **Migrações Goose**: Adaptaremos todos os arquivos de migração existentes em `backend/migrations/*.sql` para a sintaxe compatível com MariaDB/MySQL e atualizaremos a chamada do runner Goose no `Dockerfile` para usar o dialeto `mysql`.
4. **Preservação de Caminhos de Código**: Para minimizar o risco de quebras de importação no backend, manteremos a pasta `internal/repository/postgres` com as implementações dos repositórios via GORM, pois as chamadas do GORM são agnósticas quanto ao dialeto SQL básico. Apenas o driver de inicialização no `main.go` e os testes de integração serão modificados para usar MariaDB.

Consequências
* **Positivas**:
  - Alinhamento da stack com a infraestrutura de banco de dados exigida.
  - Adoção de tipos de dados eficientes (`CHAR(36)` e `JSON`) suportados nativamente pelo MariaDB.
  - Preservação da integridade de negócios e de todas as regras de domínio.
* **Negativas / Desafios**:
  - Necessidade de atualizar e adaptar as migrações legadas no repositório.
  - Ajuste nas configurações de DSN nos arquivos de ambiente e Docker.
