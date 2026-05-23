# Technical Specification — Alinhamento da Página de Listagem

Este documento descreve as decisões técnicas, a organização de componentes e os pacotes de estilização para o alinhamento das páginas de listagem.

---

## 1. Arquitetura de Componentes React

A estrutura física das páginas de listagem deve respeitar o seguinte mapeamento de responsabilidades:

```
[PageLayout]
   ├── [PageHeader]  (Título, sem contagem inline)
   ├── [PageActions] (Botão Funil no lado esquerdo | CTA "+ Novo [Recurso]" no lado direito)
   ├── [FilterModal] (Modal flutuante para aplicar/limpar critérios)
   ├── [ActiveChips] (Tags de filtros acima da tabela com opções de limpar)
   ├── [DataTable]   (Tabela contendo os cabeçalhos ordenáveis e ações coloridas)
   └── [Pagination]  (Controle de botões no lado direito | Resumo no padrão oficial no lado esquerdo)
```

---

## 2. Padrões de Estilo e Classes Tailwind

### 2.1. Botões de Ação na Tabela
As seguintes classes de cor e estilo premium devem ser utilizadas nos ícones de ação da tabela para coincidir com as diretrizes do padrão visual:

* **Visualizar (Eye Icon):**
  * Classes: `text-info hover:text-info/80 hover:bg-info/10 p-1.5 rounded-lg transition-all`
* **Editar (Pencil Icon):**
  * Classes: `text-success hover:text-success/80 hover:bg-success/10 p-1.5 rounded-lg transition-all`
* **Excluir (Trash Icon):**
  * Classes: `text-destructive hover:text-destructive/80 hover:bg-destructive/10 p-1.5 rounded-lg transition-all`

### 2.2. Botão Principal de Criação
* Variante: `primary`
* Classes de Alinhamento: `flex items-center gap-2 self-start sm:self-auto shadow-sm`
* Texto: `+ Novo [Recurso]` (com o ícone de adição explícito).

---

## 3. Lógica de Filtros e Chips
Para garantir re-renderização ágil e consistência de estado:
* Os filtros selecionados na Modal só devem ser consolidados e aplicados ao clicar em `"Aplicar Filtros"` ou pressionar `Enter`.
* A remoção individual em um chip atualiza o estado de busca e executa o refetch.
