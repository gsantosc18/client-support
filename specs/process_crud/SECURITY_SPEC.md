# Security Specification: Process CRUD

Este documento especifica os requisitos de segurança, validação de propriedade e controle de acesso para a feature de Processos e Estabelecimentos.

---

## 1. Autenticação e Autorização (RBAC & Tenant Isolation)

### 1.1. Isolamento Rigoroso de Tenant (Multitenancy)
* **Verificação de Propriedade**: Toda requisição ao backend (listagem, busca, criação, edição, alteração de status e deleção) deve validar se a empresa (`company_id`) associada ao registro corresponde ao `company_id` extraído do Token JWT do operador autenticado.
* **Filtros Automáticos**:
  * Ao buscar ou listar registros, a query SQL **deve** incluir explicitamente a cláusula `WHERE company_id = ?` utilizando o ID da empresa do operador.
  * Nunca permita que um ID de empresa seja enviado diretamente no corpo da requisição do cliente para definir a propriedade. O `company_id` é de uso exclusivo do servidor através da sessão autenticada.

### 1.2. Ativação de Recursos Vinculados
* **Validação de Clientes**: Antes de salvar ou editar um processo, o backend deve validar se todos os `client_ids` fornecidos pertencem à empresa do operador autenticado e se o status dos mesmos é `'ACTIVE'`.
* **Validação de Responsável**: O `user_id` fornecido para ser o responsável deve corresponder a um usuário que trabalha na mesma empresa do operador e que esteja ativo (`'ACTIVE'`).
* **Validação de Estabelecimento**: O `establishment_id` fornecido deve ser de um estabelecimento cadastrado para a empresa do operador autenticado.

---

## 2. Prevenção de Ataques e Segurança de Dados

### 2.1. SQL Injection (Injeção de SQL)
* Todas as interações com o banco de dados devem utilizar o ORM GORM de maneira segura, com queries parametrizadas (ex: `Where("id = ? AND company_id = ?", id, companyID)`).
* Nunca concatenar strings dinâmicas ou parâmetros recebidos do usuário nas instruções SQL.

### 2.2. XSS (Cross-Site Scripting)
* Todos os inputs textuais livres, como o número do `protocol` e as `observation` (observações), devem ser sanitizados no backend para remover tags HTML/Javascript antes da persistência.
* No frontend (React/Next.js), a renderização das observações deve ser feita de forma segura (utilizando o escape de strings nativo do JSX) para evitar a execução de scripts maliciosos.

### 2.3. Validação de Payload (Campos e Tipos)
* Validação rigorosa dos tipos de dados (ex: IDs devem ser validados como UUID v4 legítimos).
* O status do processo deve ser validado estritamente contra os enums permitidos (`PENDING`, `IN_PROGRESS`, `AWAITING_DOCUMENTATION`, `IN_ANALYSIS`, `COMPLETED`, `CANCELLED`). Qualquer outro valor deve resultar em erro imediato `400 Bad Request`.
