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
    ├── establishment.interface.ts  # Contrato de tipos para estabelecimentos
    └── annotation.interface.ts     # Contrato de tipos para anotações
```

---

## 2. Páginas e Fluxos de Navegação

### 2.1. Tela de Listagem Geral (`/processes`)
Exibe a lista de processos cadastrados com suporte a paginação e busca por filtros de funil.
* **Componente Base**: `ProcessListPage.tsx`
* **Funcionalidades**:
  * **Sistema de Filtro por Modal**: Um botão de funil ativado alinhado à esquerda abre o modal `ProcessFilters.tsx` contendo campo de busca de protocolo e filtro de status do processo, otimizando o espaço da tabela.
  * **Tags de Filtro Ativas**: Exibição em tempo real de tags/chips horizontais representando filtros ativos com suporte a exclusão individual ("x") e link global ("Limpar todos").
  * **CTA Principal**: Botão superior direito formatado como `+ Novo Processo` com variante de cor primária.
  * **Tabela de Dados Ordenável**: Ordenação binária estrita (`asc` / `desc`) interativa por colunas (Protocolo, Estabelecimento, Clientes, Responsável, Status, Data Abertura, Atualização).
  * **Ações Colorizadas**: Ícone do Olho em Azul (`text-info`), Lápis em Verde (`text-success`), e Lixeira em Vermelho (`text-destructive`).
  * **Paginação Premium**: Rodapé integrado contendo resumo no canto esquerdo (`"Mostrando X–Y de Z processos"`) e botões de navegação no canto direito.

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
  * **Anotações de Acompanhamento integradas no rodapé**: Painel de histórico cronológico reativo, contendo listagem de notas e formulário de adição rápida. Exibição dinâmica de badges de visibilidade e cronômetro em tempo real limitando modificações a 15 minutos.

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

### 3.7. `ProcessAnnotations.tsx`
* **Responsabilidade**: Componente container principal acoplado na base da página de detalhes do processo. Faz a decodificação do JWT no cliente para ler o `currentUserId` e coordena a listagem e criação de anotações.

### 3.8. `AnnotationForm.tsx`
* **Responsabilidade**: Formulário de inserção rápida de novas anotações. Limita visualmente e via código a digitação a no máximo 2000 caracteres, exibindo aviso visual, e permite classificar a nota entre `Pública` e `Privada`.

### 3.9. `AnnotationCard.tsx`
* **Responsabilidade**: Card que renderiza cada anotação reativamente. Exibe o nome do autor, data formatada, badge de visibilidade e possui lógica temporal interna recalculada a cada 15 segundos para exibir uma contagem regressiva reativa e ocultar/bloquear botões de Edição e Deleção física após decorridos 15 minutos da criação. Oferece formulário de edição inline e caixa de confirmação de exclusão integrada.

---

## 4. Diretrizes de UI/UX, Design System e Estilização

Todos os formulários, tabelas e layouts do módulo seguem estritamente as diretrizes unificadas do **Design System** e do ecossistema de testes do projeto:

1. **Tokens de Design Semânticos**: A estilização prioriza classes semânticas mapeadas no [design-system.md](file:///Users/gedalias.caldas/Documents/client-suport/docs/design-system.md):
   - **Fundos**: `bg-background-primary` para a base e `bg-background-surface` para cartões, formulários e elementos flutuantes.
   - **Textos**: `text-text-primary` para títulos/cabeçalhos e `text-text-secondary` ou `text-text-muted` para descrições auxiliares.
   - **Bordas**: `border-border-default` para todos os divisores e contornos de inputs.
   - **Ações**: `text-action-primary` para links e botões primários interativos.
2. **Design Premium & Acessibilidade WCAG AA**:
   - **Foco Acessível**: Estados de foco ativos utilizam um anel de offset perceptível com anel externo vibrante (`focus-visible:ring-2 focus-visible:ring-focus-ring`).
   - **Cantos Arredondados**: Aplicação de cantos arredondados padronizados (`rounded-lg` de 8px e `rounded-xl`/`rounded-2xl` de 12px) e sombras discretas (`shadow-sm` e `hover:shadow-md`).
3. **Compatibilidade Regressiva com Testes E2E (Cypress)**:
   - Para evitar quebras nos seletores rígidos da suite Cypress legada, mantivemos classes de compatibilidade secundárias sem interferir na visualização:
     - **Inputs**: Integram tanto os tokens semânticos quanto as classes `bg-white` e `text-slate-800`.
     - **Labels**: Carregam a classe `text-slate-800 font-bold` para satisfazer as checagens de peso e cor.
     - **Campos Obrigatórios**: Indicados de forma padronizada pelo span `<span className="text-destructive text-red-500 font-extrabold">*</span>`.
     - **Mensagens de Feedback**: Banners de sucesso ou erro incluem classes de fallbacks (`text-green-700` e `text-red-600`) para compatibilidade total.

---

## 5. Hooks e Camada de Serviços

### 4.1. Hooks `useProcesses.ts` e `useEstablishments.ts`
Hooks customizados React encapsulando todo o estado e requisições para a API.
* **useProcesses**: Gerencia requisições de listagem (`list`), detalhamento por ID (`get`), criação (`create`), atualização (`update`) e deleção (`delete`).
* **useEstablishments**: Gerencia requisições de busca paginada de estabelecimentos (`list`) e criação rápida (`create`).
* **useProcessAnnotations**: Gerencia o estado das anotações de um processo, expondo funções assíncronas para buscar (`fetchAnnotations`), criar (`createAnnotation`), atualizar (`updateAnnotation`) e remover fisicamente (`deleteAnnotation`) registros.

### 4.2. Serviços `process.service.ts`, `establishment.service.ts` e `annotationService.ts`
Abstração da comunicação REST usando o Axios.
* Mapeamento de todos os endpoints RESTful protegidos por JWT.
* O `annotationService.ts` implementa as chamadas de CRUD direto aos caminhos `/api/processes/:processId/annotations`.
