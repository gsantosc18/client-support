# TECH SPEC: Utilização de Método POST Explícito nos Formulários de Autenticação

## Divisão de Camadas e Dependências
- **Camada**: Apresentação/Interface (Frontend).
- **Problema**: Omitir o atributo `method="post"` nos elementos `<form>` faz com que o navegador presuma o comportamento padrão do HTML5 (método `GET`). Embora o preventDefault previna a submissão nativa do HTML, essa omissão traz riscos e incoerências para gerenciadores de senhas dos navegadores, autofill e ferramentas de segurança que analisam a semântica do formulário para verificar se dados sensíveis estão sendo transmitidos por métodos inseguros.

## Solução Técnica
Adicionar o atributo `method="post"` em todas as tags `<form>` das quatro páginas de autenticação no frontend Next.js:
- `app/src/app/login/page.tsx`
- `app/src/app/register/page.tsx`
- `app/src/app/forgot-password/page.tsx`
- `app/src/app/reset-password/page.tsx`

Exemplo de mudança:
```tsx
<form className="mt-8 space-y-6" onSubmit={onSubmit} method="post">
```
