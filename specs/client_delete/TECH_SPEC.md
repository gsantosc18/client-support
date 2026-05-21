# Technical Specification: Client Delete

Este documento especifica a arquitetura técnica, divisão de camadas, módulos e estratégias de persistência para a feature de Exclusão Física e Arquivamento de Clientes.

---

## 1. Arquitetura do Sistema e Divisão de Camadas

A feature segue a arquitetura limpa (Clean Architecture) implementada no backend em Go:

1. **Camada de Domínio (`backend/internal/domain`)**:
   * Definição da estrutura `DeletedClient`.
   * Atualização da interface `ClientRepository` para incluir o método `Delete` físico e o método de arquivamento.

2. **Camada de Repositório (`backend/internal/repository/postgres`)**:
   * Implementação do método `Delete(id, companyID)` no `ClientRepository`.
   * Uso de transações GORM (`db.Transaction`) para garantir atomicidade.

3. **Camada de Serviço (`backend/internal/service`)**:
   * Adaptação do `ClientService.Delete(id, companyID)` para realizar a validação, criar o registro histórico na tabela `deleted_clients` e remover o cliente fisicamente de `clients`.

4. **Camada de Handler/Controller (`backend/internal/handlers/http`)**:
   * Adaptação do endpoint `DELETE /api/v1/clients/:id` no `ClientHandler.Delete` para retornar o status correto e payload de sucesso coerente.

---

## 2. Estratégia de Transação e Persistência

Para garantir que não haja perda de dados nem exclusões sem histórico:

```go
func (r *ClientRepository) Delete(client *domain.Client) error {
    return r.db.Transaction(func(tx *gorm.DB) error {
        // 1. Serializar dados do cliente para JSON
        clientJSON, err := json.Marshal(client)
        if err != nil {
            return err
        }

        // 2. Gravar em deleted_clients
        deletedLog := domain.DeletedClient{
            Data:      clientJSON,
            DeletedAt: time.Now(),
        }
        if err := tx.Create(&deletedLog).Error; err != nil {
            return err
        }

        // 3. Excluir fisicamente de clients
        if err := tx.Unscoped().Delete(client).Error; err != nil {
            return err
        }

        return nil
    })
}
```

* **Nota**: O uso de `.Unscoped()` é necessário caso o GORM estivesse configurado para Soft Delete na struct `Client` (embora atualmente o campo `DeletedAt` do GORM não esteja mapeado na struct `Client`, é uma excelente prática defensiva).
