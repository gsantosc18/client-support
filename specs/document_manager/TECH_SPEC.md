# TECH_SPEC.md - Arquitetura Técnica

## 1. Módulos & Divisão de Camadas (Backend)
O desenvolvimento seguiu estritamente os padrões de Clean Architecture definidos na raiz de `backend`:
*   `internal/domain/document.go`: Definições das entidades de metadados de documentos e interfaces de repositório.
*   `internal/domain/storage.go`: Abstração abstrata `FileStorage` para manipulação física em nuvem/disco.
*   `internal/storage/local.go`: Implementação física do driver de storage em disco local, gravando no diretório `./storage` e gerenciando arquivos `.tag` para meta-tags de lixeira.
*   `internal/storage/s3.go`: Driver oficial AWS SDK v2 operando uploads/deleções com tags de controle no Amazon S3.
*   `internal/repository/postgres/document_repository.go`: CRUD via GORM garantindo filtragem e isolamento multi-tenant (`company_id`).
*   `internal/service/document.go`: Orquestração de regras de negócio, validações de tamanho/extensão e tratamento de lixeira física do storage.
*   `internal/handlers/http/document_handler.go`: Endpoints HTTP com Fiber tratando multipart-uploads e buffers performáticos de streaming para download seguro.

---

## 2. Tecnologias & Dependências
*   **AWS SDK Go v2**: `github.com/aws/aws-sdk-go-v2` e sub-módulos para upload/download no bucket S3.
*   **GORM**: Mapeamento objeto-relacional no PostgreSQL.
*   **Fiber**: Framework HTTP de alta performance.
*   **TypeScript / React 18 / Next.js 14**: Frontend reativo.
