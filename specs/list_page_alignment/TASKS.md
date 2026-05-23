# Tasks — Alinhamento de Páginas de Listagem

checklist detalhado de tarefas para a execução da feature de alinhamento visual de listagens.

---

## Frontend

### 1. Ajustes em Clientes
- [ ] Criar modal de filtros em `ClientFilters.tsx` com botões "Aplicar Filtros" e "Limpar Filtros" e gatilho de funil.
- [ ] Implementar área de chips visuais ativos acima da tabela em `ClientListPage.tsx`.
- [ ] Adicionar funcionalidade de limpar individualmente ou limpar todas as tags.
- [ ] Alterar botão de criação em `ClientListPage.tsx` para usar o padrão `"+ Novo Cliente"`.
- [ ] Ajustar as cores dos botões de ação na tabela em `ClientTable.tsx`:
  - [ ] Ícone do Olho: Azul (`text-info/80 hover:text-info hover:bg-info/10`)
  - [ ] Ícone do Lápis: Verde (`text-success/80 hover:text-success hover:bg-success/10`)
  - [ ] Ícone da Lixeira: Vermelho (`text-destructive/80 hover:text-destructive hover:bg-destructive/10`)
- [ ] Ajustar o `handleSort` em `ClientListPage.tsx` para ordenação binária estrita.
- [ ] Reposicionar o resumo textual de registros no rodapé esquerdo de paginação (`"Mostrando X–Y de Z clientes"`) e remover do cabeçalho.

### 2. Ajustes em Processos
- [ ] Refatorar a área de filtros inline em `ProcessListPage.tsx` para usar o botão de funil com modal de filtros.
- [ ] Implementar os chips visuais de filtros aplicados com remoção individual e botão "Limpar todos".
- [ ] Alterar botão de criação em `ProcessListPage.tsx` para o padrão `"+ Novo Processo"`.
- [ ] Ajustar as cores dos botões de ação na tabela em `ProcessListPage.tsx`:
  - [ ] Ícone do Olho: Azul (`text-info/80 hover:text-info hover:bg-info/10`)
  - [ ] Ícone do Lápis: Verde (`text-success/80 hover:text-success hover:bg-success/10`)
  - [ ] Ícone da Lixeira: Vermelho (`text-destructive/80 hover:text-destructive hover:bg-destructive/10`)
- [ ] Corrigir o rodapé de paginação no lado esquerdo (`"Mostrando X–Y de Z processos"`) e remover do cabeçalho.
