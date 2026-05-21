# FRONTEND SPEC: Utilização de Método POST Explícito nos Formulários de Autenticação

## Páginas Impactadas
As seguintes páginas do frontend devem declarar explicitamente o atributo `method="post"` na tag `<form>`:
1. **Login Page**: `app/src/app/login/page.tsx`
2. **Register Page**: `app/src/app/register/page.tsx`
3. **Forgot Password Page**: `app/src/app/forgot-password/page.tsx`
4. **Reset Password Page**: `app/src/app/reset-password/page.tsx`

## Estados da UI
- Sem modificações estéticas adicionais.

## Semântica e Acessibilidade
- O uso de `method="post"` explícito em formulários de credenciais assegura que leitores de tela e utilitários de preenchimento automático de senhas (como Bitwarden, 1Password, Google Password Manager, etc.) identifiquem a natureza segura de envio dos dados.
