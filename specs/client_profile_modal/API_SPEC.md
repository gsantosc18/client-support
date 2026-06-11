# API Spec: Client Profile Modal in Process Details

## Endpoints Consumidos

Esta feature consome o endpoint de busca de cliente por ID existente no backend.

### 1. Obter Detalhes do Cliente
* **Método**: `GET`
* **Caminho**: `/api/clients/:id`
* **Autenticação**: Requer token JWT no header `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK)**:
```json
{
  "id": "uuid-do-cliente",
  "company_id": "uuid-da-empresa",
  "full_name": "Nome do Cliente",
  "email": "cliente@email.com",
  "phone": "(11) 99999-9999",
  "birth_date": "1990-01-01",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "cnh": "12345678901",
  "status": "ACTIVE",
  "created_at": "2026-06-11T00:00:00Z",
  "updated_at": "2026-06-11T00:00:00Z"
}
```
* **Respostas de Erro**:
  - `401 Unauthorized`: Token ausente ou inválido.
  - `404 Not Found`: Cliente não encontrado.
  - `500 Internal Server Error`: Erro inesperado no servidor.
