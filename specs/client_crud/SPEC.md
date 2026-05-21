# Client CRUD

Este documento descreve como será implementado o CRUD de clientes.

## Operações

- Listagem de clientes
- Pesquisa de clientes
- Criação de cliente
- Edição de cliente
- Remoção de cliente

### Listagem de Clientes

A página de listagem de clientes deve exibir os seguintes dados:
- Nome
- Email
- Telefone
- Status
- Data de criação (No formato DD/MM/AAAA HH:MM e timezone do usuário)
- Última atualização (No formato DD/MM/AAAA HH:MM e timezone do usuário)
- Ações
  - Botão com icone para editar cliente
  - Botão com icone para remover cliente
  - Botão com icone para ver detalhes do cliente
- Deve possuir pagination
- A pagina deve carregar 10 clientes por página
- Deve possuir um botão para "Próxima página"
- Deve possuir um botão para "Página anterior"
- deve mostrar a quantidade de clientes carregados e a quantidade total de clientes
- Se a quantidade total de clientes for menor que 10, não deve mostrar a pagination
### Pesquisa de Clientes

A página de listagem de clientes deve possuir uma barra de pesquisa que permita buscar clientes por:
- Nome
- Email
- Telefone
- Status
- Data de criação (No formato DD/MM/AAAA HH:MM e timezone do usuário)
- Última atualização (No formato DD/MM/AAAA HH:MM e timezone do usuário)

### Ordenação de Clientes

- No topo da listagem de clientes deve haver o icone de ordenação ascendente e descendente em todas as colunas
- Ao clicar em ordenar deve ordenar a coluna
- Ao clicar novamente na coluna deve ordenar em ordem decrescente
- Ao clicar em ordenar novamente na coluna deve ordenar em ordem ascendente

### Filtros

- Na página de listagem de clientes deve haver filtros para:
  - Status
  - Data de criação
  - Data de atualização

### Botão de Adicionar Cliente

- Na página de listagem de clientes deve haver um botão com icone para adicionar cliente
- Ao clicar no botão de adicionar cliente deve redirecionar para a página de adicionar cliente

### Criação de Clientes

A página de criação de clientes deve possuir os campos conforme o documento `domain-definition/DATABASE_SPEC.md`, onde os campos obrigatórios devem ter um asterisco ao lado do nome.

Regras:
- Ao clicar em "Salvar", deve validar os campos obrigatórios
- Ao clicar em "Salvar", deve enviar os dados para a API de criação de clientes de forma segura.
- Ao clicar em "Cancelar", deve redirecionar para a página de listagem de clientes.
- Deve exibir mensagens de sucesso ou erro após a operação.
- Todos os campos devem respeitar o tipo de dado informado no DATABASE_SPEC.md.
- O status deve vir do backend conforme o enum de status de clientes do DATABASE_SPEC.md.
- Além da validação dos campos no frontend, o backend deve validar os campos.
- Os campos de documento, telefone deve conter mascaras para facilitar a digitação e leitura.
- O frontend deve enviar para o backend os campos de documento, telefone sem mascara para validação do campo.
- Os campos de data de criação e data de atualização devem ser preenchidos automaticamente pelo backend com a data atual do servidor em UTC e enviados para o frontend para que adicione o timezone local do usuário.

### Edição de Clientes

A página de edição de clientes deve possuir os campos conforme o documento `domain-definition/DATABASE_SPEC.md`, onde os campos obrigatórios devem ter um asterisco ao lado do nome.

### Remoção de Clientes

A remoção do cliente deve ser feita a partir da página de listagem com confirmação por texto "delete" na modal.
Ao confirmar a remoção do cliente, deve ser feita uma requisição DELETE para a API de remoção de clientes.

Regras:
- Ao clicar em "Remover", deve abrir uma modal de confirmação.
- Ao clicar em "Cancelar", deve fechar a modal de confirmação.
- Ao digitar "delete" na modal e clicar em "Remover", deve remover o cliente.
- Se o cliente estiver vinculado a algum processo, não deve ser possível remover o cliente exibindo uma mensagem "O cliente está vinculado a um processo e não pode ser removido.".
- Se a requisição for bem-sucedida, deve exibir uma mensagem de sucesso "Cliente removido com sucesso." e fechar a modal de confirmação.
- Se a requisição falhar, deve exibir uma mensagem de erro "Erro ao remover cliente." com um código de erro.

### Detalhes de Clientes

A página de detalhes do cliente deve exibir as informações salvas no banco de dados, conforme o documento `domain-definition/DATABASE_SPEC.md`.
A página do cliente deve ser amigável e de fácil leitura, apresentando em cartões as informações do cliente, de maneira organizada e agradável.
No topo da página deve haver um botão com ícone de edição para editar o cliente, além do botão de remover cliente, que deve abrir uma modal de confirmação com texto "delete" e o botão de voltar para a página de listagem de clientes.


## Navegação
- A página de listagem de clientes deve ser exibida assim que o usuário logar na plataforma.