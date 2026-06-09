# Especificação Técnica: Cache de Empresa e Header Centralizado

Este documento detalha o desenho técnico da solução e como ela se encaixa na arquitetura existente.

---

## 1. Arquitetura do Backend (Golang & Fiber)

### Camada de Repositório

Criaremos um repositório decorador para implementar cache utilizando Redis:

* **Local**: `backend/internal/repository/redis/company_repository.go`
* **Implementação**:
  * Recebe o repositório DB (`domain.CompanyRepository`), o cliente Redis (`*redis.Client`) e o TTL (`time.Duration`).
  * Utiliza a chave `company:<uuid>` no Redis.
  * Armazena os dados serializados em JSON.

### Camada de Serviço

Criaremos o serviço de empresas:

* **Local**: `backend/internal/service/company.go`
* **Assinatura**:
  ```go
  type CompanyService struct {
      companyRepo domain.CompanyRepository
  }
  ```

### Camada de Transporte (HTTP Handler)

Criaremos o handler HTTP para receber requisições de empresas:

* **Local**: `backend/internal/handlers/http/company_handler.go`
* **Funcionalidade**:
  * Método `GetCompany(c *fiber.Ctx)`
  * Extrai `company_id` do context local (definido pelo middleware JWT).
  * Retorna o JSON da empresa autenticada.

### Bootstrap (main.go)

Ajustaremos a inicialização das dependências no `backend/cmd/api/main.go`:
```go
rawCompanyRepo := postgres.NewCompanyRepository(db)
companyRepo := redis.NewCompanyRepository(rawCompanyRepo, rdb, 24*time.Hour)
```

E registraremos a rota sob o grupo seguro `/api`:
```go
api.Get("/company", middleware.Protected(blacklistRepo), companyHandler.GetCompany)
```

---

## 2. Arquitetura do Frontend (Next.js & Redux Toolkit)

### Estado Global e Persistência de Sessão

Estenderemos o `authSlice` em `app/src/state/authStore.ts`:
* Incluir `companyName: string | null` no `AuthState`.
* Inicializar `companyName` via função `getInitialCompany()` lendo `localStorage` ou `sessionStorage` (para sincronizar com o estado de reload).
* Adicionar a action `setCompany(state, action: PayloadAction<string>)`.
* Garantir a limpeza do campo no reducer `logout`.

### Feature Company

Criaremos o módulo de empresas em `app/src/features/company`:

1. **`app/src/features/company/services/company.service.ts`**:
   * Faz requisição HTTP `GET /company` usando o cliente do axios configurado em `app/src/services/api.ts`.
2. **`app/src/features/company/hooks/useCompany.ts`**:
   * Gerencia a leitura do estado Redux.
   * Dispara a chamada ao serviço caso o usuário esteja autenticado, mas a empresa não esteja presente no estado global (resolvendo o cache miss no frontend).
   * Atualiza a store global e armazena no Web Storage.

### Componente Header Centralizado

* **Local**: `app/src/components/Header.tsx`
* **Motivação**: Eliminar a duplicação do cabeçalho HTML/CSS presente em `ClientListPage.tsx` e `ProcessListPage.tsx`.
* **Responsabilidade**: Renderizar o logo/nome da empresa de forma reativa, links de navegação para Clientes e Processos destacando a página ativa usando `usePathname()`, e o botão de logout.
