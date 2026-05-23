# Architectural Decision Record — Alinhamento de Páginas de Listagem

## ADR-001: Migração de Filtros Inline para Sistema de Modal com Funil

### Contexto
Atualmente, as listagens de Clientes e Processos renderizam seus filtros inline diretamente no corpo da página. Isso consome espaço vertical nobre da tela em desktops e espreme a tabela em dispositivos móveis, além de destoar das diretrizes visuais unificadas definidas no documento de padrões do projeto (`list-page.md`).

### Decisão
Decidiu-se encapsular toda a lógica de filtros e busca em um **Modal de Filtros** flutuante ativado por um botão com ícone de funil alinhado à esquerda. O estado ativo dos filtros será exposto horizontalmente acima da tabela através de chips interativos individuais de fácil remoção.

### Consequências
* **Positivas:**
  * Interface extremamente limpa, moderna e premium.
  * Otimização do espaço visual, permitindo que a tabela ocupe mais espaço vertical útil por padrão.
  * Experiência responsiva perfeita, pois os filtros se adaptam ao tamanho de tela de forma nativa no modal.
  * Rápida identificação dos filtros aplicados por meio dos chips visuais.
* **Negativas / Desafios:**
  * Aumento da quantidade de cliques para aplicar novos filtros (requer abrir a modal). Esse impacto é mitigado pelo suporte à submissão automática pressionando a tecla `Enter`.
