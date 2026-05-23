# API Specification: Process Annotations

Este documento estabelece o contrato das rotas HTTP, payloads de requisição e resposta, códigos de status e tratamento de erros para a gestão de Anotações de Processo.

---

## 1. Definições Gerais
* **Autenticação**: Todas as chamadas necessitam de Token JWT válido no Header `Authorization` (`Bearer <JWT>`).
* **Headers Obrigatórios**:
  * `Authorization`: `Bearer <token>`
  * `Content-Type`: `application/json`

---

## 2. Endpoints da API

### 2.1. Criar Anotação
Cria uma nova anotação pública ou privada para um processo específico.

* **URL**: `/api/processes/:id/annotations`
* **Método**: `POST`
* **Parâmetros de Rota**:
  * `id`: UUID do Processo (`uuid.UUID`).
* **Payload da Requisição (`application/json`)**:
```json
{
  "annotation": "Esta é uma nota de acompanhamento do processo importante.",
  "visibility": "PUBLIC"
}
```
* **Nível de Visibilidade Válido**: `"PUBLIC"` ou `"PRIVATE"`.
* **Respostas**:
  * **201 Created**: Anotação criada com sucesso.
```json
{
  "id": "e8a9d0a1-432d-45d6-84e1-bf29cdbe1f50",
  "process_id": "a5d8c6b2-ef41-4770-9831-29e8c3b4a2f8",
  "company_id": "4b7b2521-12c4-4b51-b0db-6e6ad9d2bb91",
  "user_id": "7dc5e2f1-6cf1-455b-8012-1f5e82a3c2de",
  "annotation": "Esta é uma nota de acompanhamento do processo importante.",
  "visibility": "PUBLIC",
  "created_at": "2026-05-23T10:55:00Z",
  "updated_at": "2026-05-23T10:55:00Z"
}
```
  * **400 Bad Request**: Dados inválidos ou inconsistência de empresa.
```json
{
  "error": "BAD_REQUEST",
  "message": "o conteúdo da anotação não pode estar vazio"
}
```
  * **401 Unauthorized**: Token JWT inválido ou ausente.

---

### 2.2. Listar Anotações do Processo
Lista todas as anotações associadas a um processo específico, pertencentes ao mesmo tenant.

* **URL**: `/api/processes/:id/annotations`
* **Método**: `GET`
* **Parâmetros de Rota**:
  * `id`: UUID do Processo (`uuid.UUID`).
* **Respostas**:
  * **200 OK**: Retorna a lista completa de anotações (públicas e privadas) ordenadas do mais recente ao mais antigo.
```json
[
  {
    "id": "e8a9d0a1-432d-45d6-84e1-bf29cdbe1f50",
    "process_id": "a5d8c6b2-ef41-4770-9831-29e8c3b4a2f8",
    "company_id": "4b7b2521-12c4-4b51-b0db-6e6ad9d2bb91",
    "user_id": "7dc5e2f1-6cf1-455b-8012-1f5e82a3c2de",
    "annotation": "Esta é uma nota de acompanhamento do processo importante.",
    "visibility": "PUBLIC",
    "created_at": "2026-05-23T10:55:00Z",
    "updated_at": "2026-05-23T10:55:00Z"
  },
  {
    "id": "c1f7a3e8-5b23-4e4f-b5d1-cb29a4de50f2",
    "process_id": "a5d8c6b2-ef41-4770-9831-29e8c3b4a2f8",
    "company_id": "4b7b2521-12c4-4b51-b0db-6e6ad9d2bb91",
    "user_id": "7dc5e2f1-6cf1-455b-8012-1f5e82a3c2de",
    "annotation": "Lembrete interno particular sobre este caso.",
    "visibility": "PRIVATE",
    "created_at": "2026-05-23T10:50:00Z",
    "updated_at": "2026-05-23T10:50:00Z"
  }
]
```
> [!NOTE]
> Todos os usuários da mesma companhia do processo enxergam a listagem unificada de todas as anotações, sem ocultação ou filtragem condicional de leitura.

---

### 2.3. Editar Anotação (Dentro do Limite de 15 Minutos)
Atualiza o texto de uma anotação existente.

* **URL**: `/api/processes/:id/annotations/:annotation_id`
* **Método**: `PUT`
* **Parâmetros de Rota**:
  * `id`: UUID do Processo (`uuid.UUID`).
  * `annotation_id`: UUID da Anotação (`uuid.UUID`).
* **Payload da Requisição (`application/json`)**:
```json
{
  "annotation": "Texto atualizado dentro do prazo de 15 minutos."
}
```
* **Respostas**:
  * **200 OK**: Anotação editada com sucesso. Retorna o objeto atualizado.
  * **400 Bad Request**: Limite temporal de 15 minutos expirado.
```json
{
  "error": "BAD_REQUEST",
  "message": "o limite de 15 minutos para edição/exclusão expirou"
}
```
  * **403 Forbidden**: Tentativa de editar anotação de outro criador.
```json
{
  "error": "FORBIDDEN",
  "message": "apenas o criador da anotação pode editá-la ou excluí-la"
}
```

---

### 2.4. Excluir Anotação Permanentemente (Dentro do Limite de 15 Minutos)
Remove fisicamente do banco de dados uma anotação.

* **URL**: `/api/processes/:id/annotations/:annotation_id`
* **Método**: `DELETE`
* **Parâmetros de Rota**:
  * `id`: UUID do Processo (`uuid.UUID`).
  * `annotation_id`: UUID da Anotação (`uuid.UUID`).
* **Respostas**:
  * **200 OK**: Deleção realizada com sucesso.
```json
{
  "message": "Anotação excluída com sucesso.",
  "id": "e8a9d0a1-432d-45d6-84e1-bf29cdbe1f50"
}
```
  * **400 Bad Request**: Limite temporal expirado.
  * **403 Forbidden**: Usuário solicitante não é dono do registro.
```json
{
  "error": "FORBIDDEN",
  "message": "apenas o criador da anotação pode editá-la ou excluí-la"
}
```
