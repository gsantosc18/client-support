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
Apresenta de forma rica a coleção de clientes pertencentes à empresa autenticada, seguindo estritamente as diretrizes unificadas de design.
* **Componente Base**: `ClientListPage.tsx`
* **Funcionalidades**:
  * **Sistema de Filtro por Modal**: Um botão de funil ativado alinhado à esquerda abre um modal flutuante contendo busca textual e filtro de status, otimizando o espaço da tabela.
  * **Filtros e Busca por Modal**: Busca textual assíncrona por Nome, E-mail ou CPF, e seleção de Status (`Ativo`, `Inativo`, `Suspenso`).
  * **Tags de Filtro Ativas**: Exibição em tempo real de tags/chips horizontais representando filtros ativos com suporte a exclusão individual ("x") e link global ("Limpar todos").
  * **CTA Principal**: Botão superior direito formatado como `+ Novo Cliente` com variante de cor primária.
  * **Tabela de Dados Ordenável**: Ordenação binária estrita (`asc` / `desc`) interativa.
  * **Ações Colorizadas**: Ícone do Olho em Azul (`text-info`), Lápis em Verde (`text-success`), e Lixeira em Vermelho (`text-destructive`).
  * **Paginação Premium**: Rodapé integrado contendo resumo no canto esquerdo (`"Mostrando X–Y de Z clientes"`) e botões de navegação no canto direito.

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

---

## 5. Cofre de Credenciais Sigilosas (Client Vault)

O cofre de credenciais sigilosas permite armazenar dados confidenciais (ex: senhas e notas) associados a cada cliente, com criptografia ponta a ponta (descriptografados apenas sob demanda).

### 5.1. Componentes de UI

#### 5.1.1. `ClientVaultSection.tsx`
Seção integrada à tela de detalhes do cliente (`ClientDetailPage.tsx`).
* **Responsabilidade**: Renderizar a lista de credenciais pertencentes ao cliente, com a senha e observações mascaradas por padrão.
* **Funcionalidades**:
  * Exibe uma listagem em tabela contendo o título do acesso, senha mascarada (`••••••••`) e observações ocultadas.
  * Botão **Revelar** (Ícone de Olho): Faz uma requisição assíncrona ao backend para descriptografar os dados daquele item específico e os exibe em tela.
  * Botão **Copiar** (Ícone de Prancheta): Permite copiar a senha descriptografada para a área de transferência do sistema operacional (disponível apenas após revelar).
  * Botão **Nova Credencial**: Abre o modal de cadastro de credencial.
  * Botão **Editar** (Ícone de Lápis): Busca os dados descriptografados e abre o modal de edição correspondente.
  * Botão **Excluir** (Ícone de Lixeira): Confirma a exclusão definitiva do item do cofre.

#### 5.1.2. `VaultItemModal.tsx`
Modal reutilizável para criação e edição de credenciais.
* **Responsabilidade**: Coletar os dados da credencial de forma sanitizada.
* **Campos**:
  * **Título** (`title`): Identificador do acesso (ex: "Portal e-CAC").
  * **Senha** (`password`): Senha ou chave de acesso.
  * **Observações** (`notes`): Detalhes ou notas de suporte adicionais (opcional).
* **Observação técnica**: O campo `user_id` não é exibido nem enviado pelo formulário; o backend infere o ID do usuário operador logado diretamente do token JWT. O campo `username` foi completamente removido dos fluxos da interface e do payload.

### 5.2. Hook `useClientVault.ts`
Hook customizado React encapsulando a lógica e os estados do cofre de credenciais.
* **Estados Gerenciados**: `loading`, `error`, `items`.
* **Funções Expostas**:
  * `fetchItems(clientId)`: Busca a listagem de itens do cofre (mascarados).
  * `revealItem(clientId, itemId)`: Busca um item específico em formato descriptografado.
  * `createItem(clientId, data)`: Envia requisição para salvar um novo item de credencial.
  * `updateItem(clientId, itemId, data)`: Envia requisição para atualizar os dados de uma credencial existente.
  * `deleteItem(clientId, itemId)`: Envia requisição de exclusão física permanente da credencial.

### 5.3. API Service `vault.service.ts`
Comunicação direta com a API REST do cofre de clientes.
* **Endpoints Mapeados**:
  * `GET /clients/:clientId/vault` (Listagem de credenciais mascaradas)
  * `GET /clients/:clientId/vault/:id` (Revelar credencial descriptografada)
  * `POST /clients/:clientId/vault` (Adicionar credencial criptografada)
  * `PUT /clients/:clientId/vault/:id` (Atualizar dados criptografados da credencial)
  * `DELETE /clients/:clientId/vault/:id` (Remover credencial permanentemente)

