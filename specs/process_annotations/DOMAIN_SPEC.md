# Domain Specification: Process Annotations

Este documento define os agregados, entidades e regras de validação de domínio associados à gestão de Anotações de Processo.

---

## 1. Modelo de Domínio (Entidades e Relacionamentos)

### 1.1. Entidade: `Annotation` (Anotação)
Representa um registro individual de anotação/nota associada a um processo. Trata-se de uma entidade que pertence ao ciclo de vida do Agregado `Process`, mantendo a integridade referencial com a Empresa (`Company`) e com o Usuário autor (`User`).

* **Atributos**:
  * `ID`: Identificador Único (`uuid.UUID`) - Chave Primária.
  * `ProcessID`: Identificador do Processo Vinculado (`uuid.UUID`) - Chave Estrangeira.
  * `CompanyID`: Identificador da Empresa (`uuid.UUID`) - *Partition Key* para Isolamento de Tenant.
  * `UserID`: Identificador do Usuário Criador da Nota (`uuid.UUID`) - Autor da Anotação.
  * `Annotation`: Conteúdo em formato texto (`string`).
  * `Visibility`: Tipo de visibilidade da anotação (`AnnotationVisibility`).
  * `CreatedAt`: Timestamp de criação (`time.Time`).
  * `UpdatedAt`: Timestamp da última modificação (`time.Time`).

### 1.2. Enum: `AnnotationVisibility`
Define a política de classificação da anotação dentro da companhia.
* **Valores**:
  * `PUBLIC`: Anotação geral ou de interesse compartilhado.
  * `PRIVATE`: Anotação classificada como nota pessoal ou confidencial.
* **Observação**: Ambos os tipos de visibilidade são visíveis a todos os operadores ativos da mesma empresa que visualizarem o processo correspondente. A distinção atua como classificação descritiva (badge).

---

## 2. Regras de Validação do Domínio

### 2.1. Validações na Criação
* **Conteúdo Obrigatório**: O campo de texto da anotação (`annotation`) não pode ser nulo ou composto apenas de espaços vazios. Deve ter no mínimo 1 caractere e no máximo 10.000 caracteres.
* **Visibilidade Válida**: A visibilidade deve ser obrigatoriamente um valor mapeado no enum `AnnotationVisibility` (`PUBLIC` ou `PRIVATE`).
* **Coerência de Empresa (Tenant Isolation)**:
  * O `CompanyID` da anotação **deve** ser rigorosamente idêntico ao `CompanyID` do `Process` associado e ao `CompanyID` do usuário criador autenticado.

### 2.2. Validações na Modificação e Deleção (Regra de Negócio de Domínio)
* **Validação de Propriedade (Ownership)**:
  * Uma anotação só pode ser editada ou deletada se o `UserID` do requisitante for igual ao `UserID` persistido na anotação.
* **Validação de Janela de Tempo (15 Minutos)**:
  * A edição ou deleção só é permitida se a diferença de tempo entre o instante da requisição (`time.Now()`) e a data de criação (`annotation.CreatedAt`) for inferior ou igual a 15 minutos:
    $$\Delta t = t_{now} - t_{created\_at} \le 15\text{ minutos}$$
  * Caso a diferença seja superior a 15 minutos, a operação é rejeitada pelo domínio, disparando uma exceção de violação de regra de negócio (`ErrAnnotationModificationWindowExpired`).
