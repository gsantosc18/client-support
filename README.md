# Client Support

Este é um projeto que visa realizar o gerenciamento de clientes e o acompanhamento de processos diversos.
O objetivo inicial é auxiliar usuários que prestam serviços de diversos tipos para seus clientes, desde consultoria até implementação de sistemas de informação, mas que não iremos focar somente neles.

# Deploy em Desenvolvimento

Para iniciar a infraestrutura em desenvolvimento, execute o seguinte comando:

```bash
make infra
```

O comando `make infra` irá:

1. Iniciar os serviços Docker:
   - PostgreSQL
   - Backend
   - App

2. Acessar o App em http://localhost:3000
3. Acessar o Backend em http://localhost:8080