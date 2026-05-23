# Documentação Técnica: Gestão de Processos & Estabelecimentos (Frontend)

Esta documentação detalha a arquitetura frontend, telas, componentes, hooks e fluxos de dados implementados no Next.js para o Gerenciamento de Processos e Estabelecimentos (CRUD, Modal Inline e Relacionamento Muitos-para-Muitos).

---

## 1. Arquitetura e Módulos do Frontend

O módulo de processos e estabelecimentos foi modularizado de forma rica dentro da estrutura do Next.js:

```text
app/src/
├── app/
│   └── processes/                  # Rotas e Páginas (Next.js App Router)
│       ├── page.tsx                # Listagem geral de processos (/processes)
│       ├── new/                    # Abertura de processo (/processes/new)
│       └── [id]/
│           ├── page.tsx            # Detalhes do processo (/processes/[id])
│           └── edit/
│               └── page.tsx        # Edição do processo (/processes/[id]/edit)
├── features/
│   └── processes/                  # Lógica de Domínio da Feature
│       ├── components/             # Componentes de UI locais (StatusBadge, Modal, Forms)
│       ├── hooks/                  # Hooks customizados (useProcesses, useEstablishments)
│       ├── pages/                  # Implementações reais dos templates das páginas
│       └── services/               # Serviços Axios para consumo de endpoints
└── interfaces/
    ├── process.interface.ts        # Contrato de tipos para processos
    └── establishment.interface.ts  # Contrato de tipos para estabelecimentos
```

---

## 2. Páginas e Fluxos de Navegação

### 2.1. Tela de Listagem Geral (`/processes`)
Exibe a lista de processos cadastrados com suporte a paginação e busca textual.
* **Componente Base**: `ProcessListPage.tsx`
* **Funcionalidades**:
  * Tabela rica apresentando Protocolo, Clientes, Estabelecimento, Status e Data de Criação.
  * Badges coloridos dinâmicos para indicação de status.
  * Busca por termo de pesquisa.
  * Paginação de resultados.

### 2.2. Detalhes do Processo (`/processes/[id]`)
Apresenta todas as informações do processo incluindo relacionamento M:N com múltiplos clientes de forma harmoniosa e profissional.
* **Componente Base**: `ProcessDetailPage.tsx`
* **Funcionalidades**:
  * **Clientes Associados em Grade Responsiva**: Apresentação da lista completa de clientes em um layout de grade moderno (`grid grid-cols-1 sm:grid-cols-2 gap-4`), exibindo apenas o nome completo do cliente, a Cidade/Estado do estabelecimento associado e um botão com link para o perfil.
  * **Ordenação Alfabética**: Clientes associados são ordenados em ordem alfabética de A a Z de forma imutável via `localeCompare`.
  * **Ações do Processo Integradas**: Seção dedicada à direita ("Ações do Processo") contendo botões estilizados para editar e excluir. Os botões utilizam SVGs idênticos aos usados na listagem de clientes/processos para manter a coerência visual.
  * **Exclusão Segura**: O botão de excluir aciona o modal de confirmação no qual o usuário deve digitar `"delete"` para efetivar a remoção física e redirecionamento automático de volta para `/processes`.
  * Informações detalhadas do estabelecimento parceiro associado.
  * Histórico de observações e metadados de criação e atualização.

### 2.3. Abertura de Processo (`/processes/new`)
Formulário avançado para criação de processos vinculando estabelecimento e múltiplos clientes.
* **Componente Base**: `ProcessCreatePage.tsx`
* **Funcionalidades**:
  * Formulário interativo para seleção rápida de múltiplos clientes.
  * Busca e adição de clientes dinâmica.
  * Associação de estabelecimento com suporte a cadastro inline via modal rápido.

### 2.4. Edição de Processo (`/processes/[id]/edit`)
Permite alterar os vínculos de clientes, estabelecimento e status do processo.
* **Componente Base**: `ProcessEditPage.tsx`
* **Funcionalidades**:
  * Seleção dinâmica de múltiplos clientes e estabelecimento pré-selecionados.
  * Atualização de status do processo (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).

---

## 3. Componentes de UI Reutilizáveis

Os componentes locais estão isolados em `app/src/features/processes/components/`:

