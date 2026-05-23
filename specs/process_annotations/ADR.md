# Architecture Decision Record (ADR)

Este documento registra as decisões de arquitetura e design tomadas durante a especificação da funcionalidade de Anotações de Processo.

---

## ADR-004: Modelagem e Tipagem de Chaves UUID para a Tabela Annotations

### Status
Aprovada

### Contexto
A especificação `SPEC.md` original sugere o uso de chaves primárias e chaves estrangeiras (`id`, `process_id`, `company_id`, `user_id`) no formato de inteiros. No entanto, a base de dados existente do sistema utiliza identificadores baseados em UUIDs para garantir segurança nas rotas, evitar ID harvesting e permitir o isolamento robusto de tenants em sistemas distribuídos.

### Decisão
Decidimos utilizar a tipagem `uuid.UUID` nas colunas de banco de dados e nos modelos Go/TypeScript para todos os identificadores relacionados à tabela `annotations`. A chave primária `id` será gerada automaticamente no PostgreSQL via função `uuid_generate_v4()`.

### Consequências
* **Prós**:
  * Consistência absoluta com o restante do ecossistema e esquema de banco de dados do projeto.
  * Facilidade de integração de dados e prevenção a ataques de enumeração direta de rotas.
* **Contras**:
  * Armazenamento ligeiramente maior de dados em disco do que tipos inteiros ordinários.

---

## ADR-005: Comportamento e Restrições de Visibilidade Privada

### Status
Aprovada (Atualizada)

### Contexto
O requisito define a existência de anotações com níveis de visibilidade "Pública" e "Privada". Havia ambiguidade se as anotações privadas seriam visíveis apenas para o autor ou compartilhadas com a empresa. O usuário especificou que todos os operadores pertencentes à mesma companhia do processo devem conseguir visualizar todas as anotações associadas a ele.

### Decisão
Decidimos que o tipo de visibilidade ("Pública" e "Privada") atua como um marcador descritivo (badge) visual na interface para fins organizacionais (sinalização interna). O banco de dados trará todos os registros vinculados ao processo do tenant, sem aplicar filtros por `user_id` na leitura de anotações privadas.

### Consequências
* **Prós**:
  * Simplicidade de implementação técnica (consultas simples no banco de dados e sem complexidades de controle de nível de usuário na leitura).
  * Comunicação e compartilhamento total de informações e notas internas sobre os casos entre toda a equipe da empresa.
* **Contras**:
  * Não há suporte para notas 100% secretas/pessoais que outros operadores da empresa não possam ver.

---

## ADR-006: Regra de Segurança do Intervalo de 15 Minutos para Edição/Exclusão

### Status
Aprovada

### Contexto
Para evitar alterações de histórico que comprometam a auditabilidade do acompanhamento do processo, a edição e exclusão de notas são restritas a um intervalo de até 15 minutos pós-criação. Esta regra pode sofrer tentativas de desvio caso implementada apenas no frontend.

### Decisão
Decidimos adotar a **Dupla Validação de Segurança (Double-Checked Timeframe)**:
1. **Frontend**: Oculta ou desativa dinamicamente os botões de ação na interface com base no cálculo temporal local atualizando a cada 30 segundos.
2. **Backend**: A camada de serviço calcula a diferença entre o carimbo atual do servidor e a data de criação persistida (`annotation.CreatedAt`). Caso passe de 15 minutos, a operação retorna erro e não altera o banco.

### Consequências
* **Prós**:
  * Alta auditabilidade e proteção total contra requisições fraudulentas diretas via API.
* **Contras**:
  * Diferença de sincronia entre os relógios do cliente e do servidor pode fazer o botão aparecer no frontend por alguns segundos a mais, mas o backend sempre garantirá a integridade final.
