# TECH SPEC: Cores Claras nos Inputs de Autenticação

## Divisão de Camadas e Dependências
- **Componente**: `app/src/components/forms/Input.tsx`.
- **Problema**: O componente de Input possuía classes condicionais `dark:bg-slate-900` e `dark:text-white`. Sob preferências de Dark Mode do sistema ou navegador, isso invertia as cores para escuro, conflitando com a nova diretriz de que toda a interface gráfica do projeto deve possuir **fundo claro e fontes escuras**.

## Solução Técnica
Modificar o componente agnóstico `Input.tsx` para remover as classes condicionais `dark:bg-slate-900`, `dark:text-white` e `dark:placeholder-slate-500`. Desta forma, o input sempre exibirá o plano de fundo claro (`bg-white`), texto escuro (`text-slate-900`) e placeholder cinza (`placeholder-slate-400`), mesmo se o ambiente ou tags HTML globais estiverem configuradas sob tema escuro.

Exemplo de mudança na string de classes:
```typescript
'px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-slate-900 placeholder-slate-400'
```
