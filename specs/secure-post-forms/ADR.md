ADR-003
Utilização de Método POST Explícito em Formulários de Autenticação e Credenciais

Contexto
Até então, os formulários do frontend de autenticação (Login, Cadastro de Usuário, Recuperação de Senha e Redefinição de Senha) não declaravam explicitamente o atributo de método HTTP (`method="post"`). Por padrão do HTML5, a ausência de especificação faz com que o formulário submeta por padrão via GET. Embora tenhamos handlers React tratando a submissão no lado do cliente, a omissão reduz a semântica de segurança, prejudica gerenciadores de senhas e traz o risco de exposição de dados confidenciais por URL em cenários de falha.

Decisão
Tornar obrigatória e implementar a declaração do atributo `method="post"` em todas as tags `<form>` que realizam transações e tráfego de credenciais ou dados pessoais sensíveis nas telas do frontend do projeto.

Consequências
Melhoria na semântica do HTML5, suporte nativo robusto para preenchimento de senhas de modo seguro pelos navegadores, mitigação contra vazamento acidental de credenciais via parâmetros de URL (caso ocorram erros no JS/preventDefault) e aumento de conformidade nos testes E2E e de segurança do aplicativo.
