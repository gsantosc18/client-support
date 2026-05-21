ADR-005
Forçar Estilização de Fundo Claro e Texto Escuro no Componente Agnóstico de Input

Contexto
Com a definição da regra estrita de design do projeto de que toda a interface gráfica do projeto deve adotar planos de fundo claros e tipografia em fontes escuras, o componente agnóstico `Input.tsx` possuía classes condicionais de tema escuro (`dark:bg-slate-900` / `dark:text-white`). Isso fazia com que, sob a preferência de Dark Mode de navegadores ou sistemas operacionais, as cores dos inputs fossem invertidas para tons escuros. Essa reversão quebrava a consistência estética do design system claro planejado.

Decisão
Remover todas as classes condicionais `dark:` relacionadas a cores de fundo, texto e placeholders no componente `Input.tsx`, garantindo que o componente sempre seja renderizado com fundo branco limpo (`bg-white`), texto escuro nítido (`text-slate-900`) e placeholder cinza (`placeholder-slate-400`).

Consequências
Garantia de consistência estética absoluta nos campos de formulário, eliminação de regressões visuais de legibilidade (contraste invisível ou texto branco em fundo branco) e simplificação do código de estilização do componente.
