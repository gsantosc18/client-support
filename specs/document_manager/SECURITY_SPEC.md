# SECURITY_SPEC.md - Especificação de Segurança

## 1. Isolamento Multi-Tenancy
*   Toda operação de banco de dados ou de acesso físico a arquivos em disco/nuvem lê obrigatoriamente as variáveis `company_id` descriptografadas a partir do token de sessão JWT do operador autenticado no Fiber (`c.Locals("company_id")`).
*   Qualquer tentativa de passar parâmetros de `company_id` ou `user_id` de forma explícita pelo JSON do payload ou pela URL é ignorada pelo backend para evitar brechas de Privilege Escalation.

---

## 2. Prevenção de Path Traversal
*   Nomes de arquivos enviados sofreram sanitização rigorosa via `path/filepath` no Go, expurgando sequências de pontos duplicados (`../`) e delimitadores inadequados para evitar vazamentos de diretórios do sistema host.

---

## 3. Prevenção de Ataques de Overwrite
*   No frontend, substituições acidentais de arquivos ativos são mitigadas por meio da obrigatoriedade do preenchimento da string exata `"alterar documento"` em campo de entrada de dupla barreira.
