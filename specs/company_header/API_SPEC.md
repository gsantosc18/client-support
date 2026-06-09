# Especificação de API: Obter Informações da Empresa Autenticada

Este documento define os contratos de API HTTP para comunicação entre frontend e backend referente à funcionalidade de Empresa.

---

## 1. Rota de Consulta de Dados da Empresa

Retorna os detalhes da empresa correspondente ao usuário logado na sessão ativa.

* **URL**: `/api/company`
* **Método**: `GET`
* **Headers obrigatórios**:
  * `Authorization: Bearer <JWT_ACCESS_TOKEN>`

---

## 2. Respostas Esperadas

### Sucesso (200 OK)

* **Código HTTP**: `200`
* **Corpo da Resposta (JSON)**:
  ```json
  {
    "id": "e9db195c-7d9a-4c2c-8cb0-cf324976722d",
    "name": "Nome da Empresa Exemplo Ltda",
    "status": "ACTIVE",
    "created_at": "2026-06-09T06:00:00Z",
    "updated_at": "2026-06-09T06:30:00Z"
  }
  ```

---

## 3. Códigos de Erro Esperados

### Token Ausente ou Inválido (401 Unauthorized)

* **Código HTTP**: `401`
* **Descrição**: Ocorre se o cabeçalho `Authorization` estiver ausente, mal formatado ou se o token expirou/foi colocado na blacklist.
* **Corpo da Resposta (JSON)**:
  ```json
  {
    "error": "Token ausente ou mal formatado"
  }
  ```
  ou
  ```json
  {
    "error": "Não autorizado: company_id ausente"
  }
  ```

### Empresa Não Encontrada (404 Not Found)

* **Código HTTP**: `404`
* **Descrição**: Ocorre se a empresa especificada no JWT do usuário não existir no banco de dados.
* **Corpo da Resposta (JSON)**:
  ```json
  {
    "error": "Empresa não encontrada"
  }
  ```

### Erro Interno do Servidor (500 Internal Server Error)

* **Código HTTP**: `500`
* **Descrição**: Falha inesperada ao consultar o repositório ou banco de dados.
* **Corpo da Resposta (JSON)**:
  ```json
  {
    "error": "mensagem detalhada do erro do banco/servidor"
  }
  ```
