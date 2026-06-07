# Tarefas de Implementação: GitHub Actions para Build e Push de Imagens Docker

Este documento lista as tarefas necessárias para implementar o pipeline de build e push das imagens Docker para o registry privado quando uma release for fechada.

## Infraestrutura / DevOps

- [ ] Criar o diretório de workflows `.github/workflows/` na raiz do projeto.
- [ ] Criar o arquivo de workflow `.github/workflows/docker-build-push.yml`.
- [ ] Configurar o gatilho do workflow (`release` com tipo `published`).
- [ ] Configurar o job de build e push para o **Backend** (`registry.advocase.site/client-support/backend`).
- [ ] Configurar o job de build e push para o **Frontend** (`registry.advocase.site/client-support/app`).
- [ ] Habilitar o Docker Buildx e configurar o cache de camadas (`gha`).
- [ ] Configurar as tags da imagem dinamicamente: `latest` e o nome da tag da release (`${{ github.event.release.tag_name }}`).
- [ ] Passar a URL de produção da API (`NEXT_PUBLIC_API_URL`) como build-arg no frontend.
