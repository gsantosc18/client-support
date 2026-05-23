# Gerenciamento de Documentos

## Objetivo

O objetivo é criar um sistema de gerenciamento de documentos que permita o cadastro, edição, exclusão e visualização de documentos.

## Uploads de documentos

- Na tela de detalhes do processo, deve haver uma aba de documentos
- A aba de documents deve ficar localizada ao lado da aba de anotações e ter nome de "Documentos"
- Quando clicar na aba de documentos, deve aparecer:
    - Um botão de "Adicionar Documento"
        - Ao clicar no botão de "Adicionar Documento", deve abrir um modal para upload de documentos
            - O modal deve conter um campo de nome do documento (obrigatório, default: nome do arquivo)
            - O modal deve conter um campo de descrição (opcional)
            - O modal deve conter um campo de arquivo para upload do documento (obrigatório)
                - Deve ser possível procurar arquivos no computador do usuário e fazer upload
                - Deve ser possível arrastar e soltar arquivos no campo de upload
            - O modal deve conter um botão de "Salvar" e um botão de "Cancelar"

## Tabela de documentos

- Quando clicar na aba de documentos, deve aparecer uma tabela de documentos
- A tabela de documentos deve conter as seguintes colunas:
    - Nome do documento
    - Descrição
    - Data de criação
    - Usuário que fez o upload
    - Ações
        - Icone de visualização do documento
            - Ao clicar, deve abrir uma modal com a visualização do documento
            - Na modal deve haver um botão de download para baixar o documento
        - Icone de edição do documento
            - Ao clicar, deve abrir um modal para editar o documento
            - O modal deve conter um campo de nome do documento (obrigatório, preenchido com o nome atual do documento)
            - O modal deve conter um campo de descrição (opcional, preenchido com a descrição atual do documento)
            - O modal deve conter um campo de arquivo para upload do documento
                - Deve ser possível procurar arquivos no computador do usuário e fazer upload
                - Deve ser possível arrastar e soltar arquivos no campo de upload
                - Se um novo arquivo for enviado, o arquivo antigo deve ser marcado com a tag "deleted" no objeto do S3.
                - Caso não seja enviado um novo arquivo, o arquivo antigo deve ser mantido.
            - O modal deve conter um botão de "Salvar" e um botão de "Cancelar"
            - Ao clicar em salvar, deve ser aberta uma nova modal informando o perigo de alterar o documento, e deve haver uma input para o usuário digitar a frase "alterar documento" para confirmar a alteração.
        - Icone de exclusão do documento
            - Ao clicar no botão de exclusão do documento, o componente deve seguir o padrão de exclusão de outros componentes.
                - O botão deve ser vermelho e ter um ícone de lixeira
    
## Informações técnicas

- No banco de dados, deve haver uma tabela de documents com os seguintes campos:
    - id: UUID
    - name: String
    - description: String
    - file_path: String
    - file_type: String
    - file_size: Int
    - user_id: UUID
    - process_id: UUID
    - company_id: UUID
    - created_at: Timestamp
- Os arquivos devem ser armazenados em uma pasta do S3, mas a estrutura do backend deve ser feita de forma que seja facil de alterar para outro serviço de armazenamento.
- Todos os arquivos enviados devem ter um nome de arquivo único gerado pelo backend. Este nome deverá servir para que não haja conflito entre arquivos de nomes iguais.
- Todos os arquivos devem ser enviados para pastas no S3. A estrutura deve ser: s3://<bucket>/<company_id>/<process_id>/<document_id>/<unique_file_name>.<extensao>. Onde:
    - <bucket> é o nome do bucket do S3
    - <company_id> é o id da empresa
    - <process_id> é o id do processo
    - <document_id> é o id do documento
    - <unique_file_name> é o nome do arquivo único gerado pelo backend
    - <extensao> é a extensão do arquivo
- O id do processo deve vir na rota. Exemplo: /processos/:id/documents
- Ao realizar a edição e um novo arquivo for enviado, o arquivo antigo deve ser marcado com a tag "deleted" no objeto do S3.
- Ao realizar a exclusão, o arquivo deve ser movido para uma pasta "trash" no S3 e coloque a tag "deleted" no objeto do S3.
- Ao realizar a exclusão, o registro deve ser removido do banco de dados.
- Quando a variável de ambiente USE_S3 for "false", os arquivos devem ser armazenados no sistema de arquivos local. A pasta deve ser definida na variável de ambiente LOCAL_STORAGE_PATH e a estrutura deve ser: <LOCAL_STORAGE_PATH>/<company_id>/<process_id>/<document_id>/<unique_file_name>.<extensao>. Onde:
    - <LOCAL_STORAGE_PATH> é o caminho definido na variável de ambiente LOCAL_STORAGE_PATH
    - <company_id> é o id da empresa
    - <process_id> é o id do processo
    - <document_id> é o id do documento
    - <unique_file_name> é o nome do arquivo único gerado pelo backend
    - <extensao> é a extensão do arquivo
