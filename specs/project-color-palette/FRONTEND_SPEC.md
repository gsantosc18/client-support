# FRONTEND SPEC: Nova Paleta de Cores do Projeto

## Nomenclatura das Classes CSS / Tailwind
- `brand-sand` (`#a6988a`): Usada para elementos neutros terrosos, bordas suaves, fundos claros alternativos ou textos neutros.
- `brand-sage` (`#88a19f`): Usada para estados secundários, bordas decorativas de médio destaque ou fundos de cards discretos.
- `brand-teal` (`#6aabb5`): Usada para destaques de tamanho médio, ícones informativos e elementos de tom frio/estético.
- `brand-cyan` (`#4bb4ca`): Usada para botões secundários, estados de hover ou links corporativos de destaque médio.
- `brand-vibrant` (`#1ec3ea`): Usada para o foco principal de ação (CTAs), botões primários em destaque, barras de carregamento e badges ativos.

## Atribuições Semânticas de Fundo e Fonte (Regra: Fundo Claro e Fonte Escura)

Para garantir excelente legibilidade, contraste e estética premium, definimos estritamente que **toda a interface do projeto utilizará planos de fundo claros e tipografia em fontes escuras**.

### 1. Planos de Fundo (Sempre Claros)
- **Fundo Padrão do Body (Páginas)**: `bg-slate-50` ou `bg-white`.
- **Fundo de Cards, Containers e Formulários**: `bg-white`.
- **Fundo de Destaque Suave**: `bg-slate-100` ou variações claras integradas como opacidade suave do tom terroso `brand-sand` (ex: `bg-[#a6988a]/5` ou `bg-[#a6988a]/10`).
- **Fundo de Botões Primários**: `bg-brand-vibrant` (`#1ec3ea`) ou `bg-brand-cyan` (`#4bb4ca`), garantindo destaque interativo.

### 2. Fontes e Tipografia (Sempre Escuras)
- **Texto Principal (Body Text, Parágrafos, Labels de Formulário)**: `text-slate-900` ou `text-slate-950` (oferece excelente legibilidade sobre os fundos brancos/claros).
- **Textos Secundários / Suporte**: `text-slate-600` ou `text-brand-sage` (`#88a19f`) apenas para metadados secundários legíveis.
- **Títulos (Headings)**: `text-slate-900` (com realces pontuais em `text-brand-vibrant` / `#1ec3ea` para atrair a atenção do usuário).
