# Security Specification: Client Delete

Este documento detalha os requisitos de segurança, autenticação, validação de propriedade (tenant isolation) e integridade na deleção física de clientes.

---

## 1. Autenticação e Autorização

* **Controle de Acesso**: O endpoint `DELETE /api/v1/clients/:id` deve requerer obrigatoriamente autenticação baseada em token JWT.
* **Extraction**: O middleware de autenticação (`AuthMiddleware`) deve extrair o `user_id` e o `company_id` do payload do token JWT e injetá-los no contexto do Fiber (`c.Locals("company_id")`).

---

## 2. Validação de Propriedade (Tenant Isolation / Multitenancy)

Para evitar exclusões entre empresas (ID Harvesting / Insecure Direct Object Reference - IDOR):

1. **Escopo de Busca**: O backend deve validar a existência do cliente limitando a consulta estritamente à empresa do usuário logado:
   ```sql
   SELECT * FROM clients WHERE id = $1 AND company_id = $2;
   ```
2. **Negação de Acesso**: Se o cliente com o ID especificado existir, mas pertencer a outra empresa (`company_id` diferente), o backend deve retornar imediatamente `404 Not Found` (ou `403 Forbidden`) em vez de confirmar a existência de dados.

---

## 3. Segurança dos Dados Históricos (JSON de Auditoria)

* **Campos Confidenciais**: Os dados armazenados no JSON na tabela `deleted_clients` devem incluir dados cadastrais normais, mas a infraestrutura física de armazenamento deve ter controles de acesso restritos, já que esses dados de auditoria não estarão expostos na interface visual da plataforma.
* **Integridade Transacional**: A operação de gravação em `deleted_clients` e exclusão de `clients` deve ser atômica. Se a gravação de auditoria falhar por qualquer motivo (ex: disco cheio, falha de integridade), a deleção do cliente principal é abortada e revertida, mantendo a consistência.
