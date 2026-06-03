# API Specification: Containerização de Frontend e Backend

Este documento mapeia as interfaces de rede, portas expostas, variáveis de ambiente configuráveis e o contrato dos endpoints de monitoramento de integridade (health checks) dos containers.

---

## 1. Mapeamento de Portas e Exposição de Serviços

Os containers comunicam-se entre si via rede interna do Docker (Bridge default do compose) e expõem portas específicas para o Host local.

| Container | Porta Interna | Porta Exposta (Host) | Protocolo | Escopo de Acesso |
|---|---|---|---|---|
| `db` | 5432 | 5432 | TCP | Localhost (Desenvolvimento) |
| `redis` | 6379 | 6379 | TCP | Interno à Rede Docker |
| `backend` | 8080 | 8080 | TCP / HTTP | Externo (Client Browser / Postman) |
| `app` | 3000 | 3000 | TCP / HTTP | Externo (Navegador do Usuário) |

---

## 2. Contrato do Endpoint de Checagem de Saúde (Healthcheck API)

Para monitorar e automatizar a orquestração e auto-recuperação (Self-Healing) dos containers, o backend implementa um endpoint público de integridade:

### `GET /health`
Verifica se as dependências cruciais de infraestrutura (PostgreSQL e Redis) estão ativas e respondendo dentro do tempo aceitável.

* **Request**: Sem parâmetros.
* **Headers**: Nenhum header de autenticação é requerido para este endpoint.

#### Response de Sucesso: `HTTP 200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-06-02T09:40:00Z",
  "services": {
    "database": {
      "status": "up",
      "latency_ms": 2
    },
    "redis": {
      "status": "up",
      "latency_ms": 1
    }
  }
}
```

#### Response de Falha: `HTTP 503 Service Unavailable`
Se o banco de dados ou o redis estiverem inacessíveis, o container deve responder falha para avisar os orquestradores (como Docker Compose ou Kubernetes).
```json
{
  "status": "unhealthy",
  "timestamp": "2026-06-02T09:40:00Z",
  "services": {
    "database": {
      "status": "down",
      "error": "connection refused"
    },
    "redis": {
      "status": "up",
      "latency_ms": 1
    }
  }
}
```

---

## 3. Contratos de Configuração via Environment Variables

Cada container lê sua parametrização do ambiente. Os seguintes contratos devem ser mantidos nas configurações:

### Backend Environment Variables
* `DATABASE_URL`: String de conexão GORM no formato `host=db user=root password=rootpassword dbname=client_support port=5432 sslmode=disable TimeZone=UTC`. Note que o host do banco de dados aponta para o nome do serviço no docker-compose (`db`), aproveitando a resolução automática de DNS interno do Docker.
* `REDIS_URL`: Endereço no formato `redis:6379`.
* `LOCAL_STORAGE_PATH`: Caminho absoluto dentro do container (`/app/storage`) onde os uploads serão gravados antes da persistência no volume local.

### Frontend Environment Variables
* `NEXT_PUBLIC_API_URL`: Aponta para o endereço público da API resolvido pelo navegador do cliente: `http://localhost:8080/api`.
* `PORT`: Configura a porta interna do Next.js Standalone (padrão: 3000).
