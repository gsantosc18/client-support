# Design System e Identidade Visual do Projeto

Este documento define os princípios visuais, tokens de design, diretrizes de acessibilidade e regras obrigatórias para desenvolvimento frontend assistido por IA.

O objetivo é garantir:

* consistência visual
* reutilização de componentes
* acessibilidade
* escalabilidade
* previsibilidade na geração de interfaces por IA

---

# 1. Princípios Visuais

## Estilo Visual do Projeto

O sistema segue uma identidade visual:

* minimalista
* corporativa moderna
* limpa e espaçada
* com baixo ruído visual
* foco em legibilidade
* bordas suaves
* sombras discretas
* uso moderado de cores vibrantes
* ícones preferencialmente outline
* superfícies claras como tema principal atual

---

# 2. Estratégia de Temas

## Tema Primário Atual

O sistema utiliza predominantemente:

* superfícies claras
* tipografia escura
* alto contraste visual

A arquitetura visual deve permanecer compatível com:

* dark mode futuro
* múltiplos temas
* customização visual futura

---

# 3. Regras Obrigatórias para IA e Desenvolvimento

## Restrições Obrigatórias

### Nunca:

* utilizar cores inline (`#hex`)
* utilizar classes arbitrárias do Tailwind (`bg-[#xxxxxx]`)
* utilizar espaçamentos arbitrários (`p-[17px]`)
* criar variantes de componentes sem definição prévia
* misturar padrões visuais
* utilizar sombras fora da escala definida
* utilizar radius fora da escala definida

### Sempre:

* utilizar tokens semânticos
* reutilizar componentes existentes
* seguir a escala tipográfica oficial
* seguir a escala de espaçamento oficial
* manter acessibilidade WCAG AA
* utilizar estados interativos padronizados
* priorizar composição ao invés de duplicação

---

# 4. Arquitetura de Tokens

## Estrutura de Tokens

Os tokens são divididos em:

### Primitive Tokens

Representam valores puros de design.

Exemplo:

* `blue-500`
* `slate-900`
* `8px`
* `16px`

### Semantic Tokens

Representam intenção visual.

Exemplo:

* `color-background-primary`
* `color-text-primary`
* `color-border-default`
* `color-action-primary`

### Component Tokens

Representam customizações específicas de componentes.

Exemplo:

* `button-primary-background`
* `card-border-color`
* `input-focus-ring`

---

# 5. Sistema de Cores

## Primitive Palette

| Token               | Hex       |
| ------------------- | --------- |
| `brand-sand-500`    | `#a6988a` |
| `brand-sage-500`    | `#88a19f` |
| `brand-teal-500`    | `#6aabb5` |
| `brand-cyan-500`    | `#4bb4ca` |
| `brand-vibrant-500` | `#1ec3ea` |

---

## Semantic Color Tokens

| Token                  | Uso                          |
| ---------------------- | ---------------------------- |
| `background-primary`   | Fundo principal da aplicação |
| `background-surface`   | Cards, modais e superfícies  |
| `background-muted`     | Seções secundárias           |
| `text-primary`         | Texto principal              |
| `text-secondary`       | Texto auxiliar               |
| `text-muted`           | Texto discreto               |
| `border-default`       | Bordas padrão                |
| `border-muted`         | Bordas suaves                |
| `action-primary`       | CTA principal                |
| `action-primary-hover` | Hover de CTA                 |
| `success`              | Estado positivo              |
| `warning`              | Estado de atenção            |
| `destructive`          | Estado de erro               |
| `info`                 | Estado informativo           |
| `focus-ring`           | Anel de foco acessível       |

---

# 6. Implementação dos Tokens

## CSS Variables

Todos os tokens devem ser centralizados em variáveis CSS globais.

```css
:root {
  --color-background-primary: #f8fafc;
  --color-background-surface: #ffffff;

  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;

  --color-border-default: #e2e8f0;

  --color-action-primary: #1ec3ea;
  --color-action-primary-hover: #4bb4ca;

  --color-focus-ring: #1ec3ea;
}
```

---

## Tailwind Theme Extension

