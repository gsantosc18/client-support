# API Specification: GitHub Actions para Build e Push de Imagens Docker

Este documento descreve as interfaces e contratos de comunicação do pipeline, bem como gatilhos de API do GitHub.

---

## 1. Entrada Manual (Trigger API)

O pipeline pode ser disparado manualmente via API do GitHub ou pela interface web usando a especificação `workflow_dispatch`.

### Contrato de Entrada (Manual Dispatch):
Não são exigidos parâmetros obrigatórios adicionais na inicialização manual. Opcionalmente, pode ser configurado um input para customizar a URL da API no build-time do frontend:

```yaml
on:
  workflow_dispatch:
    inputs:
      next_public_api_url:
        description: 'URL da API produtiva para embutir no build do Frontend'
        required: false
        default: 'https://api.advocase.site/api'
```

---

## 2. Contrato com o Docker Registry (HTTP API)

A comunicação com o registro privado segue a especificação padrão da Docker Registry HTTP API V2.

### Rotas e Operações Utilizadas pelo Workflow:
* **Autenticação**:
  * `POST /v2/token`
  * Retorno: Token JWT de portador (Bearer token).
* **Upload de Camadas (Blobs)**:
  * `POST /v2/<name>/blobs/uploads/`
* **Upload do Manifesto da Imagem**:
  * `PUT /v2/<name>/manifests/<tag>`
  * Tag de destino: `latest` e/ou o short SHA do commit (ex: `sha-d29a5fa`).
