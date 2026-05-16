# Client Support

Este é um projeto que visa realizar o gerenciamento de clientes e o acompanhamento de processos diversos.
O objetivo inicial é auxiliar usuários que prestam serviços de diversos tipos para seus clientes, desde consultoria até implementação de sistemas de informação, mas que não iremos focar somente neles.

# Estrutura do projeto

Este projeto é dividido em duas partes principais:
- Backend
- Frontend

Onde o Frontend se comunica com o Backend através do protocolo HTTP utilizando autenticação JWT, que é armazenado de forma segura.

# Backend

O backend é responsável por gerenciar os dados e regras de negócio do projeto.

## Tecnologias utilizadas

- GoLang
- Fiber
- Docker
- PostgreSQL

## Arquitetura

```
backend/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── handlers/
│   ├── service/
│   ├── repository/
│   ├── middleware/
│   ├── config/
│   └── database/
├── pkg/
│   ├── auth/
│   ├── utils/
│   ├── logger/
│   └── validator/
├── configs/
│   └── config.yaml
├── Dockerfile
├── go.mod
└── go.sum
```

# Frontend

O frontend é responsável por exibir os dados e permitir a interação do usuário com o sistema.

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- TailwindCSS

## Arquitetura

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (public)/
│   │   └── api/
│   ├── components/
│   ├── features/
│   ├── layouts/
│   ├── lib/
│   ├── providers/
│   ├── store/
│   ├── services/
│   ├── state/
│   └── styles/
└── ...
```

# Infraestrutura

Para iniciar a infraestrutura em desenvolvimento, execute o seguinte comando:

```bash
make infra
```

O comando `make infra` irá:

1. Iniciar os serviços Docker:
   - PostgreSQL
   - Backend
   - Frontend

2. Acessar o frontend em http://localhost:3000
3. Acessar o backend em http://localhost:8080