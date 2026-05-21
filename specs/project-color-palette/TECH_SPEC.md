# TECH SPEC: Nova Paleta de Cores do Projeto

## Arquitetura Técnica
A paleta de cores será exposta de duas maneiras integradas no frontend para máxima flexibilidade e performance:

1. **Variáveis CSS Nativas (:root)** em `app/src/app/globals.css`:
   Permite uso direto em CSS Vanilla puro e possibilita alteração dinâmica de temas em tempo de execução.
   ```css
   :root {
     --color-brand-sand: #a6988a;
     --color-brand-sage: #88a19f;
     --color-brand-teal: #6aabb5;
     --color-brand-cyan: #4bb4ca;
     --color-brand-vibrant: #1ec3ea;
   }
   ```

2. **Extensão de Tema do Tailwind CSS** em `app/tailwind.config.ts`:
   Mapeia as variáveis de CSS nativo para classes de utilidade do Tailwind (ex: `bg-brand-vibrant`, `text-brand-teal`), permitindo o desenvolvimento rápido mantendo o controle centralizado.
   ```typescript
   extend: {
     colors: {
       brand: {
         sand: 'var(--color-brand-sand)',
         sage: 'var(--color-brand-sage)',
         teal: 'var(--color-brand-teal)',
         cyan: 'var(--color-brand-cyan)',
         vibrant: 'var(--color-brand-vibrant)',
       }
     }
   }
   ```

## Dependências e Padrões
- Compatível com a engine do Tailwind CSS v3 configurada no projeto.
