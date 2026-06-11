# ADR-001: Exibição do Perfil do Cliente via Modal nos Detalhes do Processo

## Contexto
O usuário precisa consultar as informações básicas de contato e os documentos de um cliente que está vinculado a um processo. Navegar para fora da página de detalhes do processo para a página do cliente quebra o fluxo de trabalho do operador, exigindo cliques adicionais para retornar ao processo original.

## Decisão
Decidimos implementar a visualização das informações do cliente utilizando uma janela modal diretamente na página de detalhes do processo. Isso melhora consideravelmente a experiência do usuário (UX), mantendo-o no fluxo contextual de análise do processo, e otimiza a rotina com cópia rápida de documentos.

## Consequências
- **Positivas**:
  - Melhoria significativa na produtividade e experiência do usuário.
  - Menos requisições de renderização de páginas completas.
- **Negativas**:
  - Pequeno acréscimo de complexidade no gerenciamento de estados na página de detalhes do processo.
