# Flow Specification: Process Annotations

Este documento apresenta a modelagem de fluxo do sistema e as interações entre o Frontend, o Backend e a Camada de Banco de Dados.

---

## 1. Fluxo de Criação e Consulta de Anotações

O diagrama abaixo ilustra o fluxo de carregamento dos detalhes do processo, exibição das notas públicas/privadas autorizadas e criação de uma nova nota.

```mermaid
sequenceDiagram
    autonumber
    actor Operador as Operador Autenticado
    participant FE as Frontend (Next.js)
    participant BE as Backend (Fiber API)
    participant DB as Banco de Dados (Postgres)

    Note over Operador, FE: Visualizando Detalhes do Processo
    FE->>BE: GET /api/processes/:id/annotations [JWT Bearer Token]
    BE->>BE: Extrai user_id e company_id do JWT
    BE->>DB: Query Annotations (company_id, process_id)
    Note over DB: Filtra apenas por process_id e company_id (Traz todas as notas públicas/privadas)
    DB-->>BE: Lista completa de Registros (ordenada DESC)
    BE-->>FE: JSON Array das Anotações
    FE-->>Operador: Exibe seção de anotações no rodapé

    Note over Operador, FE: Adicionando Nova Anotação
    Operador->>FE: Digita conteúdo e seleciona Classificação ("Privada")
    Operador->>FE: Clica em "Adicionar"
    FE->>BE: POST /api/processes/:id/annotations [JWT Token, JSON Payload]
    BE->>BE: Valida dados (Conteúdo presente, CompanyID do Processo bate com JWT)
    BE->>DB: INSERT INTO annotations (...)
    DB-->>BE: ID, CreatedAt, OK
    BE-->>FE: 201 Created (Objeto Anotação)
    FE->>FE: Atualiza cache do React Query (Refetch)
    FE-->>Operador: Exibe anotação na listagem com badge "Privada"
```

---

## 2. Fluxo de Edição ou Exclusão (Regra dos 15 Minutos)

Este diagrama detalha as validações efetuadas para garantir que apenas o criador de uma nota possa alterá-la ou removê-la, e unicamente dentro da janela dos 15 minutos regulamentares.

```mermaid
sequenceDiagram
    autonumber
    actor Operador as Criador da Nota
    participant FE as Frontend (Next.js)
    participant BE as Backend (Fiber API)
    participant DB as Banco de Dados (Postgres)

    Note over Operador, FE: Fluxo de Edição Inline
    Operador->>FE: Clica no botão "Editar" (calculado < 15 min)
    FE->>FE: Transforma Card em Modo de Edição Inline
    Operador->>FE: Altera o texto e clica em "Salvar"
    FE->>BE: PUT /api/processes/:id/annotations/:annotation_id [JWT Token, JSON Payload]
    
    Note over BE: Validações do Servidor
    BE->>DB: Busca anotação por ID
    DB-->>BE: Registro (user_id=criador, created_at)
    BE->>BE: Valida se JWT.user_id == Registro.user_id (OK)
    BE->>BE: Valida se time.Since(created_at) <= 15 Minutos (OK)
    
    BE->>DB: UPDATE annotations SET annotation = ?, updated_at = ? WHERE id = ?
    DB-->>BE: OK
    BE-->>FE: 200 OK (Objeto Atualizado)
    FE->>FE: Restaura interface e atualiza lista
    FE-->>Operador: Exibe texto atualizado com sucesso
```
