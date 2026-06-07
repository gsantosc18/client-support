# Documentação de CI/CD: Pipeline do GitHub Actions

Este documento descreve o fluxo de integração e entrega contínua (CI/CD) para automatizar a compilação e a publicação das imagens Docker do **Client Support Hub** no registry privado `registry.advocase.site`.

---

## 1. Visão Geral do Pipeline

O workflow do GitHub Actions está definido no arquivo [.github/workflows/docker-build-push.yml](file:///Users/gedalias.caldas/Documents/client-suport/.github/workflows/docker-build-push.yml). Ele automatiza o build das imagens otimizadas do frontend e do backend a cada nova versão publicada na plataforma de forma a garantir a paridade de ambientes e facilidade de deploy no Docker Swarm.

---

## 2. Gatilho de Execução (Trigger)

O pipeline executa automaticamente sob a seguinte condição:
* **Fechamento e Publicação de Release**: Ao criar e publicar uma nova Release com uma tag de versão no repositório do GitHub (evento `release` com tipo `published`).

---

## 3. Estrutura dos Jobs

O pipeline é composto por dois jobs paralelos para reduzir o tempo total de execução:

### 3.1. Build & Push Backend (`build-backend`)
* **Propósito**: Compilar o backend em Go, rodar o empacotamento multi-stage com o executável e as migrations e enviar para o registry.
* **Tags Geradas**:
  * `registry.advocase.site/client-support/backend:<tag_da_release>` (ex: `v1.2.0`)
  * `registry.advocase.site/client-support/backend:latest`

### 3.2. Build & Push Frontend (`build-frontend`)
* **Propósito**: Compilar o frontend em Next.js no modo standalone, injetar a variável de ambiente `NEXT_PUBLIC_API_URL` e enviar a imagem final.
* **Variáveis Injetadas**:
  * `NEXT_PUBLIC_API_URL`: Valor configurado no secret `NEXT_PUBLIC_API_URL` (valor padrão fallback: `https://api.advocase.site/api`).
* **Tags Geradas**:
  * `registry.advocase.site/client-support/app:<tag_da_release>` (ex: `v1.2.0`)
  * `registry.advocase.site/client-support/app:latest`

---

## 4. Requisitos de Configuração (Secrets)

Para o funcionamento correto do pipeline, os seguintes segredos devem ser configurados no repositório do GitHub (em **Settings -> Secrets and variables -> Actions**):

| Secret | Descrição | Obrigatório? |
|---|---|---|
| `REGISTRY_USERNAME` | Usuário do registry privado `registry.advocase.site` | Sim |
| `REGISTRY_PASSWORD` | Senha ou Token de escrita no registry privado | Sim |
| `NEXT_PUBLIC_API_URL` | URL de produção da API utilizada pelo frontend | Não (Fallback: `https://api.advocase.site/api`) |

---

## 5. Cache de Build e Performance

O pipeline utiliza o **GitHub Actions Cache** (`type=gha`) com o Docker Buildx para armazenar as camadas intermediárias dos builds. Isso assegura que:
* Camadas de pacotes Node (`npm ci` no frontend) e dependências Go (`go mod download`) não sejam baixadas repetidamente se não houver alterações nos arquivos `package-lock.json` ou `go.sum`.
* O tempo total de build seja reduzido significativamente nas publicações de releases consecutivas.
