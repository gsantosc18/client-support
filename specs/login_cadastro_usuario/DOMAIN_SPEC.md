# Domain Specification

## Agregados e Entidades
- **User**: Representa o usuário final.
  - Atributos: ID (UUID), Nome, Sobrenome, Email, Telefone, Data Nascimento, Senha (hash), Criado Em, Atualizado Em, Status, Company ID, Tentativas Falhas, Bloqueado Até.
- **Company**: Empresa a qual o usuário pertence.
  - Atributos: ID (UUID), Nome, Criado Em, Atualizado Em, Status.
- **PasswordRecoveryToken**: Token para recuperação de senha.
  - Atributos: Token, User ID, Expira Em, Utilizado (boolean).

## Bounded Contexts
- **IAM (Identity and Access Management)**: Gerenciamento de credenciais, sessões e usuários.

## Regras de Domínio
- Usuários pertencem a uma única Companhia e o e-mail deve ser único dentro dela.
- Senhas nunca devem ser trafegadas em texto claro no domínio, apenas o hash bcrypt.
- Status da Companhia deve ser validado no momento de criação do Usuário (deve ser ATIVO).
