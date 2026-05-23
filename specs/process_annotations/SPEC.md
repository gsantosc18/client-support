# Process annotations

## Objetivo

Criar um campo em processo para adicionar anotações para acompanhamento.

## Requisitos

- As anotações devem aparecer na tela de detalhes do processo.
- As anotações devem ser ordenadas por data, do mais recente para o mais antigo.
- Deve haver um botão para adicionar anotação.
- Quando o usuário criar uma anotação, e ele for o dono dela, deve aparecer um botão para editar e deletar.
- Os botões de editar e deletar devem aparecer apenas para o dono da anotação até 15 minutos após a criação.
- Qualquer usuário da mesma companhia do processo deve conseguir ver as anotações.
- Qualquer usuário da mesma companhia do processo deve conseguir criar anotações.
- As anotações devem ter tipos de visibilidade: "Pública" e "Privada".
- As anotações devem estar vinculadas ao processo e à companhia.

## Interface

- A aba 'Detalhes do Processo' deve ter uma nova seção de anotações no fim da página.
- O card de anotação deve ocupar toda a largura da grade.

## Informações técnicas

- Deve ser criada uma nova tabela de annotations no banco de dados.
- Campos da tabela de annotations:
  - id: integer
  - process_id: integer
  - company_id: integer
  - user_id: integer
  - annotation: text
  - visibility: enum('public', 'private')
  - created_at: timestamp
  - updated_at: timestamp
- Ao realizar a remoção de uma anotação, ela deve ser fisicamente deletada do banco de dados.
- Nesse momento não deve ser feita nenhuma notificação, pois isso será feito em uma implementação futura.
- Os usuários da mesma companhia do processo devem conseguir ver todas as anotações independentemente do tipo de visibilidade.