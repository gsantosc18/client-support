# Frontend Specification — Alinhamento de Páginas de Formulário

Este documento define de forma precisa a especificação visual, estados de interface e o mapeamento de componentes a serem alterados no frontend.

---

## 1. Mapeamento de Mudanças Visuais por Página

### A. Página de Clientes (Criar/Editar)
- **Componente Base**: `ClientForm.tsx` dentro de `ClientCreatePage.tsx` e `ClientEditPage.tsx`.
- **Modificações**:
  - Encapsular a marcação no `FormContainer`.
  - Agrupar os campos no `FormSection` sob o título "Informações Gerais" com largura responsiva dividida em `columns={2}`.
  - Mapear cada elemento de entrada (`Input`, `Select`) dentro de um wrapper `FormField`.
  - Assegurar a renderização das validações do Zod sob cada input, estilizado na cor `--color-destructive`.
  - Atualizar os botões utilizando `FormActions` para garantir o alinhamento correto e estado desabilitado durante o carregamento (`isLoading`).

### B. Página de Processos (Criar/Editar)
- **Componente Base**: `ProcessForm.tsx` dentro de `ProcessCreatePage.tsx` e `ProcessEditPage.tsx`.
- **Modificações**:
  - Estruturar em duas seções lógicas (`FormSection`):
    - **Seção 1**: "Participantes e Estabelecimento" (`columns={2}`), agrupando a seleção de clientes, estabelecimento e operador responsável.
    - **Seção 2**: "Identificação e Observações" (`columns={2}`), agrupando o protocolo de identificação, status do processo e campo estendido de observações (que toma `col-span-2`).
  - Substituir alertas de browser nativos por validações de esquema Zod associadas aos wrappers de formulário.
  - Unificar a estilização do dropdown do status utilizando o novo componente de entrada `Select` genérico.

---

## 2. Padrões de Interface e Tokens do Design System

- **Largura Máxima do Formulário**: As páginas de criação/edição devem aplicar a classe utilitária `max-w-2xl mx-auto` para formulários simples (como de clientes) e `max-w-4xl mx-auto` para formulários densos (como processos), centralizando horizontalmente e evitando esticamento de campos em monitores ultrawide.
- **Margens e Paddings**:
  - Padding interno do card do formulário: `p-8` (desktop) e `p-5` (mobile).
  - Espaçamento vertical entre campos/linhas: `gap-6` (desktop) e `gap-5` (mobile).
- **Indicadores de Status Visual**:
  - Bordas de erro no input: `border-destructive` (focando em `--color-destructive`).
  - Animação de entrada dos textos de erro: `animate-in fade-in slide-in-from-top-1 duration-150`.
