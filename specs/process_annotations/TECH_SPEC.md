# Technical Specification: Process Annotations

Este documento descreve a arquitetura técnica, divisão de camadas, DTOs, dependências e padrões obrigatórios para a implementação de Anotações de Processo.

---

## 1. Arquitetura do Backend (Golang)

A implementação no backend seguirá a arquitetura limpa (Clean Architecture) já estabelecida no projeto, dividida nas seguintes camadas sob a pasta `backend/`:

### 1.1. Camada de Domínio (`internal/domain/`)
* **[NEW] `annotation.go`**: Mapeamento da struct `Annotation`, constante de erros de domínio e a interface `AnnotationRepository`.

```go
package domain

import (
	"errors"
	"time"
	"github.com/google/uuid"
)

type AnnotationVisibility string

const (
	VisibilityPublic  AnnotationVisibility = "PUBLIC"
	VisibilityPrivate AnnotationVisibility = "PRIVATE"
)

var (
	ErrAnnotationNotFound                = errors.New("anotação não encontrada")
	ErrAnnotationModificationWindowExpired = errors.New("o limite de 15 minutos para edição/exclusão expirou")
	ErrAnnotationNotOwner                = errors.New("apenas o criador da anotação pode editá-la ou excluí-la")
	ErrAnnotationUnauthorized            = errors.New("não autorizado a visualizar esta anotação")
)

type Annotation struct {
	ID         uuid.UUID            `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	ProcessID  uuid.UUID            `json:"process_id" gorm:"type:uuid;not null;index:idx_annotations_process_created"`
	CompanyID  uuid.UUID            `json:"company_id" gorm:"type:uuid;not null"`
	UserID     uuid.UUID            `json:"user_id" gorm:"type:uuid;not null"`
	Annotation string               `json:"annotation" gorm:"type:text;not null"`
	Visibility AnnotationVisibility `json:"visibility" gorm:"type:varchar(10);not null;default:'PUBLIC'"`
	CreatedAt  time.Time            `json:"created_at" gorm:"index:idx_annotations_process_created,sort:desc"`
	UpdatedAt  time.Time            `json:"updated_at"`
}

type AnnotationRepository interface {
	Create(annotation *Annotation) error
	FindByID(id uuid.UUID) (*Annotation, error)
	FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*Annotation, error)
	Update(annotation *Annotation) error
	Delete(id uuid.UUID) error
}
```

### 1.2. Camada de Repositório (`internal/repository/`)
* **[MODIFY] `internal/repository/postgres/annotation_repository.go`**: Implementação das consultas utilizando GORM:
  * O método `FindAllByProcess` traz todas as anotações associadas ao `processID` e `companyID` solicitados.
  * Cláusula SQL recomendada para consulta:
    `WHERE process_id = ? AND company_id = ?`

### 1.3. Camada de Serviço (`internal/service/`)
* **[NEW] `annotation_service.go`**: Encapsula regras de negócio.
  * Validações de criação (existência do processo e correspondência do `CompanyID`).
  * Validação temporal de 15 minutos para atualizações e exclusões:
    ```go
    if time.Since(annotation.CreatedAt) > 15*time.Minute {
        return domain.ErrAnnotationModificationWindowExpired
    }
    ```
  * Validação de propriedade (`UserID` do token deve ser igual ao `UserID` da anotação).

### 1.4. Camada de Handlers/HTTP (`internal/handlers/http/`)
* **[NEW] `annotation_handler.go`**: Controlador HTTP implementando as seguintes rotas baseadas em Fiber:
  * Parse das chaves através do JWT de autenticação (`c.Locals("user_id")` e `c.Locals("company_id")`).
  * Tratamento adequado de erros de domínio com códigos HTTP coerentes (`400 Bad Request` para limite estourado, `403 Forbidden` para falta de permissão).

---

## 2. Arquitetura do Frontend (Next.js & TypeScript)

A implementação no frontend seguirá a organização de domínios na pasta `app/src/features/`:

### 2.1. Camada de Serviços e Hooks
* **[NEW] `app/src/features/processes/services/annotationService.ts`**: Métodos para efetuar requisições HTTP (`fetch` ou `axios`) aos endpoints de anotações de processo.
* **[NEW] `app/src/features/processes/hooks/useProcessAnnotations.ts`**: Custom hooks encapsulando o React Query (`useQuery` para carregar, `useMutation` para criar, atualizar e deletar). Facilita o controle de estado e invalidação de cache (refetch).

### 2.2. Componentes Visuais (TailwindCSS)
* **[NEW] `app/src/features/processes/components/ProcessAnnotations.tsx`**: Painel container das anotações no rodapé da página de detalhes do processo. Controla o formulário de inclusão rápida e a listagem.
* **[NEW] `app/src/features/processes/components/AnnotationCard.tsx`**: Card individual de cada nota.
  * Deve conter: Nome do criador, data formatada (ex: `Há 2 minutos` ou `23/05/2026 10:45`), texto do comentário e badge de visibilidade ("Pública" ou "Privada").
  * Exibe dinamicamente os botões de editar/deletar dependendo da checagem reativa de tempo (15 minutos) e propriedade.
