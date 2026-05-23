# Flow Specification — Alinhamento da Página de Listagem

Este documento descreve as sequências de interação do usuário para filtragem, busca e navegação na página de listagem.

---

## 1. Fluxo de Filtros por Modal

```mermaid
sequenceDiagram
    actor Usuario as Usuário
    participant UI as ClientListPage / ProcessListPage
    participant Modal as FilterModal
    participant API as Backend API

    Usuario->>UI: Clica no botão Funil
    UI->>Modal: Abre modal com estado atual
    Usuario->>Modal: Preenche campos e clica em "Aplicar Filtros"
    Modal->>UI: Retorna critérios preenchidos e fecha modal
    UI->>UI: Atualiza chips visuais e reseta página para 1
    UI->>API: Envia requisição GET com novos parâmetros
    API-->>UI: Retorna dados paginados
    UI->>UI: Renderiza tabela e atualiza rodapé de paginação
```

---

## 2. Fluxo de Remoção de Chip Individual

```mermaid
sequenceDiagram
    actor Usuario as Usuário
    participant UI as ClientListPage / ProcessListPage
    participant API as Backend API

    Usuario->>UI: Clica no "x" de um chip (ex: Status: Ativo)
    UI->>UI: Limpa a propriedade 'status' do estado de filtros
    UI->>UI: Remove chip correspondente da tela
    UI->>API: Envia requisição GET com o parâmetro 'status' omitido
    API-->>UI: Retorna dados paginados atualizados
    UI->>UI: Re-renderiza tabela
```
