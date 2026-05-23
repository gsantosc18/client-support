# PRODUCT_SPEC.md - Gerenciador de Documentos

## 1. Objetivos da Feature
Disponibilizar aos inquilinos (empresas) um painel para anexar, gerenciar e visualizar arquivos importantes (contratos, fotos, relatórios, planilhas) associados diretamente aos seus processos ativos.

---

## 2. Requisitos Funcionais
*   **RF-001 - Upload de Documentos:** Permitir anexar arquivos PDF, PNG, JPG, JPEG, DOCX ou XLSX com tamanho máximo de 10MB.
*   **RF-002 - Listagem de Documentos:** Apresentar a tabela de documentos na aba de detalhes de processos.
*   **RF-003 - Visualização / Pré-visualização:** Habilitar a visualização instantânea de PDFs e imagens no navegador sob token de autenticação JWT seguro.
*   **RF-004 - Download Seguro:** Permitir baixar qualquer documento associado.
*   **RF-005 - Edição:** Permitir alterar o nome e a descrição do documento, e substituir o arquivo de forma opcional.
*   **RF-006 - Exclusão Física & Arquivamento Físico:** Deletar o registro de metadados do banco de dados e mover o arquivo correspondente no S3/Storage local para a subpasta `trash/` do respectivo tenant.

---

## 3. Regras de Negócio
*   **RN-001 - Multi-Tenancy Estrito:** Um usuário de uma empresa `A` jamais pode visualizar, fazer upload, editar ou excluir documentos de uma empresa `B`.
*   **RN-002 - Dupla Confirmação de Substituição de Arquivo:** Ao salvar modificações que alteram o arquivo físico do documento, o sistema exige que o operador digite a frase exata `"alterar documento"` de forma minúscula para evitar erros de overwrite indesejáveis.
*   **RN-003 - Soft-Delete Físico e Hard-Delete Lógico:** Ao deletar o documento, o registro na tabela de banco de dados é permanentemente destruído (`DELETE FROM documents`), porém o arquivo no Storage físico é realocado na subpasta `/trash` recebendo a meta-tag `deleted: "true"`.

---

## 4. Critérios de Aceite
*   Qualquer tentativa de burlar a segurança enviando arquivos maiores de 10MB ou com extensões diferentes do permitido é rejeitada pelo backend com HTTP `400 Bad Request`.
*   A aba de documentos é visível na tela de detalhes do processo ao lado da aba de anotações.
