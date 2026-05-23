# Tasks: Process & Establishment CRUD

Este arquivo lista todas as tarefas executáveis necessárias para o agente **Desenvolvedor** e subsequentes implementarem o CRUD completo de Processos e Estabelecimentos.

---

## 1. Banco de Dados & Migrações
- [x] Criar arquivo de migração Goose `backend/migrations/20260522000000_create_establishments_and_update_processes.sql`.
- [x] Executar a migração do banco de dados localmente.
- [ ] Criar arquivo de migração Goose `backend/migrations/20260522000100_create_deleted_processes.sql` criando a tabela `deleted_processes`.
- [ ] Executar a migração do banco de dados localmente.

---

## 2. Backend (Golang)

### Camada de Domínio
- [x] Atualizar a interface `UserRepository` em `user.go` adicionando `FindAllByCompany(companyID uuid.UUID) ([]*User, error)`.
- [x] Implementar `FindAllByCompany` em `backend/internal/repository/postgres/user_repository.go`.
- [ ] Adicionar a struct `DeletedProcess` em `backend/internal/domain/process.go`.

### Camada de Repositório
- [ ] Atualizar o método `Delete` do `ProcessRepository` em `backend/internal/repository/postgres/process_repository.go` para implementar a transação atômica de auditoria (gravar em `deleted_processes` em formato JSONB, limpar `client_processes` e deletar fisicamente o processo e o estabelecimento associado).

### Camada de Serviço
- [ ] Criar `backend/internal/service/user.go` com a struct `UserService` contendo o método `ListByCompany(companyID uuid.UUID) ([]*domain.User, error)`.

### Camada de Handlers & Rotas
- [ ] Criar `backend/internal/handlers/http/user_handler.go` contendo o controlador para o endpoint de usuários.
- [ ] Registrar a rota `GET /api/users` protegida por JWT em `backend/cmd/api/main.go`.

---

## 3. Frontend (Next.js + Tailwind)

### Camada de Serviços e Hooks
- [ ] Criar `app/src/features/processes/services/user.service.ts` contendo o consumo da listagem de operadores.
- [ ] Criar hook `app/src/features/processes/hooks/useUsers.ts` para carregar a listagem de usuários responsáveis no formulário.

### Componentes de Interface
- [ ] Implementar a modal de seleção de clientes por checkbox no `ProcessForm.tsx` disparada por um botão "Adicionar Clientes", permitindo selecionar e desselecionar de forma unificada.
- [ ] Implementar selects pesquisáveis com mini-input local de filtro em tempo real para os campos de "Estabelecimento" e "Responsável".
- [ ] Habilitar o select de `status` em ambas as telas (criação e edição) do `ProcessForm.tsx`, definindo "PENDING" por padrão para novos processos.

### Páginas de Navegação
- [ ] Atualizar `ProcessListPage.tsx` para:
  - Adicionar o botão flutuante de "Adicionar Processo" ao lado esquerdo no topo.
  - Adicionar o ícone de filtro no topo da tabela.
  - Implementar cabeçalhos clicáveis com setas de ordenação dinâmica.
  - Implementar a ordenação local de processos na listagem baseado em: Protocolo, Estabelecimento, Clientes Associados, Responsável, Status, Data de Criação e Data de Atualização.
  - Exibir o badge do primeiro nome dos clientes (`c.full_name.split(' ')[0]`).
  - Exibir o badge com o nome do responsável pelo processo.
- [ ] Atualizar `ProcessDetailPage.tsx` para apresentar as informações organizadas nas 4 categorias especificadas: *Informações do Processo*, *Clientes Associados*, *Responsável* e *Estabelecimento*.

---

## 4. QA & Automação
- [ ] Atualizar o teste Cypress `cypress/e2e/app/processes.cy.js` para cobrir o fluxo de busca de clientes via checkboxes na modal, ordenação de colunas da listagem, selects pesquisáveis, exclusão atômica com input defensivo `"delete"` e visualização por categorias.

---

## 5. Atualização da Spec: Estilos e Organização do Formulário
- [ ] Atualizar `ProcessForm.tsx` para mudar a cor de todos os rótulos (labels) para um tom escuro (`text-slate-800` ou `text-slate-900`).
- [ ] Garantir que todos os campos obrigatórios em `ProcessForm.tsx` e `EstablishmentCreateModal.tsx` possuam o asterisco vermelho estilizado com `<span className="text-red-500">*</span>` logo após o texto.
- [ ] Reorganizar o layout de `ProcessForm.tsx` para usar um grid CSS responsivo de 2 colunas (`grid grid-cols-1 md:grid-cols-2 gap-6`), agrupando campos harmonicamente para um preenchimento agradável.
- [ ] Garantir que todos os inputs, selects e textareas possuam fundo claro (`bg-white` ou `bg-slate-50`) e texto interno escuro (`text-slate-800` ou `text-slate-900`).
- [ ] Adicionar testes E2E Cypress específicos no arquivo `cypress/e2e/app/processes.cy.js` para validar visualmente e funcionalmente as cores de texto, os asteriscos vermelhos obrigatórios e o layout responsivo em colunas.
