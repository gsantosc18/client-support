# API_SPEC.md - Contratos de Integração REST

Todos os endpoints exigem autorização via cabeçalho HTTP Bearer:
```http
Authorization: Bearer <token_jwt>
```
O `company_id` do tenant proprietário é extraído de forma segura e implícita do payload do Token JWT no middleware do Fiber, impossibilitando adulteração de dados.

---

## 1. Endpoints

### 1.1. Enviar Novo Documento
*   **Método**: `POST`
*   **Rota**: `/api/processes/:processId/documents`
*   **Content-Type**: `multipart/form-data`
*   **Parâmetros de Formulário**:
    *   `name`: `string` (Ex: "Contrato Assinado", Obrigatório)
    *   `description`: `string` (Descrição opcional)
    *   `file`: `binary` (Arquivo físico do upload, Obrigatório)
*   **Respostas**:
    *   `201 Created`: Sucesso. Retorna o JSON do documento.
    *   `400 Bad Request`: Extensão ilegal ou tamanho excedendo 10MB.
    *   `403 Forbidden`: Processo pertence a outro tenant.

### 1.2. Listar Documentos
*   **Método**: `GET`
*   **Rota**: `/api/processes/:processId/documents`
*   **Resposta (200 OK)**:
```json
[
  {
    "id": "e7b0c8d1-1234-abcd-ef01-1234567890f1",
    "company_id": "company12-1234-abcd-ef01-1234567890ab",
    "process_id": "process12-1234-abcd-ef01-1234567890bc",
    "user_id": "user1234-1234-abcd-ef01-1234567890de",
    "name": "Contrato Assinado",
    "description": "Contrato em formato PDF",
    "file_path": "company12/process12/e7b0c8d1/contrato.pdf",
    "file_type": "application/pdf",
    "file_size": 154820,
    "created_at": "2026-05-23T12:00:00Z",
    "updated_at": "2026-05-23T12:00:00Z"
  }
]
```

### 1.3. Editar Documento
*   **Método**: `PUT`
*   **Rota**: `/api/processes/:processId/documents/:documentId`
*   **Content-Type**: `multipart/form-data`
*   **Parâmetros de Formulário**:
    *   `name`: `string` (Obrigatório)
    *   `description`: `string` (Opcional)
    *   `file`: `binary` (Substituição física opcional do arquivo)

### 1.4. Baixar Arquivo
*   **Método**: `GET`
*   **Rota**: `/api/processes/:processId/documents/:documentId/download`
*   **Resposta**: Streaming direto do fluxo binário do arquivo.
*   **Headers**:
    *   `Content-Disposition: attachment; filename="contrato.pdf"`
    *   `Content-Type: application/pdf`

### 1.5. Deletar Documento
*   **Método**: `DELETE`
*   **Rota**: `/api/processes/:processId/documents/:documentId`
*   **Resposta**: `200 OK` informando sucesso da deleção física do registro no banco e arquivamento em `/trash` no storage.
