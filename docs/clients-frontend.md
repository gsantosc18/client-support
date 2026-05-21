# Documentação Técnica: Gestão de Clientes (Frontend)

Esta documentação detalha a arquitetura frontend, telas, componentes, hooks e fluxo de dados implementados no Next.js para o Gerenciamento de Clientes (CRUD).

---

## 1. Arquitetura e Módulos do Frontend

Conforme os padrões estritos definidos no `AGENTS.md`, o módulo de clientes está modularizado de forma limpa dentro do ecossistema Next.js:

```text
app/src/
├── app/
│   └── clients/                    # Rotas e Páginas (Next.js App Router)
│       ├── page.tsx                # Listagem geral (/clients)
│       ├── new/                    # Criação de cliente (/clients/new)
│       └── [id]/
│           ├── page.tsx            # Detalhes do cliente (/clients/[id])
│           └── edit/
│               └── page.tsx        # Edição do cliente (/clients/[id]/edit)
├── features/
│   └── clients/                    # Lógica de Domínio da Feature
│       ├── components/             # Componentes de UI locais da feature
│       ├── hooks/                  # Hooks customizados para gerenciamento de estado e API
│       ├── pages/                  # Implementação real dos templates das páginas
│       └── services/               # Comunicação direta com a API REST de clientes
└── interfaces/
    └── client.interface.ts         # Contratos e definições de tipos TypeScript
```

---

## 2. Páginas e Fluxos de Navegação

### 2.1. Tela de Listagem Geral (`/clients`)
Apresenta de forma rica a coleção de clientes pertencentes à empresa autenticada.
* **Componente Base**: `ClientListPage.tsx`
* **Funcionalidades**:
  * Busca textual assíncrona por Nome, E-mail ou CPF.
  * Filtro rápido por Status (`Todos`, `Ativo`, `Inativo`, `Suspenso`).
  * Tabela de dados ordenável interativamente clicando nas colunas (Nome, E-mail, Telefone, Status, Criação, Atualização).
  * Paginação nativa rica.
  * Ações rápidas de visualização, edição e exclusão de cliente.

### 2.2. Detalhes do Cliente (`/clients/[id]`)
Exibe a visualização completa de um cliente específico com destaque para suas informações.
* **Componente Base**: `ClientDetailPage.tsx`
* **Funcionalidades**:
  * Exibição detalhada de CPF, RG, CNH, Telefone e data de nascimento formatada.
  * Badge dinâmico de status com HSL tailored color.
  * Acesso rápido às opções de editar dados ou voltar para a lista.

### 2.3. Cadastro de Cliente (`/clients/new`)
Formulário de criação rico com validações.
* **Componente Base**: `ClientCreatePage.tsx`
* **Funcionalidades**:
  * Cadastro de Nome Completo, E-mail, Telefone, CPF, RG e CNH.
  * Máscaras de digitação instantâneas para CPF (`999.999.999-99`) e Telefone (`(99) 99999-9999`).

### 2.4. Edição de Cliente (`/clients/[id]/edit`)
Formulário para alteração de dados do cliente com preenchimento automático.
* **Componente Base**: `ClientEditPage.tsx`
* **Funcionalidades**:
  * Edição de dados e do status atual do cliente (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
  * Validações de obrigatoriedade e conformidade sintática em tempo de digitação.

---

## 3. Componentes de UI Reutilizáveis

Os componentes locais estão isolados em `app/src/features/clients/components/`:

### 3.1. `ClientForm.tsx`
Componente central que abstrai os formulários de cadastro e edição de clientes.
* **Responsabilidade**: Coletar dados, aplicar máscaras em tempo real de CPF e celular, fazer validações de tamanho mínimo, formato de email e obrigatoriedade de campos, e submeter o payload higienizado para o handler.

### 3.2. `ClientDeleteModal.tsx`
Modal elegante e segura de confirmação e execução de exclusão.
* **Responsabilidade**: Evitar confirmações acidentais exigindo que o operador digite textualmente `"delete"` para habilitar o botão de exclusão definitiva. Apresenta o aviso atualizado sobre a exclusão permanente dos dados de produção e seu consequente arquivamento histórico. Caso a API de backend barre a remoção por conter processos vinculados, o componente captura a resposta e exibe o alerta de erro detalhado na interface da própria modal.

### 3.3. `ClientTable.tsx`
Tabela dinâmica de exibição de clientes.
* **Responsabilidade**: Renderizar a lista de clientes, tratar cabeçalhos clicáveis para ordenação alfabética ou cronológica, exibir badges com cores harmônicas e gerenciar botões de ações.

---

## 4. Hooks e Camada de Serviços

### 4.1. Hook `useClients.ts`
Hook customizado React encapsulando todo o estado e lógica de clientes.
* **Estados Gerenciados**: `loading`, `error`, `paginatedData`, `client`.
* **Funções Expostas**:
  * `fetchClients(params)`: Busca clientes paginados, ordenados e filtrados.
  * `fetchClientByID(id)`: Busca os detalhes de um único cliente.
  * `createClient(data)`: Envia requisição de criação de novo cliente.
  * `updateClient(id, data)`: Envia requisição de atualização.
  * `deleteClient(id)`: Envia requisição de deleção física definitiva com arquivamento atômico, retornando um objeto explicativo `{ success: boolean, error?: string }` para que a interface trate o erro localmente com precisão.

### 4.2. API Service `client.service.ts`
Abstração da comunicação REST usando o cliente Axios pré-configurado.
* **Endpoints Mapeados**:
  * `GET /clients` (Listagem com query string)
  * `GET /clients/:id` (Obter por ID)
  * `POST /clients` (Criação de cliente)
  * `PUT /clients/:id` (Atualização)
  * `DELETE /clients/:id` (Exclusão física permanente com log JSONB)
