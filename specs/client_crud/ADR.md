ADR-002
Integridade Referencial de Clientes no Domínio (Bloqueio de Remoção por Processo Vinculado)

Contexto
O CRUD de clientes exige uma regra de integridade de negócios: um cliente não pode ser removido ou desativado se possuir qualquer processo associado a ele na mesma empresa.
No banco de dados PostgreSQL, a tabela de processos (`processes`) possui uma chave estrangeira `client_id REFERENCES clients(id) ON DELETE RESTRICT`, que bloqueia a remoção física no banco de dados. No entanto, o sistema opera com desativação lógica (Soft Delete), alterando o status do cliente para `INACTIVE` via instrução GORM `Update/Save`, o que não dispara a constraint física do banco de dados (que só impede deleções físicas `DELETE`).
Portanto, a regra de integridade de bloqueio de deleção precisa ser garantida explicitamente a nível de software na camada de serviço de domínio do backend.

Decisão
Injetaremos o `ProcessRepository` no `ClientService` no backend em Golang.
No método `Delete` do `ClientService`, antes de atualizar o status do cliente para `INACTIVE`, faremos uma chamada para consultar se existem processos vinculados ao cliente daquela empresa. A assinatura e a chamada correspondente serão:
```go
processes, total, err := s.processRepo.FindAll(companyID, &id, nil, "", "", 1, 1)
```
Caso `total > 0` ou haja algum erro, a operação de exclusão lógica será cancelada, retornando o erro específico:
`"O cliente está vinculado a um processo e não pode ser removido."`.
Isso exige atualizar o construtor do `ClientService` (`NewClientService`) para receber `ProcessRepository` e ajustar a inicialização do contêiner de dependências em `backend/cmd/api/main.go`.

Consequências
* **Positivas**:
  * Garantia absoluta de integridade de negócios a nível de domínio, mesmo usando Soft Delete.
  * O frontend receberá uma mensagem clara e amigável, permitindo notificar o operador em conformidade com os requisitos da especificação.
* **Negativas / Desafios**:
  * Aumento no acoplamento entre os repositórios na camada de serviço de Clientes (inclusão de `ProcessRepository`). Isto é justificado devido à dependência explícita das regras de integridade do domínio entre Clientes e Processos.
