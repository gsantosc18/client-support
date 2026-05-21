ADR-004
Definição Centralizada da Paleta de Cores via CSS Variables e Tailwind Theme

Contexto
Com a definição da nova paleta de cores corporativa baseada em tons terrosos, sage, teal e ciano vibrante, é fundamental que a implementação do design system seja feita de maneira flexível, limpa e centralizada. Se as cores forem declaradas em formato rígido (hardcoded) apenas no Tailwind, o suporte a múltiplos temas e reestilizações dinâmicas futuras exigiria reescrever arquivos de estilo ou compilar novos bundles.

Decisão
Implementar a nova paleta de cores definindo-as primeiro como variáveis customizadas de CSS (`CSS Variables`) sob a pseudo-classe `:root` no arquivo de estilos globais (`globals.css`). Posteriormente, estender o tema de cores do Tailwind CSS (`tailwind.config.ts`) mapeando nomes semânticos (ex: `brand-vibrant`) que utilizam estas variáveis como valores.

Consequências
Centralização total dos valores cromáticos da interface no CSS global, permitindo mudanças dinâmicas no lado do cliente ou futuros temas (como dark mode dedicado) de forma imediata. Manutenção da produtividade do desenvolvimento utilizando classes utilitárias semânticas nativas do Tailwind CSS (`bg-brand-vibrant`, `text-brand-sage`, etc.).
