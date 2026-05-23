# API Specification — Alinhamento de Páginas de Formulário

Este documento formaliza as integrações de API consumidas pelos formulários refatorados. Não há alterações nos contratos de endpoints no backend; este documento assegura o acoplamento exato entre os modelos sanitizados de formulário no frontend e os payloads HTTP esperados.

---

## 1. Endpoints de Clientes

### A. Criar Cliente
- **POST** `/api/v1/clients`
- **Autenticação**: JWT Bearer Token (`Authorization` Header).
- **Request Payloads**:
```json
{
  "full_name": "João da Silva",
  "email": "joao@email.com",
  "phone": "11988887777",
  "birth_date": "1990-05-15",
  "cpf": "12345678901",
  "rg": "123456789",
  "cnh": "12345678900"
}
```
- **Responses**:
  - `201 Created`: Cliente criado com sucesso.
  - `400 Bad Request`: Parâmetros inválidos ou CPF duplicado.
  - `401 Unauthorized`: Token inválido ou expirado.

### B. Editar Cliente
- **PUT** `/api/v1/clients/:id`
- **Request Payloads**:
```json
{
  "full_name": "João da Silva Alterado",
  "email": "joao.silva@email.com",
  "phone": "11988887777",
  "birth_date": "1990-05-15",
  "cpf": "12345678901",
  "rg": "123456789",
  "cnh": "12345678900",
  "status": "ACTIVE"
}
```

---

## 2. Endpoints de Processos

### A. Criar Processo
- **POST** `/api/v1/processes`
- **Request Payloads**:
```json
{
  "user_id": "uuid-do-responsavel",
  "establishment_id": "uuid-do-estabelecimento",
  "protocol": "PROC-2026-99",
  "observation": "Observações do andamento do processo.",
  "status": "PENDING",
  "client_ids": ["uuid-cliente-1", "uuid-cliente-2"]
}
```

### B. Editar Processo
- **PUT** `/api/v1/processes/:id`
- **Request Payloads**:
```json
{
  "user_id": "uuid-do-responsavel",
  "establishment_id": "uuid-do-estabelecimento",
  "protocol": "PROC-2026-99",
  "observation": "Anotações atualizadas.",
  "status": "IN_PROGRESS",
  "client_ids": ["uuid-cliente-1", "uuid-cliente-2"]
}
```
