# Stage 1: Instalação de dependências
FROM node:18-alpine AS deps
# Adiciona libc6-compat para compatibilidade nativa de libs do alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Compilação do App Next.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Recebe a URL da API e ID da empresa no build-time para embutir nos arquivos estáticos compiled
ARG BACKEND_URL=http://localhost:8080/api
ARG NEXT_PUBLIC_COMPANY_ID

# Validação: Quebra o build se NEXT_PUBLIC_COMPANY_ID estiver vazio
RUN if [ -z "$NEXT_PUBLIC_COMPANY_ID" ]; then \
      echo "ERRO: O argumento de build NEXT_PUBLIC_COMPANY_ID é obrigatório e não foi fornecido!" && exit 1; \
    fi

ENV BACKEND_URL=$BACKEND_URL
ENV NEXT_PUBLIC_COMPANY_ID=$NEXT_PUBLIC_COMPANY_ID
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Stage 3: Imagem Final de Produção Standalone
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED 1

# Cria e configura usuário de privilégio mínimo
RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs

# Copia assets estáticos
COPY --from=builder /app/public ./public

# Copia arquivos standalone do build Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
