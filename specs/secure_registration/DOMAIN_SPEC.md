# DOMAIN SPECIFICATION (DOMAIN_SPEC.md) - Cadastro Seguro de Usuários

## Contexto Delimitado (Bounded Context)

- **Identity & Access Management (IAM)**: Responsável pela autenticação, autorização, cadastro de novos colaboradores, convites administrativos e regras de validação de códigos de acesso de instâncias.

## Entidades e Objetos de Valor

### 1. User (Entidade Existente - Atualizada)
Representa um colaborador da empresa no sistema.
- **Admin**: `bool` (Flag que indica se o usuário possui permissão de administrador no tenant).

### 2. UserInvitation (Entidade)
Representa um convite pendente ou consumado criado por um administrador para convidar um novo usuário.
- **ID**: `uuid.UUID` (Identificador único do convite)
- **Email**: `string` (Endereço de e-mail do convidado)
- **Token**: `string` (Token de segurança de uso único)
- **CompanyID**: `uuid.UUID` (A empresa a qual o convidado pertencerá)
- **ExpiresAt**: `time.Time` (Data/hora de expiração do convite)
- **Used**: `bool` (Informa se o convite já foi consumido)
- **CreatedAt**: `time.Time` (Data de criação do convite)

## Regras de Domínio

1. **Validade do Convite**:
   - Um convite é considerado **válido** somente se `Used` for `false` e `ExpiresAt` for posterior ao horário atual (`time.Now()`).

2. **Consumo de Convite**:
   - Um convite só pode ser consumido uma única vez. Uma vez utilizado no registro, o campo `Used` deve ser alterado para `true`.

3. **Imposição de E-mail de Registro**:
   - O endereço de e-mail utilizado no formulário de registro deve ser estritamente idêntico ao e-mail registrado na entidade `UserInvitation` correspondente ao token apresentado.

4. **Isolamento de Tenant**:
   - O `CompanyID` do novo usuário registrado deve ser idêntico ao `CompanyID` contido na entidade `UserInvitation`.

5. **Código de Acesso Corporativo**:
   - Caso o registro não apresente um token de convite, o código de acesso informado no formulário deve coincidir exatamente com a credencial estática configurada para a empresa no ambiente do servidor (`REGISTRATION_ACCESS_CODE`).
