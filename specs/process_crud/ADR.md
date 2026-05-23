# Architecture Decision Record (ADR)

## ADR-003: Modelagem Many-to-Many para Relacionamento Processo-Cliente e Tabela Associativa

### Status
Proposta

### Contexto
A especificação `SPEC.md` original para o CRUD de processos define que um processo pode estar relacionado a um ou mais clientes. No entanto, o esquema de banco de dados atual implementa um relacionamento linear `1:N` onde a tabela `processes` possui a coluna `client_id` apontando diretamente para um único cliente.

Para permitir a associação flexível de múltiplos clientes a um único processo (cenários comuns onde um casal, familiares ou sócios partilham do mesmo caso de atendimento/processo), é necessária uma mudança estrutural no relacionamento.

### Decisão
Decidimos que:
1. Removeremos a coluna `client_id` da tabela `processes` através de uma migração de banco de dados e criaremos uma tabela associativa chamada `client_processes`.
2. A tabela `client_processes` terá chaves estrangeiras apontando para `clients` e `processes`, ambas configuradas com `ON DELETE CASCADE`. Isso garante que, caso um processo ou vínculo seja deletado, o relacionamento seja limpo automaticamente.
3. No backend (GORM), a entidade `Process` passará a ter a propriedade `Clients []Client gorm:"many2many:client_processes;"`, permitindo que o GORM gerencie automaticamente a associação nas operações de criação e atualização.
4. No frontend, a interface de seleção de clientes no formulário de processos passará de um simples Select de único valor para uma lista multi-seleção de chips dinâmicos.

### Consequências
* **Prós**:
  * Flexibilidade total: Um processo pode ter um, dois ou dezenas de clientes vinculados simultaneamente.
  * Normalização correta do banco de dados relacional.
  * Compatibilidade futura para busca de processos a partir do cadastro do cliente (relação bidirecional).
* **Contras**:
  * Exige execução de migração complexa que remove a coluna `client_id` da tabela de processos (caso existam dados de testes, eles precisam ser preservados ou migrados para a nova tabela associativa).
  * Aumenta ligeiramente a complexidade das consultas SQL de listagem que agora necessitam de `JOIN` ou preload da tabela associativa.
