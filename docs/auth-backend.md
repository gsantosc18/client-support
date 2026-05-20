# Documentação do Backend: Módulo de Autenticação

## Visão Geral

O módulo de autenticação é responsável por gerenciar o ciclo de vida dos usuários (cadastro, login, recuperação de senha e logout). Foi desenvolvido em Golang utilizando o framework Fiber e GORM para persistência no PostgreSQL, além de Redis para gestão da Token Blacklist.

## Arquitetura

O projeto adere ao **Clean Architecture**:
- `internal/domain`: Contém as entidades principais (`User`, `Company`, `PasswordRecoveryToken`) e contratos de interface para os repositórios.
- `internal/repository`: Implementações de acesso a dados (PostgreSQL com GORM e Redis para Blacklist).
- `internal/service`: Contém as regras de negócio (`AuthService`, `EmailService`), assegurando que a lógica principal seja independente de frameworks web.
- `internal/handlers`: Camada de entrega. O `auth_handler.go` processa requisições HTTP do Fiber.
- `pkg/utils`: Utilitários isolados como criptografia (`bcrypt`), regras de validação de senha e geração de tokens JWT.

---

## Configuração e Inicialização (Viper & YAML)

Para atender aos requisitos técnicos, as configurações do serviço são centralizadas em um arquivo YAML e carregadas utilizando a biblioteca **Viper**.

* **Arquivo de Configuração**: [configs/config.yaml](file:///Users/gedalias.caldas/Documents/client-suport/backend/configs/config.yaml) armazena os valores locais padrão para o servidor, banco de dados, Redis e chave do JWT.
* **Módulo de Carregamento**: O pacote [internal/config](file:///Users/gedalias.caldas/Documents/client-suport/backend/internal/config/config.go) faz a busca do arquivo em múltiplos caminhos de busca para garantir a portabilidade de execução do binário e dos testes unitários e de integração.
* **Sobrescrita por Variáveis de Ambiente**: O Viper realiza o binding automático e prioritário das seguintes variáveis de ambiente, com precedência sobre o arquivo YAML:
  * `PORT` -> `server.port` (Porta do servidor Fiber)
  * `DATABASE_URL` -> `database.url` (DSN do PostgreSQL)
  * `REDIS_URL` -> `redis.url` (Endereço do Redis)
  * `JWT_SECRET` -> `jwt.secret` (Segredo de assinatura dos tokens)

---

## Regras de Segurança e Negócio

### 1. Validação de Senha Forte
Toda senha de usuário criada no `Register` ou redefinida no `ResetPassword` é submetida a um validador de senha rígido (`ValidatePassword` no `pkg/utils`):
- Mínimo de 8 caracteres.
- Pelo menos 1 número.
- Pelo menos 1 símbolo (ex: `@`, `$`, `!`).
- Pelo menos 1 letra maiúscula e 1 letra minúscula.
- **Prevenção de Sequências Comuns:** Bloqueia sequências de 3 caracteres (ex: `123`, `abc`, `qwe`).
- **Simpatia de Dados:** Bloqueia o uso de dados pessoais (como o nome, sobrenome, email ou telefone do usuário) na composição da senha.

### 2. Bloqueio de Login Temporário (Lockout)
Para combater ataques de força bruta, a política de login impõe o bloqueio temporário de conta:
- Limite máximo de **3 tentativas consecutivas incorretas**.
- Bloqueio temporário por **30 minutos** (`LockedUntil`).
- Retorno de status `401 Unauthorized` com mensagem clara de bloqueio nas requisições subsequentes.

### 3. Invalidação de Sessão (Logout Blacklist)
O endpoint de `Logout` realiza a invalidação segura de sessões ativas:
- O token JWT recebido no header `Authorization: Bearer <token>` é inserido no Redis.
- Permanece na blacklist do Redis com o tempo de expiração igual ao tempo de expiração remanescente do próprio token (TTL dinâmico).
- O middleware de JWT (`Protected`) valida a blacklist em todas as chamadas rotas autenticadas.

---

## Endpoints da API

Todas as rotas iniciam com o prefixo `/api/auth`.

### `POST /api/auth/register`
Realiza o cadastro do usuário.
- **Query Params**: `company_id` (Obrigatório, UUID da companhia ativa).
- **Body**: `first_name`, `last_name`, `email`, `phone`, `birth_date`, `password`, `password_confirm`, `terms_accepted`.
- **Regras**: E-mail único na companhia, validação rigorosa de senha.

### `POST /api/auth/login`
Autentica o usuário no sistema.
- **Body**: `email`, `password`, `company_id`, `keep_me_logged_in` (boolean).
- **Regras**: Retorna `access_token` (30min) e `refresh_token` (30min ou 7 dias). Bloqueia após 3 falhas.

### `POST /api/auth/forgot-password`
Solicita link de recuperação.
- **Body**: `email`, `company_id`.
- **Regras**: Não expõe erro se usuário não existir, prevenindo enumeração de e-mails.

### `POST /api/auth/reset-password`
Redefine a senha via token de recuperação válido.
- **Body**: `token`, `password`, `password_confirm`.
- **Regras**: Invalida o token após o uso bem-sucedido.

### `POST /api/auth/logout`
Invalida a sessão do usuário inserindo o token JWT ativo na Blacklist.
- **Headers**: `Authorization: Bearer <access_token>` (Obrigatório).
- **Respostas**:
  - `200 OK`: Logout realizado com sucesso (token invalidado).
  - `401 Unauthorized`: Token inválido, expirado ou já presente na Blacklist do Redis (prevenção contra replay).

---

## Cobertura e Estratégia de Testes (QA)

O backend possui uma cobertura total de statements superior a **80%** (**81.2% obtidos**), estruturada em duas metodologias:

### 1. Testes Unitários Isolados
Focados em testar o comportamento de funções puras e regras de negócio sem acoplamento a rede ou bancos reais:
- **Service Layer Mocking:** `AuthService` testado com injeção de repositórios mockados (`MockUserRepository`, etc.) via biblioteca `testify/mock`.
- **HTTP Handler Isolation:** O Fiber router é instanciado de forma puramente isolada por caso de teste na pasta `handlers/http`, sem acoplamento de servidores físicos.

### 2. Testes de Integração com Banco e Redis
- **GORM Transaction Rollback (PostgreSQL):** Conecta-se à base de dados local (`localhost:5432`). Roda todos os testes CRUD dentro de uma transação GORM (`db.Begin()`) que realiza Rollback completo ao final, mantendo o banco de dados impecável.
- **Redis TTL-based testing:** Conecta-se ao Redis local (`localhost:6379`) para testar inserção e consulta da Blacklist. Roda com mecanismo de skipping robusto (`t.Skip`) caso as portas dos bancos locais estejam indisponíveis.

### Comando para Execução
```bash
make tests-back
```
*(ou execute `go test ./... -coverprofile=coverage.out && go tool cover -func=coverage.out` na pasta backend)*
