# Flow Specification: Client Delete

Este documento detalha o fluxo de controle fim-a-fim, interações entre Frontend e Backend e as transições de controle na exclusão de clientes.

---

## 1. Fluxograma Fim-a-Fim (Cenário Feliz vs. Triste)

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário (Frontend)
    participant F as Frontend ClientListPage
    participant M as ClientDeleteModal
    participant B as Backend API (/clients/:id)
    participant S as ClientService
    participant DB as Postgres Database

    U->>F: Clica em "Remover Cliente"
    F->>M: Abre modal de confirmação
    U->>M: Digita "delete" no input e clica em "Remover"
    M->>B: DELETE /api/v1/clients/:id (JWT Bearer)
    
    activate B
    B->>S: Delete(id, companyID)
    activate S
    
    S->>DB: ProcessRepository.FindAll() (Existe processo vinculado?)
    alt Sim (Existe processo)
        DB-->>S: Lista de Processos > 0
        S-->>B: Retorna Erro: "O cliente está vinculado..."
        B-->>M: HTTP 400 {"error": "O cliente está vinculado..."}
        M-->>U: Exibe mensagem de erro na modal (modal permanece aberta)
    else Não (Sem processos)
        DB-->>S: Lista de Processos = 0
        S->>DB: Inicia Transação DB
        S->>DB: Insere em deleted_clients (JSON dos dados)
        S->>DB: Exclui fisicamente de clients
        S->>DB: Confirma Transação (Commit)
        DB-->>S: Transação Concluída
        S-->>B: Retorna Sucesso
        deactivate S
        B-->>M: HTTP 200 {"message": "Cliente excluído..."}
        deactivate B
        M->>F: Fecha modal e limpa estado
        F-->>U: Exibe Toast de sucesso e atualiza tabela de clientes
    end
```