```ts
colors: {
  background: {
    primary: "var(--color-background-primary)",
    surface: "var(--color-background-surface)",
  },

  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
  },

  border: {
    DEFAULT: "var(--color-border-default)",
  },

  action: {
    primary: "var(--color-action-primary)",
    hover: "var(--color-action-primary-hover)",
  },
}
```

---

# 7. Sistema Tipográfico

## Escala Tipográfica Oficial

| Papel      | Classe Base              |
| ---------- | ------------------------ |
| Display    | `text-5xl font-bold`     |
| H1         | `text-4xl font-bold`     |
| H2         | `text-3xl font-semibold` |
| H3         | `text-2xl font-semibold` |
| H4         | `text-xl font-medium`    |
| Body Large | `text-lg`                |
| Body       | `text-base`              |
| Small      | `text-sm`                |
| Caption    | `text-xs`                |

---

## Diretrizes Tipográficas

* Priorizar alta legibilidade
* Evitar textos excessivamente compactos
* Utilizar contraste WCAG AA
* Manter consistência entre headings
* Evitar múltiplos pesos desnecessários

---

# 8. Sistema de Espaçamento

## Escala Oficial

| Token        | Valor  |
| ------------ | ------ |
| `spacing-1`  | `4px`  |
| `spacing-2`  | `8px`  |
| `spacing-3`  | `12px` |
| `spacing-4`  | `16px` |
| `spacing-6`  | `24px` |
| `spacing-8`  | `32px` |
| `spacing-10` | `40px` |
| `spacing-12` | `48px` |

---

# 9. Sistema de Radius

| Token        | Valor  |
| ------------ | ------ |
| `radius-sm`  | `4px`  |
| `radius-md`  | `8px`  |
| `radius-lg`  | `12px` |
| `radius-xl`  | `16px` |
| `radius-2xl` | `24px` |

---

# 10. Sistema de Sombras

| Token       | Uso                      |
| ----------- | ------------------------ |
| `shadow-sm` | Inputs e elementos sutis |
| `shadow-md` | Cards                    |
| `shadow-lg` | Modais                   |
| `shadow-xl` | Superfícies elevadas     |

As sombras devem permanecer suaves e discretas.

---

# 11. Estados Interativos

Todos os componentes interativos devem possuir:

* hover
* focus-visible
* active
* disabled
* loading
* selected
* error

---

## Acessibilidade de Foco

Todo elemento focável deve possuir:

```tsx
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-focus-ring
focus-visible:ring-offset-2
```

---

# 12. Responsividade

## Estratégia Responsiva

O sistema segue:

* mobile first
* grids consistentes
* espaçamento adaptativo
* largura máxima controlada
* breakpoints padronizados

---

## Breakpoints

| Breakpoint | Valor    |
| ---------- | -------- |
| `sm`       | `640px`  |
| `md`       | `768px`  |
| `lg`       | `1024px` |
| `xl`       | `1280px` |
| `2xl`      | `1536px` |

---

# 13. Diretrizes de Componentes

## Componentes devem:

* ser reutilizáveis
* possuir variantes explícitas
* possuir tipagem forte
* evitar lógica visual inline
* utilizar composição
* possuir estados acessíveis
* evitar duplicação visual

---

# 14. Exemplo Correto de Implementação

## Botão Primário

```tsx
<button
  className="
    bg-action-primary
    hover:bg-action-hover
    text-text-primary
    px-4
    py-2
    rounded-lg
    transition-colors
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-focus-ring
  "
>
  Acessar Sistema
</button>
```

---

# 15. Estrutura Recomendada do Design System

```txt
/docs/design-system
  ├── principles.md
  ├── accessibility.md
  ├── responsive.md
  ├── ai-rules.md
  ├── tokens/
  │     ├── colors.md
  │     ├── spacing.md
  │     ├── typography.md
  │     ├── shadows.md
  │     └── radius.md
  └── components/
        ├── button.md
        ├── card.md
        ├── form.md
        ├── modal.md
        └── table.md
```

---

# 16. Objetivo Final

O Design System deve:

* reduzir inconsistência visual
* acelerar desenvolvimento
* melhorar previsibilidade da IA
* aumentar reutilização
* facilitar manutenção
* suportar crescimento do projeto
* permitir evolução futura de temas e identidade visual.
