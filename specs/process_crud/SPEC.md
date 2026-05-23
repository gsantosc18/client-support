# Process CRUD

## Objetivo

O usuário deverá conseguir realizar operações de CRUD em processos para que acompanhar a evolução dos casos em atendimento.

## Regras

- Um processo pode estar relacionado a um ou mais clientes.
- Um processo pode ter opcionalmente um protocolo de atendimento.
- Um processo precisar ter o nome do estabelecimento (privado ou publico), o enderço do estabelecimento, a cidade e estado.
- Um processo precisa estar relacionado a um usuário cadastrado no sistema.
- A atribuição do responsável pelo processo pode ser alterada a qualquer momento por qualquer usuário autenticado no sistema.
- Um processo pode estar pendente, em andamento, aguardando documentação, em análise, concluído ou cancelado.
- Um processo deve ter um campo para acrescentar observações sobre o atendimento.
- Ao criar um processo, o usuário deve ser capaz de associar um cliente ao processo.
- Ao criar um processo, o usuário deve ser capaz de associar um estabelecimento ao processo.
- Ao criar um processo, o usuário deve ser capaz de associar um responsável ao processo.
- Ao associar um estabelecimento ao processo, caso não exista deve ser possível criar um estabelecimento para o processo.

## Interface

### Listagem de processos

- Protocolo
- Nome do estabelecimento
- badge com o primeiro nome dos clientes associados
- badge com o nome do responsável pelo processo
- Status
- Data de criação
- Data de atualização
- Ações
  - icone para editar processo
  - icone para excluir processo
  - icone para ver processo
  - Os icones de edição, exclusão e visualização devem ser idênticos aos usados na listagem de clientes.
  - Os icones devem estar agrupados em um único container.
- O comportamento de ordenação deve seguir o padrão estabelecido na tela de listagem de clientes.
- O comportamento da paginação deve seguir o padrão estabelecido na tela de listagem de clientes.
- A paginação deve ficar na parte de baixo da tabela de listagem.
- No topo da tabela de ter um icone de filtro
- No topo da página deve haver um botão de adicionar novo processo ao lado direito.
- Filtros disponíveis:
  - Protocolo
  - Nome do estabelecimento
  - Nome do cliente
  - Responsável
  - Status

### Cadastro de processo

- O form deve possuir os seguintes campos:
  - protocol
  - observation
  - status
    - Deve ser um select com as opções: pendente, em andamento, aguardando documentação, em análise, concluído ou cancelado.
  - client
    - Deve exibir os clientes selecionados como badges. Deve possuir um botão para adicionar clientes.
    - Ao clicar em adicionar clientes, deve abrir uma modal para buscar pelo nome do cliente.
    - Ao consultar os clientes, deve exibir uma lista com checkbox para selecionar os clientes.
    - O badge de clientes deve possuir um icone para remover o cliente.
  - establishment
    - Deve exibir as informações no formato: Nome (Cidade/Estado)
    - Deve ser um select com os estabelecimentos cadastrados
    - Deve ser possível buscar pelo nome do estabelecimento
  - Responsável
    - Deve exibir o nome do usuário responsável
    - Deve ser um select com os usuários cadastrados
    - Deve ser possível buscar pelo nome do usuário
- A cor do texto de títulos devem ser iguais aos padrões estabelecidos na tela de listagem de clientes.

### Visualização de processo

- A visualização de processo deve exibir as informações do processo de forma clara e objetiva.
- A visualização de processo deve exibir as seguintes informações:
  - Protocolo
  - Nome do estabelecimento
  - Clientes associados
  - Responsável
  - Status
  - Data de criação
  - Data de atualização
  - Observações
- As informações devem estar agrupadas por categorias:
  - Informações do processo
  - Clientes associados
    - Deve um card apenas com o nome (cidade/estado) e um link para o perfil do cliente.
    - Os cards devem ficar em formato de grade.
    - Os cards devem ser listados em ordem alfabética.
  - Responsável
  - Estabelecimento
  - Botões de ações com ícones idênticos aos usados na listagem de clientes: editar e excluir
    - Ao clicar no botão de editar, deve ser levado para a página de edição do processo.
    - Ao clicar no botão de excluir, deve seguir o padrão da remoção de processos na listagem de processos.

### Edição de processo

- A página de edição de processo deve ser similar ao cadastro de processo.

### Remoção de processo

- O comportamento de remoção deve seguir o padrão estabelecido na tela de listagem de clientes.

## Informações técnicas

- A tabela de processo deve possuir os seguintes campos:
  - id: UUID
  - protocol: text
  - observation: text
  - created_at: timestamp
  - updated_at: timestamp
  - status: string
  - establishment_id: UUID
  - company_id: UUID
- A tabela cliente_processo deve possuir os seguintes campos:
  - id: UUID
  - client_id: UUID
  - process_id: UUID
- A tabela de establishment deve possuir os seguintes campos:
  - id: UUID
  - name: string
  - address: string
  - city: string
  - state: string
  - created_at: timestamp
  - updated_at: timestamp
- Ao realizar a remoção de um processo, deve ser inserido um novo registro na tabela de deleted_processes com os seguintes campos:
  - id: UUID
  - data: json
  - deleted_at: timestamp
  - Após a criação do registro na tabela de deleted_processes, o processo deve ser removido da tabela de processos e as relações com clientes e estabelecimentos devem ser removidas da tabela cliente_processo e establishment.
  - Nos formulários:
    - Os títulos devem ter uma cor escura
    - Caso o campo seja obrigatório, ele deve ter um asterisco vermelho
    - A input deve ter um fundo claro.
    - O texto da input deve ter uma cor escura.
  - A organização dos formulário deve ser em colunas e agradável de preencher.
  - Os selects que possibilitam escolher mais de um valor, devem seguir:
    - Um badge com o valor e um botão para remover o valor.
    - Abrir uma modal com uma lista de opções multi-selecionáveis e um campo de busca.
