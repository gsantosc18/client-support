# Security Specification — Alinhamento da Página de Listagem

Este documento descreve os mecanismos de segurança e validações exigidos para o acesso e manipulação das páginas de listagem.

---

## 1. Autenticação e Autorização

* **Proteção de Rotas:** O acesso às páginas de listagem (`/clients` e `/processes`) exige autenticação prévia via token JWT.
* **Cabeçalhos Obrigatórios:** Todas as requisições enviadas ao backend de listagem devem incluir o header `Authorization: Bearer <token>`.

---

## 2. Ações Destrutivas (Defensive Confirmations)

* Ao clicar no botão de exclusão de qualquer registro, a interface deve exibir obrigatoriamente um Modal de Exclusão.
* **Validação de Texto:** O botão de exclusão final deve permanecer desabilitado até que o usuário digite explicitamente o texto `"delete"` no campo de confirmação.
* Esta regra impede exclusões acidentais por cliques involuntários e garante a integridade dos dados operacionais.
