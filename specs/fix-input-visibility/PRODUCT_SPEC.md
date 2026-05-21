# PRODUCT SPEC: Correção de Visibilidade do Texto nos Inputs de Login e Senha

## Objetivos da Feature / Bug Fix
- Corrigir o problema de usabilidade na tela de login onde os dados digitados nos campos de "E-mail" e "Senha" não aparecem visualmente devido a conflitos de temas/herança de estilos.
- Garantir alto contraste e legibilidade, independente do tema padrão do sistema operacional ou navegador (modo escuro/claro).

## Requisitos Funcionais
- O texto digitado pelo usuário nos inputs de e-mail e senha deve ser perfeitamente legível (cor contrastante).
- O fundo do input e a cor do texto devem ser explicitamente declarados.

## Regras de Negócio
- Nenhuma nova regra de negócio de login foi alterada.

## Critérios de Aceite
- Quando o usuário digita nos campos da página de login, o texto deve estar visível e em conformidade com as regras de contraste de acessibilidade (WCAG).
