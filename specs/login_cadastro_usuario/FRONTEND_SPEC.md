# Frontend Specification

## Páginas
- `/login`: Formulário de login com e-mail, senha, manter logado.
- `/register`: Formulário de cadastro. Recebe `?company_id=XXX`.
- `/forgot-password`: Input de e-mail.
- `/reset-password`: Recebe `?token=XXX`. Input de nova senha.

## Stores / Estado
- **Auth Slice (Redux)**: Armazena estado de autenticação (logado ou não) e tokens (ou gerencia os acessos).

## Estratégia de Comunicação
- Interceptadores Axios (ou fetch wrap) para injetar o Access Token.
- Lógica de tentar usar Refresh Token quando Access expira (401).

## Validações (UI)
- Validação visual em tempo real para senha (check de 8 chars, maiúscula, número, especial, etc).
