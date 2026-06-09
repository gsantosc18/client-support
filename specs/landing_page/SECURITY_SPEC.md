# Security Specification: Landing Page

Este documento detalha as diretrizes de segurança aplicadas à landing page pública.

---

## 1. Controle de Acesso e Rota Pública

* **Rota Púbica**: A rota raiz `/` deve ser permanentemente pública. Não deve haver middleware ou guardas de rota impedindo o acesso.
* **Segurança do Cliente**: Nenhuma informação sensível do backend (como chaves de API secretas, credenciais de banco ou logs confidenciais) deve ser embutida no bundle estático da landing page.

---

## 2. Inspeção Segura de Tokens e Redirecionamentos

* **Validação Local**: A verificação de `isAuthenticated` lê apenas a existência do `accessToken` na memória ou nos Web Storages locais.
* **Proteção contra Cross-Site Scripting (XSS)**: Qualquer componente reativo na landing page que renderize dinamicamente dados da sessão (se houver, como nome do usuário/empresa) deve passar por sanitização padrão do React para prevenir injeções de HTML ou scripts.
* **Headers de Segurança**: A página herda as políticas globais de Content Security Policy (CSP), X-Frame-Options e X-Content-Type-Options configuradas no servidor Next.js e no proxy reverso do deploy.
