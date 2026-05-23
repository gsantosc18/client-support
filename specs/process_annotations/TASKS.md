# Executable Tasks: Process Annotations

Este checklist detalha as atividades obrigatórias para os próximos agentes na implementação da funcionalidade de Anotações de Processo.

---

## Backend (Desenvolvedor)

- [ ] **Banco de Dados**: Criar o arquivo de migração Goose SQL na pasta `backend/migrations/` para criar a tabela `annotations` e seus respectivos índices (`idx_annotations_process_created` e `idx_annotations_company`), além de chaves estrangeiras com cascateamento na deleção.
- [ ] **Modelo de Domínio**: Criar a struct `Annotation`, constantes de visibilidade e assinatura das interfaces de repositório em `backend/internal/domain/annotation.go`.
- [ ] **Repositório GORM**: Implementar a struct `AnnotationRepository` em `backend/internal/repository/postgres/annotation_repository.go` contendo as consultas e regras de filtragem estrita baseada em tenant (`company_id` do processo).
- [ ] **Camada de Serviço**: Criar `AnnotationService` em `backend/internal/service/annotation_service.go` aplicando as validações de 15 minutos, consistência de `CompanyID` e checagem de ownership para escrita.
- [ ] **Handler e Rotas**:
  - [ ] Criar `AnnotationHandler` em `backend/internal/handlers/http/annotation_handler.go` mapeando payloads e retornos JSON.
  - [ ] Registrar as novas rotas protegidas pelo middleware JWT no arquivo de inicialização de rotas do backend.
- [ ] **Injeção de Dependências**: Registrar as instâncias de repositório, serviço e handler na inicialização global do app.

---

## Frontend (Desenvolvedor)

- [ ] **Serviço de Comunicação**: Criar os métodos de integração HTTP em `app/src/features/processes/services/annotationService.ts`.
- [ ] **Hooks de React Query**: Implementar o hook `useProcessAnnotations` em `app/src/features/processes/hooks/useProcessAnnotations.ts` cobrindo query de listagem e mutations de criação, alteração e exclusão física.
- [ ] **Formulário de Inclusão**: Criar o componente `AnnotationForm.tsx` com input textarea (limite visual de 2000 caracteres) e dropdown para seleção de visibilidade.
- [ ] **Card de Anotação**:
  - [ ] Criar o componente `AnnotationCard.tsx` com tratamento visual diferenciado (badges) para visibilidade pública e privada.
  - [ ] Implementar temporizador interno de 30 segundos para cálculo e ocultação dinâmica dos botões de editar/deletar após 15 minutos da criação.
  - [ ] Implementar formulário in-line e modal simples de confirmação para a deleção física.
- [ ] **Integração de Tela**: Incluir a seção de anotações no rodapé do container de detalhes de processo.

---

## Qualidade e Testes (QA)

- [ ] **Testes Unitários Backend**: Desenvolver testes unitários para a camada de serviços em Go, cobrindo com precisão as tentativas de alteração após 15 minutos e checagens de ownership.
- [ ] **Testes de Integração de API**: Criar testes automatizados de integração na API para certificar a exposição correta de anotações privadas a todos os usuários da mesma companhia do processo.
- [ ] **Testes E2E (Cypress)**:
  - [ ] Escrever casos de teste E2E na pasta `cypress/e2e/` simulando o fluxo completo de adição, edição inline e exclusão física das anotações.
  - [ ] Validar o desaparecimento automático dos botões após o tempo regulamentar configurando mock temporal ou fixture controlada.

---

## Documentação (Documentador)

- [ ] **Documentação do Backend**: Atualizar a documentação técnica da base de dados e os contratos OpenAPI/Swagger com os novos endpoints de anotações em `docs/backend/`.
- [ ] **Documentação do Frontend**: Atualizar a documentação de componentes do design system detalhando os estados visuais dos badges e o comportamento do temporizador reativo em `docs/frontend/`.
