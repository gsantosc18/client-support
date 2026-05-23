# DOMAIN_SPEC.md - Especificação de Domínio

## 1. Agregado: `Process`
O `Document` é uma entidade que pertence ao agregado de `Process`. Ele não possui ciclo de vida independente do processo no qual foi cadastrado.

---

## 2. Entidade de Domínio: `Document`
Contrato representativo dos metadados de arquivos gerenciados pelo sistema:
*   `ID`: Identificador universal único (UUIDv4).
*   `CompanyID`: Tenant proprietário do arquivo (UUIDv4).
*   `ProcessID`: Processo ao qual o documento está anexado (UUIDv4).
*   `UserID`: Operador responsável pelo envio original do arquivo (UUIDv4).
*   `Name`: Título descritivo do documento (Ex: "Contrato Assinado").
*   `Description`: Descrições e notas adicionais.
*   `FilePath`: Localizador físico único do arquivo no storage (`company_id/process_id/document_id/unique_filename.ext`).
*   `FileType`: Identificador do tipo MIME (Ex: `application/pdf`).
*   `FileSize`: Tamanho do arquivo em bytes (Máximo 10.485.760 bytes).

---

## 3. Comportamento e Regras de Domínio
*   **Agregado Saudável:** A remoção do processo resulta na deleção em cascata lógica e física de todos os seus documentos associados.
*   **Isolamento Transacional:** O repositório deve garantir que todas as escritas e leituras filtrem implicitamente pelo `company_id` recuperado nas credenciais de sessão do usuário logado.
