# Especificação de Segurança: Consulta e Cache de Empresa

Este documento aborda os aspectos de segurança, autenticação e autorização relacionados à rota de API de Empresa e às informações armazenadas em cache.

---

## 1. Autenticação e Rastreabilidade

* **Middleware JWT**: A rota `/api/company` deve ser protegida obrigatoriamente pelo middleware `middleware.Protected(blacklistRepo)`.
* **Identificação Segura**: A identificação da empresa consultada não é fornecida via parâmetros de URL ou corpo da requisição. Ela é extraída de forma segura de dentro das declarações assinadas criptograficamente (claims) do JWT do usuário autenticado (`claims.CompanyID`). Isso impede qualquer tentativa de manipulação de parâmetros (IDOR - Insecure Direct Object References).

---

## 2. Isolamento de Dados (Tenant Isolation)

* **Restrição de Empresa**: O backend valida que o usuário que realiza a consulta de empresa só tem acesso à própria empresa (`CompanyID`) contida no seu token.
* **Segurança do Cache Redis**: As chaves do cache Redis de empresas são prefixadas e separadas por UUID da empresa (`company:<uuid>`). Como cada empresa possui uma chave exclusiva, não há perigo de vazamento ou colisão de dados entre diferentes empresas registradas no sistema.

---

## 3. Segurança do Cache no Cliente (Web Storage)

* **Armazenamento de Sessão**:
  * Se o usuário marcou "Lembrar de mim" no login, o nome da empresa e o token são guardados no `localStorage` (persiste após fechar o navegador).
  * Se não marcou, são armazenados no `sessionStorage` (excluídos assim que a aba/navegador é fechado).
* **Mitigação de XSS**: Os valores armazenados no Web Storage são apenas para exibição visual. Nenhuma decisão de autorização crítica de negócio no backend é tomada baseada em dados que o cliente envia, mas sim baseada estritamente na validação criptográfica do token JWT assinado.
* **Limpeza Garantida**: A rotina de logout no cliente deve obrigatoriamente invocar a exclusão física das chaves `accessToken` e `companyName` dos dois tipos de armazenamento (`localStorage` e `sessionStorage`).
