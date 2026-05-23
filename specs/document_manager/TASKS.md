# TASKS.md - Checklist de Execução do Gerenciador de Documentos

## Backend
- [x] Criar migration do banco de dados na tabela `documents` com constraints FK.
- [x] Abstrair driver de storage com driver Local e S3 robusto.
- [x] Implementar repositório Postgres sob isolamento de `company_id`.
- [x] Implementar service contendo regras de upload, limite de 10MB e deleção física em lixeira do storage.
- [x] Implementar HTTP Handler no Fiber tratando multipart/form-data e downloads streamados por buffer.
- [x] Bootstrapping no `main.go`.

## Frontend
- [x] Criar interface `ProcessDocument` refletindo metadados.
- [x] Criar serviço Axios para requisições REST multipart/form-data e Blob.
- [x] Criar hook customizado `useProcessDocuments` para isolar estados reativos de uploads, deletes e downloads.
- [x] Desenvolver componente raiz `ProcessDocuments.tsx` da aba de documentos.
- [x] Desenvolver modal de Upload com suporte a Drag & Drop e preenchimento de nome inteligente.
- [x] Desenvolver modal de Edição de arquivo e modal secundário de segurança exigindo termo `"alterar documento"`.
- [x] Desenvolver modal de exclusão e visualizador embutido protegido com JWT para PDFs e Imagens.
- [x] Integrar seletor de abas na página de detalhes de processos.
