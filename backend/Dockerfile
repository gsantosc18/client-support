# Stage 1: Compilador e Construtor
FROM golang:alpine AS builder

# Instala ferramentas essenciais
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Copia e faz download das dependências primeiro para cache de layers
COPY go.mod go.sum ./
RUN go mod download

# Copia o restante do código-fonte
COPY . .

# Compila o binário otimizado estaticamente
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main ./cmd/api/main.go

# Instala o Goose para migrações
RUN CGO_ENABLED=0 go install github.com/pressly/goose/v3/cmd/goose@latest

# Stage 2: Runtime de Produção Seguro
FROM alpine:latest

# Instala certificados HTTPS e fusos horários
RUN apk add --no-cache ca-certificates tzdata

# Cria um usuário não-raiz com permissões restritas
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copia executáveis, migrações e configurações do builder
COPY --from=builder /app/main .
COPY --from=builder /go/bin/goose /usr/local/bin/goose
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/configs ./configs

# Ajusta as permissões para o usuário appuser
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Inicializa executando migrations e depois o app
CMD ["sh", "-c", "goose -dir ./migrations postgres \"$DATABASE_URL\" up && ./main"]
