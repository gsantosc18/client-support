# Especificação de Domínio: Empresa e Cache de Domínio

Este documento detalha o modelo de domínio do domínio `Company` e os contratos de repositório, incluindo o cache no backend.

---

## 1. Agregado de Empresa (Company Aggregate)

O agregado `Company` já está presente no domínio do backend (`backend/internal/domain/company.go`).

### Estrutura do Domínio

* **Entidade**: `Company`
  * `ID`: Identificador único (UUID).
  * `Name`: Nome comercial/cadastrado da empresa (String).
  * `Status`: Estado da empresa (`ACTIVE` ou `INACTIVE`).
  * `CreatedAt`: Timestamp de criação.
  * `UpdatedAt`: Timestamp de última modificação.

* **Regras de Negócio do Domínio**:
  * Uma empresa só é elegível se seu status for `ACTIVE`.
  * Se o status for `INACTIVE`, as requisições vinculadas a esta empresa devem falhar ou ser rejeitadas.

---

## 2. Contrato do Repositório (Repository Contract)

O repositório expõe métodos para recuperar os dados do agregado.

```go
type CompanyRepository interface {
    FindByID(id uuid.UUID) (*Company, error)
}
```

---

## 3. Padrão Decorator para Caching de Domínio

Para garantir que o cache de banco de dados seja implementado de forma transparente e aderente aos princípios SOLID (Single Responsibility e Interface Segregations), utilizaremos o padrão **Decorator**.

* **`postgres.CompanyRepository`**: Responsável pela leitura e escrita no banco de dados físico (MariaDB).
* **`redis.CompanyRepository`**: Um decorator que implementa a interface `domain.CompanyRepository`. Ele tenta resolver as consultas primeiro via Redis. Caso falhe ou ocorra um cache miss, ele delega a busca para o repositório MariaDB e armazena o resultado no Redis com um tempo de expiração determinado.

---

## 4. Estado da UI no Frontend

No domínio do frontend, a informação da empresa logada é considerada um sub-estado da sessão ativa do usuário.
* **Estado**: `companyName: string | null`
* **Transições**:
  * `LOGIN_SUCCESS` -> Inicializa o fluxo de recuperação da empresa.
  * `FETCH_COMPANY_SUCCESS` -> Armazena o nome da empresa no estado em memória (Redux) e no Web Storage.
  * `LOGOUT` -> Redefine o estado de `companyName` para `null` e apaga do Web Storage.
