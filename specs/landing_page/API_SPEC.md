# API Specification: Landing Page

Este documento define os contratos de API consumidos ou afetados pela landing page.

---

## 1. Endpoints Consumidos

A landing page não realiza novas chamadas para APIs de dados ou processos, uma vez que é uma página de apresentação pública. Ela utiliza apenas o estado de autenticação local.

No entanto, caso o usuário já esteja autenticado, ela redireciona para a rota `/clients`, a qual consome os seguintes endpoints existentes do backend:

* **`GET /api/clients`**: Busca a lista de clientes cadastrados (caso a sessão esteja ativa).
* **`GET /api/company`**: Busca o nome da empresa para exibição no Header do painel (gerenciado pelo hook `useCompany` nas páginas protegidas).

---

## 2. Contratos de Redirecionamento

Não se aplicam contratos JSON adicionais nesta funcionalidade.
