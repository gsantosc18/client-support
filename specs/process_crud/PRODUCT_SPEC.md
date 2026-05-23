# Product Specification: Process CRUD (Gestão de Processos de Atendimento)

Este documento especifica os objetivos funcionais, regras de negócio e critérios de aceite para a funcionalidade de gerenciamento completo de Processos (CRUD).

---

## 1. Visão Geral e Objetivos

O principal objetivo desta funcionalidade é permitir que os usuários gerenciem a evolução dos casos de atendimento de seus clientes através de Processos estruturados. Cada processo encapsula informações sobre o local (Estabelecimento) onde o serviço ocorre, o cliente (ou múltiplos clientes) envolvido(s), o operador responsável (Usuário), o status atual do andamento, notas/observações de acompanhamento e o número do protocolo do atendimento.

---

## 2. Requisitos Funcionais (RF)

### RF-001: Listagem de Processos
* O sistema deve exibir uma lista de processos com paginação, filtros e busca.
* **Filtros e Busca**:
  * Busca textual por protocolo do processo ou nome do cliente.
  * Filtro por Status do Processo.
  * Filtro por Responsável (Usuário).
  * Filtro por Estabelecimento.

### RF-002: Detalhes do Processo
* Deve ser possível visualizar as informações completas de um processo específico:
  * Protocolo, Status, Observações de acompanhamento, datas de criação e última modificação.
  * Informações completas dos Clientes vinculados.
  * Informações completas do Estabelecimento vinculado.
  * Informações completas do Responsável atual.

### RF-003: Cadastro de Processo (Criação)
* O usuário poderá abrir um novo processo informando os seguintes dados obrigatórios:
  * Pelo menos 1 Cliente (podendo associar múltiplos).
  * Estabelecimento (associando um existente ou criando um novo inline).
  * Responsável pelo atendimento (operador).
* E os seguintes dados opcionais:
  * Protocolo do atendimento.
  * Observações iniciais sobre o atendimento.
* Ao abrir o processo, seu status padrão inicial será `'PENDING'` (Pendente).

### RF-004: Edição de Processo (Atualização)
* Deve ser possível editar as informações de um processo:
  * Alterar o conjunto de Clientes associados (adicionar/remover).
  * Alterar o Estabelecimento associado (ou criar inline).
  * Alterar o Responsável (atribuição).
  * Atualizar o número de Protocolo e as Observações.

### RF-005: Transição de Status
* O status do processo pode ser alterado de forma independente a qualquer momento.
* Status válidos:
  * **Pendente** (`PENDING`)
  * **Em andamento** (`IN_PROGRESS`)
  * **Aguardando documentação** (`AWAITING_DOCUMENTATION`)
  * **Em análise** (`IN_ANALYSIS`)
  * **Concluído** (`COMPLETED`)
  * **Cancelado** (`CANCELLED`)

### RF-006: Criação Inline de Estabelecimentos
* Na tela de criação/edição de processos, caso o estabelecimento desejado não exista no autocomplete/select, o usuário poderá abrir um modal rápido para cadastrar um novo estabelecimento preenchendo:
  * Nome (Obrigatório)
  * Endereço (Obrigatório)
  * Cidade (Obrigatório)
  * Estado (Obrigatório)
* Após salvar, o novo estabelecimento é automaticamente selecionado para o processo em edição/criação.

---

## 3. Regras de Negócio (RN)

### RN-001: Isolamento de Dados (Multitenancy)
* Processos, estabelecimentos e vínculos de clientes são estritamente isolados por Empresa (`company_id`). Um usuário de uma empresa nunca poderá ver ou gerenciar processos de outra empresa.

### RN-002: Vinculação de Clientes
* Um processo **deve** estar associado a pelo menos 1 cliente.
* Os clientes associados devem pertencer à mesma empresa do processo e estar com status `'ACTIVE'`.

### RN-003: Atribuição de Responsável
* O responsável pelo processo deve ser um usuário cadastrado e ativo (`'ACTIVE'`) pertencente à mesma empresa do processo.
* Qualquer usuário autenticado da empresa pode reatribuir o responsável pelo processo a qualquer momento.

### RN-004: Bloqueio de Deleção de Clientes Ativos
* Um cliente vinculado a qualquer processo não pode ser excluído fisicamente (conforme validado na feature de exclusão de clientes).

---

## 4. Critérios de Aceite (CA)

### CA-001: Criação de Processo com Sucesso
* **Dado** que o operador preenche os campos obrigatórios (pelo menos 1 cliente ativo, estabelecimento válido e responsável ativo) e clica em salvar;
* **Quando** os dados forem válidos;
* **Então** o sistema persiste o processo, vincula os clientes na tabela associativa, define o status como `'PENDING'` e redireciona para os detalhes do processo com uma notificação de sucesso.

### CA-002: Criação de Novo Estabelecimento Inline
* **Dado** que o operador está na tela de cadastro de processo e o estabelecimento não existe;
* **Quando** ele clica em "Adicionar Estabelecimento", preenche todos os campos (Nome, Endereço, Cidade, Estado) e clica em salvar;
* **Então** o estabelecimento é salvo de forma assíncrona na empresa, o modal se fecha e o campo "Estabelecimento" do processo aparece preenchido com o estabelecimento recém-criado.
