# Design System e Identidade Visual do Projeto (Frontend)

Este documento descreve as diretrizes visuais, tokens de estilo e a paleta de cores central do projeto.

---

## Diretriz de Ouro: Fundo Claro e Fonte Escura

Para assegurar excelente legibilidade, contraste em conformidade com as regras de acessibilidade (WCAG AA) e um visual premium moderno, a interface do projeto adota estritamente o layout com **planos de fundo sempre claros** e **tipografia em fontes escuras**.

### Planos de Fundo (Claridade)
- **Fundo Principal (Páginas)**: `bg-slate-50` ou `bg-white` (com detalhes e degradês harmônicos baseados nas cores da paleta).
- **Fundo de Cards, Modais e Formulários**: `bg-white` com divisores/bordas em `border-brand-sand`.
- **Seções Decorativas / Destaques Suaves**: Opacidade ultra-suave baseada na paleta terrosa, como `bg-[#a6988a]/5` ou `bg-[#a6988a]/10`.

### Fontes e Tipografia (Escuridão)
- **Texto Principal (Parágrafos, Inputs, Labels)**: `text-slate-900` ou `text-slate-950` (garante excelente legibilidade sobre fundos claros).
- **Títulos**: `text-slate-900` (com realces pontuais baseados nas cores vibrantes do projeto).
- **Rótulos (Labels) e Textos de Suporte**: `text-slate-600` ou `text-brand-sage` (`#88a19f`).

---

## Paleta de Cores Oficial (`brand`)

As cores estão centralizadas como variáveis customizadas de CSS (`CSS Variables`) no arquivo de estilos globais (`globals.css`) e estendidas de forma semântica no tema do Tailwind CSS (`tailwind.config.ts`):

| Token Tailwind | Variável CSS | Código Hex | Função Semântica |
| :--- | :--- | :--- | :--- |
| `brand-sand` | `--color-brand-sand` | `#a6988a` | Neutro terroso para divisores, bordas de cards e fundos suaves secundários. |
| `brand-sage` | `--color-brand-sage` | `#88a19f` | Rótulos de suporte, placeholders alternativos e pequenos textos secundários. |
| `brand-teal` | `--color-brand-teal` | `#6aabb5` | Destaques decorativos médios de tom frio e ícones estéticos. |
| `brand-cyan` | `--color-brand-cyan` | `#4bb4ca` | Estados `:hover` de botões, links corporativos interativos e focos secundários. |
| `brand-vibrant` | `--color-brand-vibrant` | `#1ec3ea` | Foco principal de ação (CTAs), botões em destaque e badges ativos. |

---

## Como Utilizar no Desenvolvimento

### 1. Utilizando via Tailwind CSS (Recomendado)
Você pode utilizar as classes de utilidade padrão do Tailwind diretamente:
```tsx
// Botão de Destaque
<button className="bg-brand-vibrant text-slate-950 px-4 py-2 rounded-md hover:bg-brand-cyan transition-colors">
  Acessar Sistema
</button>

// Card com borda personalizada
<div className="bg-white border border-brand-sand p-6 rounded-xl">
  <h3 className="text-slate-900 font-bold">Título do Card</h3>
  <p className="text-slate-600">Descrição principal legível.</p>
</div>
```

### 2. Utilizando via CSS Vanilla Puro
Caso precise escrever estilos agnósticos em arquivos CSS vanilla, utilize as variáveis customizadas:
```css
.card-personalizado {
  background-color: var(--color-brand-sand);
  border: 1px solid var(--color-brand-sage);
}
```
