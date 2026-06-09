# Tarefas de Desenvolvimento do Header Dinâmico com Cache de Empresa

Este documento contém o checklist de tarefas para implementar o cabeçalho dinâmico integrado ao backend com cache no cliente e servidor.

---

## Backend

- [ ] **Criar Repositório Decorador em Redis**:
  - [ ] Implementar `CompanyRepository` em `backend/internal/repository/redis/company_repository.go` envolvendo o repositório DB e o Redis client, com TTL de 24 horas.
  - [ ] Criar testes unitários para a funcionalidade de cache em `backend/internal/repository/redis/company_repository_test.go`.
- [ ] **Configurar Repositórios no main.go**:
  - [ ] No arquivo `backend/cmd/api/main.go`, alterar a inicialização do `companyRepo` para instanciar o decorador Redis.
- [ ] **Criar Serviço e Handler da Empresa**:
  - [ ] Implementar `CompanyService` em `backend/internal/service/company.go` expondo a busca por ID da empresa.
  - [ ] Criar testes para o `CompanyService` em `backend/internal/service/company_test.go`.
  - [ ] Implementar `CompanyHandler` em `backend/internal/handlers/http/company_handler.go` respondendo na rota `/api/company` (protegida por JWT).
- [ ] **Registrar Rotas no main.go**:
  - [ ] No arquivo `backend/cmd/api/main.go`, inicializar `companyService`, `companyHandler` e mapear `GET /api/company`.

---

## Frontend

- [ ] **Estender Estado no Redux**:
  - [ ] No arquivo `app/src/state/authStore.ts`, estender a interface `AuthState` com `companyName` e inicializar lendo do localStorage/sessionStorage.
  - [ ] Criar a action `setCompany` para salvar no Redux e persistir no respectivo storage da sessão.
  - [ ] Garantir que o reducer `logout` apague as chaves de empresa do Web Storage.
- [ ] **Criar Serviço e Hook de Empresa**:
  - [ ] Criar `app/src/features/company/services/company.service.ts` contendo a chamada à API `/company`.
  - [ ] Criar `app/src/features/company/hooks/useCompany.ts` contendo a lógica de cache reativo (verifica Redux/Web Storage, faz fetch se necessário).
- [ ] **Criar Componente Header Reaproveitável**:
  - [ ] Criar o componente global `app/src/components/Header.tsx` consumindo o hook de empresa e de autenticação, exibindo a barra superior estilizada.
- [ ] **Substituir Headers Duplicados nas Páginas**:
  - [ ] Substituir o cabeçalho estático no arquivo `app/src/features/clients/pages/ClientListPage.tsx` pelo novo componente `<Header />`.
  - [ ] Substituir o cabeçalho estático no arquivo `app/src/features/processes/pages/ProcessListPage.tsx` pelo novo componente `<Header />`.

---

## Qualidade e Testes (QA)

- [ ] **Criar Testes E2E com Cypress**:
  - [ ] Criar arquivo `cypress/e2e/app/company_header.cy.ts` validando o fluxo de exibição do nome da empresa e funcionamento correto do cache no localStorage/sessionStorage.
  - [ ] Testar a limpeza de cache ao fazer logout.
- [ ] **Testes Regressivos**:
  - [ ] Validar a integridade geral do sistema após a refatoração do header e execução dos testes existentes.
