# Frontend Specification: Process CRUD

Este documento especifica os componentes visuais, comportamento da interface, estados da UI e navegação no frontend para a feature de Gestão de Processos.

---

## 1. Mapeamento de Rotas e Páginas

### 1.1. `/processes` (Listagem)
* **Página**: `ProcessListPage.tsx`
* **Layout**: Exibe título, contador, botão "Abrir Processo", barra de pesquisa unificada, filtros rápidos (Status, Responsável, Estabelecimento) e uma tabela responsiva com os processos.
* **Ações**:
  * Clique na linha ou no ícone "Olho": Redireciona para `/processes/[id]`.
  * Clique no botão "Editar" (lápis): Redireciona para `/processes/[id]/edit`.
  * Clique no botão "Alterar Status": Abre popover/menu suspenso rápido para alterar o status.

### 1.2. `/processes/new` (Criação)
* **Página**: `ProcessCreatePage.tsx`
* **Formulário**: `ProcessForm.tsx` (reutilizável).
* **Campos**:
  * Seleção de Clientes (Multi-select com busca ativa).
  * Seleção de Estabelecimento (Select/Autocomplete com botão "+ Novo" ao lado).
  * Seleção de Responsável (Autocomplete ou dropdown dos operadores ativos da empresa).
  * Protocolo (Input de texto).
  * Observações (Textarea rico).

### 1.3. `/processes/[id]` (Detalhes)
* **Página**: `ProcessDetailPage.tsx`
* **Layout**:
  * Cabeçalho com Protocolo grande, badge elegante de Status e botão para editar ou alterar o status.
  * Painel Esquerdo:
    * Grid com dados básicos (Data de abertura, última alteração, responsável atual).
    * Card com observações em formato de bloco de texto e histórico.
  * Painel Direito:
    * Seção de Clientes Vinculados: Lista os clientes envolvidos com links rápidos para a ficha do cliente.
    * Seção do Estabelecimento: Exibe o nome, endereço, cidade e estado do local onde o atendimento está sendo executado.

### 1.4. `/processes/[id]/edit` (Edição)
* **Página**: `ProcessEditPage.tsx`
* **Formulário**: `ProcessForm.tsx` (preenchido com os dados atuais obtidos via hook).

---

## 2. Componentes Críticos e Modais

### 2.1. `EstablishmentCreateModal.tsx`
* **Responsabilidade**: Cadastro rápido de novos estabelecimentos sem sair do formulário de processo.
* **Campos**: Nome, Endereço, Cidade e Estado (UF).
* **Comportamento**: Envia requisição via hook de criação assíncrona, injeta o resultado no formulário principal de processos e fecha o modal.

### 2.2. `ProcessStatusBadge.tsx`
* **Responsabilidade**: Renderizar o badge de status com cores harmoniosas e elegantes (utilizando a paleta HSL do sistema).
* **Cores (Sugerido)**:
  * `PENDING`: Fundo cinza suave / amarelo pastel.
  * `IN_PROGRESS`: Azul suave com texto azul escuro.
  * `AWAITING_DOCUMENTATION`: Laranja suave com texto laranja escuro.
  * `IN_ANALYSIS`: Roxo suave com texto roxo escuro.
  * `COMPLETED`: Verde esmeralda suave com texto verde escuro.
  * `CANCELLED`: Vermelho suave com texto vermelho escuro.

---

## 3. Estados da UI e Validação de Formulários

### 3.1. Validações do Formulário (Formik / Zod / Nativo)
* **Clientes**: Pelo menos 1 cliente deve ser selecionado (caso vazio, impede submissão e exibe feedback em vermelho).
* **Estabelecimento**: Seleção de estabelecimento obrigatória.
* **Responsável**: Seleção de responsável obrigatória.
* **Protocolo**: Máximo de 100 caracteres.
* **Observações**: Opcional, máximo de 2000 caracteres.

---

## 4. Requisitos de Estilo e Layout dos Formulários

Para assegurar uma interface premium e extremamente agradável de interagir, os formulários do sistema (ex: `ProcessForm.tsx` e `EstablishmentCreateModal.tsx`) devem seguir estritamente as seguintes regras de UI/UX:

### 4.1. Títulos e Rótulos (Labels)
* **Cor Escura**: Todos os rótulos de campos e títulos de seções devem possuir cores escuras (ex: `text-slate-800` ou `text-slate-900`), garantindo alto contraste e leitura rápida.
* **Campos Obrigatórios**: Devem apresentar um asterisco vermelho (`*`) estilizado com a classe `text-red-500` imediatamente após o texto do rótulo.

### 4.2. Campos de Entrada (Inputs e Selects)
* **Fundo Claro**: Os inputs, selects e textareas devem possuir cor de fundo bem clara (ex: `bg-white` ou `bg-slate-50`).
* **Texto Escuro**: O texto digitado ou selecionado deve possuir cor de texto escura (ex: `text-slate-800` ou `text-slate-900`) para legibilidade ideal.

### 4.3. Organização do Formulário
* **Layout em Colunas**: Os campos devem ser distribuídos em colunas harmoniosas (usando CSS Grid com classes como `grid-cols-1 md:grid-cols-2 gap-6`) em telas médias e grandes, evitando formulários lineares excessivamente longos e cansativos de preencher.

### 4.4. Seletores de Múltiplos Valores (Multi-selects)
* **Badges com Remoção**: Cada valor selecionado deve ser exibido como um badge colorido premium contendo um botão de remoção rápida (ícone `&times;` ou similar).
* **Modal Multi-selecionável**: O ato de adicionar novos valores deve abrir um diálogo modal centralizado contendo:
  * Um campo de busca em tempo real no topo para filtrar as opções.
  * Uma lista de itens ativos com checkboxes interativos para seleção em lote.
  * Botões de ação bem definidos para Cancelar ou Confirmar a seleção.
