# FRONTEND SPEC: Cores Claras nos Inputs de Autenticação

## Componentes Impactados
- **Input Agnóstico (`app/src/components/forms/Input.tsx`)**: Remoção das tags prefixadas com `dark:` que alteravam fundo e texto para cores escuras e claras de forma reversa sob preferências do sistema.

## Regras de Estilização Aplicadas
- **Fundo do Input (Background)**: `bg-white` (Sempre branco claro).
- **Cor da Borda**: `border-slate-300` com foco em `focus:border-blue-500` e anel em `focus:ring-blue-500`.
- **Cor do Texto (Font Color)**: `text-slate-900` (Sempre escuro para contraste excelente sobre fundo branco).
- **Placeholder**: `placeholder-slate-400`.
- **Labels**: `text-slate-700` (Texto escuro).
