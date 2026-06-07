# Frontend Specification: GitHub Actions para Build e Push de Imagens Docker

Este documento detalha o processo de build e empacotamento da aplicação Frontend (Next.js) durante a execução do pipeline de CI/CD.

---

## 1. Processo de Compilação do Frontend

O build do frontend Next.js é sensível ao tempo de compilação porque as variáveis de ambiente com o prefixo `NEXT_PUBLIC_` são embutidas estaticamente no bundle do navegador.

### Injeção de Variáveis em Tempo de Compilação (Build Time):
O pipeline passará a URL da API do backend através do argumento de build:
```yaml
build-args: |
  NEXT_PUBLIC_API_URL=${{ github.event.inputs.next_public_api_url || secrets.NEXT_PUBLIC_API_URL || 'https://api.advocase.site/api' }}
```
Isso assegura que a aplicação aponte corretamente para a API de produção após ser publicada.

---

## 2. Otimização do Empacotamento (Standalone)

O Dockerfile do frontend já está estruturado para utilizar o modo `standalone` do Next.js. O pipeline do GitHub Actions garante que:
* Apenas os arquivos estáticos compilados e o bundle minimalista sejam empacotados na imagem final de produção (removendo `node_modules` completos de build).
* O usuário que executa a imagem no container final é o `nextjs` (não-root) para maior segurança no runtime do cluster Swarm.
* O tamanho total do contêiner final seja menor que 180MB.
