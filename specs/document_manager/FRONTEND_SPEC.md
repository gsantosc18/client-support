# FRONTEND_SPEC.md - Arquitetura de Interface e Comportamentos

## 1. Módulos e Páginas Refatoradas
*   `ProcessDetailPage.tsx`: Adição de um Tab Selector ("Anotações" vs "Documentos") na parte inferior do painel, alternando de forma reativa através de estados locais.
*   `ProcessDocuments.tsx`: Renderização da listagem de metadados e controle de modais secundários.
*   `DocumentUploadModal.tsx`: Upload via Drag & Drop e preenchimento inteligente de nome padrão.
*   `DocumentEditModal.tsx`: Edição descritiva e upload opcional de arquivo.
*   `DocumentSafetyConfirmModal.tsx`: Exige digitação de frase de confirmação de segurança para liberar substituição física de arquivo.
*   `DocumentDeleteModal.tsx`: Modal vermelho confirmando deleção.
*   `DocumentViewModal.tsx`: Exibição nativa protegida com JWT de arquivos PDF e Imagens via geração de ObjectURLs.

---

## 2. Acessibilidade & UX Premium
*   Anéis de foco acessíveis (`focus-visible:ring-2 focus-visible:ring-focus-ring`) aplicados nos campos e botões.
*   Mapeamento de transições e animações fluidas para suavizar abertura de modais e abas de seleção (`transition-all duration-300`).
*   Truncagem inteligente de descrições longas para manter alinhamento estrito nas tabelas de dados.
