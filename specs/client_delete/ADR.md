# Architecture Decision Record (ADR)

## ADR-002: Exclusão Física com Arquivamento em Log JSONB

### Status
Proposta

### Contexto
A especificação `SPEC.md` de exclusão de clientes exige que, ao excluir um cliente, seu registro seja removido fisicamente da tabela `clients` (Hard Delete), mas seus dados cadastrais históricos devem ser salvos e arquivados em formato JSON na tabela `deleted_clients`.
Atualmente, no sistema, a deleção é feita de forma lógica (Soft Delete), mudando o status do cliente para `INACTIVE`.
Precisamos reestruturar o comportamento do repositório, do serviço e da API no backend para substituir a exclusão lógica por exclusão física combinada com arquivamento.

### Decisão
Decidimos implementar as seguintes alterações técnicas:

1. **Uso de JSONB na tabela de Log**:
   * Em vez do tipo `JSON` convencional, utilizaremos o tipo `JSONB` do PostgreSQL na coluna `data` da tabela `deleted_clients`. Isso otimiza o armazenamento físico e permite eventuais consultas indexadas de auditoria.

2. **Acoplamento Transacional via GORM**:
   * O fluxo de salvar o log do cliente e excluí-lo fisicamente deve ser atômico e encapsulado em uma única transação de banco de dados (`db.Transaction`) na camada de repositório, garantindo que o cliente só seja deletado se for arquivado com sucesso e vice-versa.

3. **Validação de Processos Existentes**:
   * Manteremos a validação na camada de serviço de que o cliente não pode ser excluído se tiver processos ativos ou finalizados cadastrados na tabela `processes`. A chave estrangeira com a regra `ON DELETE RESTRICT` no banco de dados atuará como uma proteção extra de integridade referencial.

4. **Preservação de Multitenancy no Log de Excluídos**:
   * O payload em JSON gravado em `deleted_clients.data` conterá a propriedade `company_id`. Desta forma, a auditoria é totalmente capaz de isolar quais registros de logs excluídos pertencem a qual empresa parceira.

### Consequências
* **Vantagens**:
  * Libera espaço na tabela principal de trabalho de clientes (`clients`).
  * Remove registros sensíveis do banco ativo enquanto mantém uma trilha de auditoria completa no banco frio (`deleted_clients`).
  * Evita problemas de unicidade em cadastros futuros (por exemplo, se um cliente for removido, seu CPF/E-mail é liberado para novos cadastros na mesma empresa).
* **Desvantagens**:
  * A recuperação de dados no caso de exclusões acidentais exigirá intervenção manual de banco de dados (restaurando o JSON para a tabela `clients`).
