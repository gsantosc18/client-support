# Technical Specification: Containerização de Frontend e Backend

Este documento descreve a arquitetura técnica detalhada, as receitas de build multi-stage para Docker, caching de camadas, orquestração local e estratégias de compilação.

---

## 1. Arquitetura Técnica do Dockerfile do Backend (Golang)

O Backend utilizará uma abordagem de compilação multi-stage estrita. Isso assegura que nenhuma ferramenta de compilação (como compilador Go, git, etc.) esteja presente na imagem final de produção.

### 1.1. Estrutura do Dockerfile de Produção (`backend/Dockerfile`)

```dockerfile
# Stage 1: Compilador e Construtor
FROM golang:1.25-alpine AS builder

# Instala ferramentas essenciais de compilação e migração
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Copia e faz download das dependências primeiro (aproveita cache de layers)
COPY go.mod go.sum ./
RUN go mod download

# Copia o restante do código-fonte
COPY . .

# Compila o binário otimizado de forma estática
# -ldflags="-s -w" remove informações de debug e símbolos reduzindo o tamanho do binário
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/api/main.go

# Instala o Goose separadamente para rodar migrações
RUN CGO_ENABLED=0 go install github.com/pressly/goose/v3/cmd/goose@latest

# Stage 2: Runtime de Produção Seguro
FROM alpine:3.19 AS runner

# Instala certificados HTTPS e fusos horários
RUN apk add --no-cache ca-certificates tzdata

# Cria um usuário não-raiz com permissões restritas
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copia o binário e executável de migração do builder
COPY --from=builder /app/main .
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY --from=builder /app/migrations ./migrations

# Ajusta as permissões para o usuário appuser
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Inicializa executando migrations e depois o app
CMD ["sh", "-c", "goose -dir ./migrations postgres \"$DATABASE_URL\" up && ./main"]
```

---

## 2. Arquitetura Técnica do Dockerfile do Frontend (Next.js)

O Next.js por padrão carrega milhares de dependências que não são necessárias para rodar em produção. Utilizaremos o recurso `standalone` do Next.js.

### 2.1. Ativação no `next.config.mjs`
Para habilitar o standalone build, o arquivo `next.config.mjs` deve conter:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

### 2.2. Estrutura do Dockerfile de Produção (`app/Dockerfile`)

```dockerfile
# Stage 1: Instalação de dependências
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Compilação do App Next.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Define variáveis públicas de build caso necessário
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Imagem Final de Produção Standalone
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1

# Cria e configura usuário node integrado
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

# Copia arquivos estáticos públicos
COPY --from=builder /app/public ./public

# Copia a saída do build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 3. Orquestração de Rede e Serviços (Docker Compose)

O arquivo `docker-compose.yml` gerencia a conectividade interna de rede e as regras de inicialização segura:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: root
      POSTGRES_PASSWORD: rootpassword
      POSTGRES_DB: client_support
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U root -d client_support"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=host=db user=root password=rootpassword dbname=client_support port=5432 sslmode=disable TimeZone=UTC
      - REDIS_URL=redis:6379
      - LOCAL_STORAGE_PATH=/app/storage
      - USE_S3=false
    volumes:
      - ./storage:/app/storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8080/api
    depends_on:
      - backend

volumes:
  pgdata:
  redisdata:
```

---

## 4. Padrões Técnicos Obrigatórios

1. **Uso de `.dockerignore`**: Para cada subpasta (`app/` e `backend/`), deve haver um arquivo `.dockerignore` configurado para prevenir que arquivos desnecessários como `.next/`, `node_modules/`, `coverage/`, `.git` ou binários locais Go entrem no build context do Docker.
2. **Nenhuma porta exposta desprotegida**: Apenas as portas especificadas (3000, 8080, 5432, 6379) são abertas externamente no host de desenv.
3. **Gerenciamento de Cache**: O comando `COPY package*.json ./` e `RUN npm ci` ou `COPY go.mod go.sum ./` e `RUN go mod download` devem sempre ocorrer antes da cópia integral do código para otimizar o tempo de build em builds subsequentes.
