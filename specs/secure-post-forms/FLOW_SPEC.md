# FLOW SPEC: Utilização de Método POST Explícito nos Formulários de Autenticação

## Fluxo
1. O usuário preenche e submete um formulário em qualquer tela de autenticação.
2. O formulário é processado e interceptado pelo JavaScript/React (`onSubmit`), executando requisições assíncronas `POST` para o backend.
3. Se o preventDefault por acaso falhar ou em cenários de fallback sem JS (acessibilidade básica), o navegador tentará submeter via POST (ao invés de expor credenciais na URL via GET padrão).
