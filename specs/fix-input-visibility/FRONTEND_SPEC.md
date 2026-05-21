# FRONTEND SPEC: Correção de Visibilidade do Texto nos Inputs de Login e Senha

## Páginas e Componentes Impactados
- **Componente**: `Input` (`app/src/components/forms/Input.tsx`).
- **Páginas**: Qualquer página que use este componente agnóstico (`/login`, `/register`, etc.).

## Estados da UI
- O input de login e senha deve ter classes de estilo explícitas:
  - Fundo claro: `bg-white`
  - Texto claro: `text-slate-900`
  - Fundo escuro (se aplicável): `dark:bg-slate-900`
  - Texto escuro (se aplicável): `dark:text-white`
  - Placeholder: `placeholder-slate-400` ou similar para manter contraste adequado.

## Acessibilidade e Responsividade
- O contraste de cor entre o texto e o fundo do input deve satisfazer os critérios WCAG AA (mínimo de 4.5:1).
