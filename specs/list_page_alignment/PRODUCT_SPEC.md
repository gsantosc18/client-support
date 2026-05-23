# Product Specification — Alinhamento da Página de Listagem

Define as especificações de produto, requisitos de usuário e critérios de aceitação para o alinhamento das páginas de listagem do sistema com as diretrizes do design system.

---

## 1. Objetivos

* **Consistência Visual:** Padronizar a interface das listagens de Clientes e Processos com as regras descritas no guia de padrões oficial (`list-page.md`).
* **Melhoria da Experiência do Usuário (UX):** Prover uma experiência de filtros e busca premium através de modais dedicados e chips de controle ágil, evitando poluição visual nas telas.

---

## 2. Requisitos Funcionais (RF)

* **RF-001:** O botão principal de criação deve possuir o rótulo `"+ Novo [Recurso]"` (ex: `"+ Novo Cliente"`, `"+ Novo Processo"`), com o caractere `+` representado graficamente por um ícone.
* **RF-002:** Os filtros devem ser ocultados por padrão e expostos através de um **Modal de Filtros**, acionado por um botão de funil alinhado à esquerda.
* **RF-003:** Filtros ativos na busca e status devem ser listados em uma área de tags/chips visuais acima da tabela.
* **RF-004:** Deve ser possível excluir chips de filtros ativos individualmente através de um botão `x` ou remover todos com um botão `"Limpar Filtros"`.
* **RF-005:** A paginação inferior deve listar no lado esquerdo a quantidade e faixa de registros no padrão `"Mostrando X–Y de Z registros"`.
* **RF-006:** A última coluna da tabela (Ações) deve possuir os botões com as seguintes representações visuais:
  * Visualização: Ícone de olho azul (`info`).
  * Edição: Ícone de lápis verde (`success`).
  * Exclusão: Ícone de lixeira vermelha (`destructive`).

---

## 3. Critérios de Aceite

* **CA-001:** O botão principal de criação deve estar alinhado à direita e acima da tabela.
* **CA-002:** A modal de filtros deve conter os botões `"Aplicar Filtros"` e `"Limpar Filtros"`.
* **CA-003:** O clique nas ações de exclusão deve manter a segurança defensiva atual (digitar a palavra `"delete"` para habilitar a confirmação).
* **CA-004:** A ordenação deve operar em fluxo estritamente binário de ordenação (`asc` / `desc`).
