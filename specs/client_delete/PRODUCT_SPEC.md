# Product Specification: Client Delete (Exclusão e Arquivamento de Clientes)

Este documento especifica os objetivos funcionais, regras de negócio e critérios de aceite para a feature de Exclusão Física e Arquivamento de Clientes.

---

## 1. Objetivos da Feature

Permitir a exclusão física e definitiva de um registro de cliente da tabela principal `clients` quando este não possuir nenhum processo vinculado no sistema, garantindo a conformidade regulatória e a integridade referencial por meio do arquivamento seguro dos seus dados históricos em formato JSON na tabela `deleted_clients`.

---

## 2. Requisitos Funcionais

### 2.1. Fluxo de Exclusão no Frontend
* **Gatilho**: O usuário aciona a ação de remoção a partir da listagem de clientes ou da tela de detalhes do cliente.
* **Modal de Confirmação**: 
  * Exibir uma modal para confirmar a ação.
  * O texto explicativo na modal deve ser atualizado para deixar claro que os dados do cliente serão arquivados e removidos permanentemente das tabelas de trabalho ativas.
  * **Proteção contra exclusão acidental**: O usuário deve digitar a palavra `"delete"` para habilitar o botão de confirmação.
* **Feedback de Erro**:
  * Se a exclusão falhar no backend (por exemplo, se houver processos vinculados), o frontend deve interceptar a resposta e exibir uma mensagem amigável e clara para o usuário: `"O cliente está vinculado a um processo e não pode ser removido."`.

### 2.2. Regras de Negócio (Backend)
* **Validação de Vínculos**: A exclusão física só pode ser executada se o cliente **não** possuir nenhum registro de processo associado na tabela `processes`.
* **Transação Atômica**:
  * A exclusão do cliente da tabela `clients` e o salvamento de seus dados históricos na tabela `deleted_clients` devem ocorrer dentro da mesma transação do banco de dados (`gorm.Transaction`).
  * Em caso de falha em qualquer uma das etapas, toda a transação deve sofrer rollback.
* **Gravação de Histórico**:
  * O registro arquivado em `deleted_clients` deve conter todos os campos do cliente (incluindo metadados como IDs e datas de criação) convertidos para formato JSON/JSONB no campo `data`.

---

## 3. Critérios de Aceite

1. **Bloqueio de Exclusão com Vínculos**: Se o cliente possuir qualquer processo associado, a API e a interface devem negar a remoção e exibir a mensagem exata `"O cliente está vinculado a um processo e não pode ser removido."`.
2. **Exclusão Física Real**: Após a exclusão com sucesso, o registro do cliente deve sumir completamente da tabela `clients`.
3. **Arquivamento Integração**: A tabela `deleted_clients` deve conter o payload correspondente às informações completas do cliente no momento da deleção.
4. **Atualização Visual da Modal**: O texto explicativo da modal de deleção deve refletir que a ação resultará na exclusão física do cadastro e arquivamento dos dados.
