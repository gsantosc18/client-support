# Security Specification: Client CRUD

Este documento especifica os requisitos e restrições de segurança do CRUD de Clientes, garantindo a proteção e o isolamento de dados.

---

## 1. Autenticação e Gestão de Sessão

* **Autenticação Obrigatória**: Todas as requisições HTTP expostas pela API de clientes devem passar obrigatoriamente pelo middleware de autenticação JWT (`middleware.Protected(blacklistRepo)`).
* **Bloqueio de Sessão Inválida**: Requisições contendo tokens expirados, adulterados ou revogados (presentes na blacklist do Redis) devem ser rejeitadas imediatamente com HTTP `401 Unauthorized`.
* **Fluxo de Proteção**: Em caso de erro 401 nas requisições do frontend, o interceptor do Axios deve limpar o estado de autenticação (fazer logout da Redux store e remover o `refreshToken` do `localStorage`) e redirecionar imediatamente o usuário para `/login`.

---

## 2. Multi-Tenancy (Isolamento de Dados por Empresa)

A segurança baseia-se na separação estrita de dados baseada em Tenant (`company_id`).

1. **Extração de Identidade**: O `company_id` deve ser lido exclusivamente do payload seguro do token JWT validado pelo middleware no backend.
2. **Sem Injeção Externa**: O frontend nunca deve enviar o `company_id` no corpo da requisição ou parâmetros de query para criar, listar, atualizar ou remover clientes.
3. **Escopo de Operações**:
   * **Criação**: O backend associa automaticamente o `company_id` extraído do JWT ao modelo de banco de dados antes de salvá-lo.
   * **Leitura (Lista e Detalhes)**: Toda consulta SQL gerada pelo GORM deve conter a cláusula `WHERE company_id = ?` usando o ID da empresa do usuário autenticado. Isso impede ataques de IDOR (Insecure Direct Object Reference) nos quais um usuário tenta ler dados de outra empresa alterando o UUID na URL.
   * **Atualização e Remoção**: A atualização e exclusão lógica de registros exige a correspondência dupla no filtro de busca: `id = ? AND company_id = ?`.

---

## 3. Validação e Prevenção de Ataques

* **Sanitização de Entradas**:
  * Caracteres especiais das máscaras (como em CPF e telefone) são removidos no frontend, diminuindo a superfície de entrada para apenas dígitos numéricos nos campos apropriados.
  * Inputs textuais devem passar por sanitização contra XSS (Cross-Site Scripting) na renderização do React (que já escapa strings nativamente).
* **Prevenção de SQL Injection**: Utilização do mapeador objeto-relacional GORM com parâmetros preparados para todas as consultas do banco de dados (evitando interpolação direta de strings nas queries SQL).
* **Validação de Propriedade**: Qualquer ação de desativação ou alteração valida se o usuário operador pertence à empresa proprietária do cliente consultado.
