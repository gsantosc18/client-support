ADR-002
Garantia de Estilos e Cores Explícitas nos Componentes de Formulário Agnósticos

Contexto
Os componentes de formulário agnósticos, como o `Input`, herdavam estilos globais de cor e plano de fundo (como `color` e `background-color`) definidos na raiz da página ou pelas configurações padrão do sistema (como Dark Mode do SO ou do navegador). Isso fazia com que, sob certas preferências do sistema, o texto digitado ficasse com a mesma cor do plano de fundo (ex: texto branco em fundo branco), impossibilitando o usuário de visualizar o que estava sendo digitado nos campos de e-mail e senha da página de login.

Decisão
Definir explicitamente as classes do Tailwind CSS para cor de fundo (`bg-white` e `dark:bg-slate-900`) e cor do texto (`text-slate-900` e `dark:text-white`) diretamente na definição básica do componente agnóstico `Input.tsx`.

Consequências
O componente será autossuficiente e consistente visualmente em todas as páginas onde for importado, prevenindo problemas semelhantes em outras telas como Cadastro de Usuário e Alteração de Senha, além de melhorar a conformidade com as diretrizes de acessibilidade WCAG.
