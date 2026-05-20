FROM golang:alpine

WORKDIR /app

# Instala o Goose para migrações
RUN go install github.com/pressly/goose/v3/cmd/goose@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main ./cmd/api/main.go

# Na inicialização, executa as migrações e depois o app
CMD ["sh", "-c", "goose -dir ./migrations postgres \"$DATABASE_URL\" up && ./main"]
