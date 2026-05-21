# Client Delete

## Objetivo

Realizar o delete fisico do registro de cliente na tabela clients e a criação de um registro na tabela deleted_clients com os dados do cliente deletado.

## Regras de Negócio

- O delete só pode ser realizado se o cliente não tiver nenhum processo criado.
- Ao realizar o delete do cliente, o registro deve ser removido da tabela clients.
- Ao realizar o delete do cliente, um registro deve ser criado na tabela deleted_clients com as informacoes do cliente deletado em formato json.

## Informações técnicas

- A tabela deleted_clients deve possuir os seguintes campos:
    - id: int8 (PK)
    - data: json
    - deleted_at: timestamp
