# TASKS (TASKS.md) - Cadastro Seguro de Usuários

## Backend

- [ ] Criar migration para a tabela `user_invitations` (`backend/migrations/20260609080000_create_user_invitations.sql`).
- [ ] Criar migration para adicionar a flag `admin` na tabela `users` (`backend/migrations/20260609090000_add_admin_flag_to_users.sql`).
- [ ] Atualizar entidade `User` no pacote `domain` com a propriedade `Admin` (mapeada para a coluna `admin` do banco).
- [ ] Criar entidade `UserInvitation` no pacote `domain`.
- [ ] Adicionar métodos de persistência para `UserInvitation` no `UserRepository` e implementar no repositório SQL.
- [ ] Atualizar struct `RegisterRequest` no `AuthService` para incluir `AccessCode` e `InvitationToken`.
- [ ] Atualizar método `Register` no `AuthService` para validar o código de acesso ou o token de convite.
- [ ] Implementar métodos `CreateInvitation` e `ValidateInvitation` no `AuthService`.
- [ ] Mapear as novas variáveis de ambiente (`COMPANY_ID`, `REGISTRATION_ACCESS_CODE` e `INVITATION_DURATION`) no arquivo de configuração do backend.
- [ ] Implementar e registrar as rotas de API em `AuthHandler`:
  - `GET /api/auth/validate-invitation?token={token}`
  - `POST /api/auth/invitations` (exige JWT de admin da empresa com validação de `admin == true` no banco)

## Frontend

- [ ] Configurar a variável de ambiente `NEXT_PUBLIC_COMPANY_ID` no frontend.
- [ ] Alterar as páginas `/login` e `/forgot-password` para consumir `process.env.NEXT_PUBLIC_COMPANY_ID` em vez do parâmetro da URL.
- [ ] Atualizar o formulário e lógica de `/register`:
  - Se `invitation_token` estiver na URL: validar via API, autocompletar e desabilitar o e-mail, e ocultar o campo "Código de Acesso".
  - Caso contrário: manter o e-mail editável e exibir o campo obrigatório **"Código de Acesso"**.
- [ ] Criar o fluxo de convites na UI:
  - Adicionar aba ou seção "Gerenciar Convites" dentro do menu de gerenciamento de operadores.
  - Exibir a seção condicionalmente apenas se o operador logado possuir a flag `admin` como `true`.
  - Permitir a inserção do e-mail do convidado, gerar o link e disponibilizar botão de copiar para o clipboard.
