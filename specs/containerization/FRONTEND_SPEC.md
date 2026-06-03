# Frontend Specification: Containerização de Frontend e Backend

Este documento especifica a arquitetura de empacotamento, tratamento de variáveis de ambiente e otimizações de assets estáticos do container de Frontend (Next.js).

---

## 1. Arquitetura da Imagem Next.js Standalone

Ao rodar `next build`, por padrão o Next.js gera uma estrutura que depende da instalação completa do diretório `node_modules`. Ativando `output: 'standalone'`, o Next.js cria um subconjunto isolado de dependências copiando apenas os arquivos estritamente necessários para rodar o servidor em produção.

```text
app/.next/
├── standalone/       # Pasta autocontida de produção
│   ├── server.js     # Ponto de entrada do servidor Node.js
│   ├── app/src/      # Subconjunto mínimo do código compilado
│   └── node_modules/ # Apenas as dependências usadas no runtime
└── static/           # CSS compilado e JS (deve ser servido pelo container)
```

No `Dockerfile` final do Frontend, isolamos o build em três estágios para garantir que os arquivos estáticos e o standalone fiquem separados, reduzindo o tamanho da imagem final de **1.2GB** para menos de **150MB**.

---

## 2. Tratamento de Variáveis de Ambiente (Build-time vs Runtime)

No ecossistema Next.js, as variáveis prefixadas com `NEXT_PUBLIC_` são embutidas estaticamente no código durante o build time (`npm run build`).

> [!WARNING]
> Como a variável `NEXT_PUBLIC_API_URL` é embutida estaticamente no build do Next.js, qualquer mudança no endpoint do backend necessita de um rebuild da imagem de produção. Para desenvolvimento local, configuramos o valor padrão `http://localhost:8080/api`.

* **Variáveis de Build (Build-Time)**:
  * `NEXT_PUBLIC_API_URL`: URL de acesso à API do backend pelo browser.
* **Variáveis de Execução (Runtime)**:
  * `PORT`: Porta na qual o servidor Node.js escutará internamente (default: 3000).
  * `HOSTNAME`: IP de escuta (configurado para `0.0.0.0` para permitir acesso de fora do container).

---

## 3. Otimização de Assets e Cache de Imagens

O Next.js possui um otimizador de imagens embutido (`next/image`).
* **Dependência Nativa**: Para garantir que a otimização de imagens funcione no Alpine Linux sem quebras, adicionamos a biblioteca `libc6-compat` via `apk add` nos estágios iniciais de build do Dockerfile.
* **Cache em Produção**: O cache gerado pelo otimizador de imagens e pelo roteador do Next.js fica gravado na pasta `.next/cache`. No container de produção, este cache é efêmero. Caso persistência persistente seja necessária em alta escala, um volume para a pasta `.next/cache` pode ser montado.
