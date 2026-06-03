# Tasks Checklist: Containerização de Frontend e Backend

Este documento serve como a especificação de tarefas executáveis (TODOs) para guiar o trabalho do Desenvolvedor e do QA no processo de containerização.

---

## 1. Tarefas do Backend (Golang)

- [ ] **Configuração do Dockerignore**:
  - Criar/Atualizar `backend/.dockerignore` para ignorar:
    - `.git`
    - `node_modules`
    - Binários locais compilados (`*.exe`, `main`, etc.)
    - Arquivos de cobertura (`coverage.out`)
- [ ] **Refatoração do Dockerfile Multi-Stage**:
  - Atualizar `backend/Dockerfile` para implementar a receita multi-stage (Stage 1: builder com `golang:1.25-alpine` / Stage 2: runner com `alpine:3.19`).
  - Adicionar a criação do grupo `appgroup` e do usuário sem privilégios `appuser`.
  - Configurar as permissões do diretório `/app` para o usuário `appuser`.
- [ ] **Endpoint de Checagem de Saúde (`GET /health`)**:
  - Implementar no backend (Fiber) o handler e a rota `/health` que realiza ping no PostgreSQL e no Redis para expor o status de integridade do container.

---

## 2. Tarefas do Frontend (Next.js)

- [ ] **Configuração do Dockerignore**:
  - Criar/Atualizar `app/.dockerignore` para ignorar:
    - `node_modules`
    - `.next`
    - `.swc`
    - Caches e relatórios de cobertura
- [ ] **Ativar Habilitação Standalone**:
  - Adicionar a configuração `output: 'standalone'` no arquivo `app/next.config.mjs`.
- [ ] **Refatoração do Dockerfile Multi-Stage**:
  - Atualizar `app/Dockerfile` implementando o build de três estágios: `deps`, `builder` e `runner`.
  - Copiar para o estágio final apenas os diretórios públicos, estáticos e a pasta `.next/standalone`.
  - Definir o usuário de runtime restrito como o usuário pré-existente `nextjs` no Node Alpine.

---

## 3. Tarefas de Orquestração e Makefile

- [ ] **Ajuste do Docker Compose (`docker-compose.yml`)**:
  - Certificar que o container `db` possui a checagem de saúde funcional via `pg_isready`.
  - Ajustar a declaração `depends_on` do backend para aguardar a condição `service_healthy` do `db`.
  - Adicionar volume nomeado persistente para o banco de dados (`pgdata`) e para o Redis (`redisdata`).
- [ ] **Ajuste do Makefile**:
  - Garantir que as regras `infra`, `up`, `down` e `clean` estão alinhadas com as receitas corretas do Docker Compose.

---

## 4. Tarefas de QA (Testes e Validação)

- [ ] **Validação de Startup Completa**:
  - Executar `make infra` no terminal host e atestar se todos os quatro containers inicializam com sucesso e ficam no estado `running` estável por mais de 30 segundos.
- [ ] **Verificação de Healthcheck**:
  - Disparar requisições para `GET http://localhost:8080/health` e conferir se o JSON de integridade retorna com sucesso e latências válidas.
- [ ] **Auditoria de Usuários (Não-Raiz)**:
  - Validar que os processos dentro do container do backend e frontend não rodam como `root` rodando o comando:
    ```shell
    docker compose exec backend whoami
    docker compose exec app whoami
    ```
    *(Esperado: `appuser` para backend e `nextjs` para frontend).*
- [ ] **Auditoria de Tamanho de Imagem**:
  - Executar `docker images` e atestar se o tamanho final da imagem do backend é menor que **50MB** e a do frontend é menor que **180MB**.