### 3.1. `ProcessForm.tsx`
Abstrai os formulários de cadastro e edição de processos.
* **Responsabilidade**: Coletar dados de protocolo, observação e status, gerenciar o estado da lista de clientes associados, e vincular estabelecimentos parceiros. Suporta a inclusão de novos estabelecimentos sem perder o estado de preenchimento atual usando React Fragments e modais.
* **Layout e UX Premium**:
  - **Grid de Duas Colunas**: A interface é estruturada em um grid CSS de duas vias (`grid grid-cols-1 md:grid-cols-2 gap-6`) para telas de médio/grande porte, otimizando o preenchimento e evitando fadiga visual do usuário.
  - **Badges com Fechamento**: A seleção multi-valor de clientes exibe chips estilizados em azul suave (`bg-blue-100 text-blue-800 font-semibold`) com botão de remoção rápida (`&times;`).
  - **Modal com Filtro**: A modal `ClientSelectModal` implementa pesquisa reativa e caixas de seleção simultâneas.

### 3.2. `EstablishmentCreateModal.tsx`
* **Responsabilidade**: Fornecer formulário rápido de cadastro de estabelecimentos de forma inline e instantânea. Possui controle contra múltiplos cliques desabilitando o botão de envio e exibindo animações de loading.

### 3.3. `ProcessStatusBadge.tsx`
* **Responsabilidade**: Exibir as cores adequadas e harmônicas para cada status de processo (`PENDING` -> ouro/laranja, `IN_PROGRESS` -> azul, `COMPLETED` -> verde, `CANCELLED` -> vermelho).

### 3.4. `ProcessDeleteModal.tsx`
* **Responsabilidade**: Modal de barreira protetora contra cliques acidentais de exclusão física. Exige que o usuário digite o termo exato `"delete"` no campo de entrada para desbloquear a ação de exclusão.

### 3.5. Componente Compartilhado: `SearchableSelect.tsx` (em `src/components/forms/`)
* **Responsabilidade**: Select customizado e acessível que permite filtrar estabelecimentos e operadores por digitação em tempo real, garantindo ótima usabilidade em telas móveis e resoluções desktop.

### 3.6. Componente Compartilhado: `ClientSelectModal.tsx` (em `src/features/clients/components/`)
* **Responsabilidade**: Modal de pesquisa e seleção em lote de múltiplos beneficiários. Permite digitar parte do nome ou CPF, filtrar os registros dinamicamente, marcar caixas de seleção (checkboxes) e confirmar a lista para o formulário de processos.

---

## 4. Diretrizes de UI/UX e Estilização de Formulários

Todos os formulários do ecossistema seguem as regras visuais consolidadas:

1. **Rótulos Escuros de Alta Legibilidade**: Rótulos e títulos usam cor escura e de alto contraste (`text-slate-800 font-bold`).
2. **Campos Obrigatórios com Asterisco Vermelho**: Campos obrigatórios exibem um asterisco vermelho estilizado com `<span className="text-red-500 font-extrabold">*</span>`.
3. **Fundo Claro e Texto Escuro**: Os inputs possuem fundo claro (`bg-white` ou `bg-slate-50`) e texto interno esmero (`text-slate-800` ou `text-slate-900`).
4. **Parser de Label no Input Base**: O componente genérico `Input.tsx` possui inteligência embutida que detecta strings terminadas em ` *` para renderizar automaticamente o rótulo escuro e o asterisco vermelho, garantindo reaproveitamento DRY e uniformidade em todos os formulários da aplicação.

---

## 5. Hooks e Camada de Serviços

### 4.1. Hooks `useProcesses.ts` e `useEstablishments.ts`
Hooks customizados React encapsulando todo o estado e requisições para a API.
* **useProcesses**: Gerencia requisições de listagem (`list`), detalhamento por ID (`get`), criação (`create`), atualização (`update`) e deleção (`delete`).
* **useEstablishments**: Gerencia requisições de busca paginada de estabelecimentos (`list`) e criação rápida (`create`).

### 4.2. Serviços `process.service.ts` e `establishment.service.ts`
Abstração da comunicação REST usando o Axios.
* Mapeamento de todos os endpoints RESTful protegidos por JWT.
