# TECH SPEC: Correção de Visibilidade do Texto nos Inputs de Login e Senha

## Divisão de Camadas e Dependências
- **Camada**: Componentes de UI Agnósticos (dentro de `app/src/components/forms/Input.tsx`).
- **Problema**: O elemento `<input>` não possui classes explícitas de cor do texto (`text-*`) nem cor de fundo (`bg-*`), fazendo com que herde a cor do texto do container pai (que pode ser branco sob preferências de modo escuro do sistema) e mantenha a cor de fundo do navegador padrão (branco), resultando em texto invisível (branco no branco).

## Solução Proposta
- Alterar o componente `Input` em `app/src/components/forms/Input.tsx` para definir explicitamente:
  - Cor de fundo: `bg-white`
  - Cor do texto: `text-slate-950`
- Adicionar compatibilidade opcional para suporte a dark mode futuro nos inputs:
  - `dark:bg-slate-900 dark:text-white dark:border-slate-700`
- Isso garantirá que o input seja renderizado corretamente independentemente das heranças de estilo CSS externas ou preferências de esquema de cor do navegador.
