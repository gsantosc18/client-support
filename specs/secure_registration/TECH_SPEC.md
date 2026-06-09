# TECHNICAL SPECIFICATION (TECH_SPEC.md) - Cadastro Seguro de Usuários

## Configuração do Ambiente (Variáveis de Ambiente)

### Backend `.env`
- `COMPANY_ID`: UUID da empresa vinculada a esta instância específica.
- `REGISTRATION_ACCESS_CODE`: String alfanumérica contendo o código de acesso para cadastro livre (ex: `AcmeSecret2026`).
- `INVITATION_DURATION`: Duração de validade do convite configurada por variável de ambiente (ex: `24h` ou `168h`, suportando formato do Go `time.ParseDuration`). Padrão: `24h`.

### Frontend `.env`
- `NEXT_PUBLIC_COMPANY_ID`: UUID da empresa vinculada a esta instância.

## Divisão de Camadas (Backend)

### 1. Handler Layer (`backend/internal/handlers/http/`)
- **`AuthHandler`**:
  - `Register`: Recebe novos campos no DTO de registro: `access_code` (opcional) e `invitation_token` (opcional).
  - `CreateInvitation` (Novo endpoint): Protegido por autenticação de token JWT. O handler verifica se o usuário autenticado possui `admin == true` no seu registro de banco. Em caso afirmativo, cria um convite gerando um UUID temporário como token.
  - `ValidateInvitation` (Novo endpoint): Endpoint público para validar o token de convite quando o usuário carrega a tela de registro.

### 2. Service Layer (`backend/internal/service/`)
- **`AuthService`**:
  - Valida se o `COMPANY_ID` configurado na env é válido.
  - No método `Register`:
    - Se `invitation_token` for fornecido: busca e valida o token no banco. Se for válido, consome o token e executa o cadastro.
    - Se `invitation_token` não for fornecido: valida se o `access_code` fornecido é igual ao `REGISTRATION_ACCESS_CODE` configurado na variável de ambiente.
  - `CreateInvitation`: Valida se o e-mail não existe no sistema e se o remetente é um admin. Cria e persiste um registro de `UserInvitation` com expiração definida pela variável `INVITATION_DURATION` (com fallback para 24h).
  - `ValidateInvitation`: Valida a existência, expiração e status do token.

### 3. Repository Layer (`backend/internal/repository/`)
- Implementar as interfaces correspondentes para gerenciar a persistência da tabela `user_invitations` em MariaDB.

---

## Integração Frontend

- A tela de login `/login` passa a usar `NEXT_PUBLIC_COMPANY_ID` se disponível, sem precisar ler a URL.
- A tela de registro `/register` tenta carregar o `invitation_token` da URL. Se disponível, chama `/api/auth/validate-invitation?token=...` para recuperar o e-mail convidado, preencher o formulário e ocultar o campo de Código de Acesso.
- Se não houver token, exibe o campo "Código de Acesso" no formulário de registro.
