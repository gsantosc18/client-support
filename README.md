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

## Documentação Técnica e Infraestrutura

Para detalhes avançados sobre a arquitetura de containerização, otimizações de build multi-stage/standalone, segurança (Hardening) e mapeamento de redes, consulte a [Documentação de Infraestrutura](file:///Users/gedalias.caldas/Documents/client-suport/docs/infra-containerization.md).