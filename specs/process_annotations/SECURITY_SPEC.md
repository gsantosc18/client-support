# Security Specification: Process Annotations

Este documento descreve as políticas de segurança da informação, controles de acesso, isolamento de dados e sanitizações aplicados à funcionalidade de Anotações de Processo.

---

## 1. Autenticação e Identidade (JWT)
* Todas as requisições destinadas aos endpoints de anotação necessitam passar pelo middleware de proteção JWT (`Protected`).
* O backend deve obter a identidade do requisitante (`user_id` e `company_id`) diretamente das claims seguras do token JWT decodificado no contexto da requisição (`c.Locals`), nunca confiando em IDs enviados no corpo do JSON da requisição.

---

## 2. Isolamento Estrito de Tenant (Multitenancy)
* **Validação Cruzada**:
  * Ao criar uma nova anotação, o backend deve assegurar que o `process_id` informado pertence à mesma empresa (`company_id`) registrada nas claims do token JWT do usuário ativo.
  * O `company_id` persistido na tabela `annotations` deve ser atribuído pelo backend de forma automática a partir das claims seguras, blindando o banco de dados contra tentativas de injeção cruzada de tenants.

---

## 3. Autorização de Leitura Compartilhada (Pública vs. Privada)
* Como as anotações privadas continuam legíveis para todos os operadores ativos pertencentes à mesma empresa que acessam o processo correspondente, o repositório PostgreSQL não necessita aplicar filtros baseados em `user_id` na leitura.
* O controle de acesso e isolamento na leitura reside integralmente na validação do `company_id` (Tenant Isolation), impossibilitando o vazamento de anotações (de qualquer tipo) para outras empresas.

---

## 4. Validação de Escrita Baseada em Tempo e Ownership
* As rotas de atualização (`PUT`) e exclusão (`DELETE`) devem aplicar uma verificação de duas etapas na camada de serviço do backend:
  1. **Dono do Registro**: O `user_id` da claim do JWT deve ser rigorosamente igual ao `user_id` gravado na anotação sob modificação. Qualquer discrepância retorna `403 Forbidden`.
  2. **Validação Temporal**: A diferença temporal entre a hora atual do servidor (`time.Now()`) e a data de criação (`annotation.CreatedAt`) deve ser de no máximo **15 minutos**. Caso ultrapasse essa janela, a transação é cancelada e retorna `400 Bad Request` com o erro `ErrAnnotationModificationWindowExpired`.
* **Segurança Adicional**: O campo `created_at` e `visibility` nunca podem ser alterados após a persistência inicial. O payload do `PUT` aceita unicamente a modificação do campo `annotation` (conteúdo de texto).

---

## 5. Prevenção contra Ataques de Injeção e Cross-Site Scripting (XSS)
* **Sanitização de Entrada (Backend)**:
  * Todo texto submetido no campo `annotation` deve ser limpo de tags HTML, scripts maliciosos ou strings de injeção antes de ser persistido no banco de dados.
* **Escapamento na Renderização (Frontend)**:
  * O componente React deve renderizar a anotação escapando o HTML de forma nativa (não utilizar propriedades como `dangerouslySetInnerHTML`), assegurando a inocuidade de qualquer tentativa de injeção de script de forma persistente.
