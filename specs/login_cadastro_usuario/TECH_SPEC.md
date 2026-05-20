# Technical Specification

## Arquitetura Técnica
- **Backend**: Golang com Clean Architecture (Handlers -> Services -> Repositories). Banco PostgreSQL. Redis (ou BD) para Token Blacklist.
- **Frontend**: Next.js (React), TailwindCSS, Redux.
- **Comunicação**: HTTP/REST com autenticação via JWT (Access/Refresh Tokens).

## Módulos Backend
- `auth`: Handlers para login, cadastro, recovery, reset.
- `user`: Gerenciamento de usuários.
- `company`: Validação de companhias.

## Estratégias de Integração
- Envio de e-mail por SMTP próprio do backend rodando em background (goroutine).
- Token Blacklist usando armazenamento rápido ou tabela de tokens invalidados no banco.
