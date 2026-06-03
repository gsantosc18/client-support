# Database Specification: Containerização de Frontend e Backend

Este documento define os parâmetros de persistência de dados físicos, a alocação de volumes no Docker, e o fluxo de integridade transacional de migrações automáticas.

---

## 1. Mapeamento de Volumes e Persistência Física

A persistência do banco de dados relacional e do sistema de cache chave-valor é mantida externamente ao ciclo de vida dos containers através de volumes nomeados no Docker.

```mermaid
graph TD
    subgraph HostFileSystem [File System do Hospedeiro]
        H_PG[/var/lib/docker/volumes/pgdata/_data]
        H_RD[/var/lib/docker/volumes/redisdata/_data]
        H_ST[./storage]
    end
    subgraph DockerContainers [Containers Isolados]
        C_DB[db: postgres:15-alpine] -->|Montado em /var/lib/postgresql/data| H_PG
        C_RD[redis: redis:7-alpine] -->|Montado em /data| H_RD
        C_BK[backend: golang] -->|Montado em /app/storage| H_ST
    end
```

### 1.1. Volume do PostgreSQL (`pgdata`)
* **Destino no Container**: `/var/lib/postgresql/data`
* **Especificação da Imagem**: `postgres:15-alpine`
* **Justificativa**: A imagem Alpine reduz drasticamente o vetor de ataque no banco de dados por não conter ferramentas extras de shell desnecessárias e ocupa apenas ~80MB de espaço base.

### 1.2. Volume do Redis (`redisdata`)
* **Destino no Container**: `/data`
* **Especificação da Imagem**: `redis:7-alpine`
* **Justificativa**: Mantém as sessões persistentes e chaves de cache em disco de forma otimizada usando AOF/RDB do Redis.

---

## 2. Estratégia Transacional de Migrações (Goose Migrations)

O container `backend` executa o comando `goose -dir ./migrations postgres "$DATABASE_URL" up` como passo de bootstrapping de inicialização.

### Regras de Execução Segura de Migrações:
1. **Idempotência Estrita**: Cada script SQL de migração sob a pasta `migrations/` deve conter verificações de segurança (`IF NOT EXISTS`, `DROP TABLE IF EXISTS`) para prevenir erros em execuções subsequentes.
2. **Abordagem de Transação Única**: O Goose executa cada arquivo de migração dentro de uma transação PostgreSQL dedicada. Se qualquer instrução falhar, a transação inteira sofre rollback automático no banco, impedindo um estado inconsistente ("esquema quebrado parcial").
3. **Bloqueio de Concorrência**: O Goose gerencia uma tabela interna `goose_db_version` no banco de dados para evitar condições de corrida caso múltiplos containers de backend tentem rodar migrações concorrentemente.
