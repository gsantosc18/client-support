# SECURITY SPECIFICATION (SECURITY_SPEC.md) - Cadastro Seguro de Usuários

## Controles de Acesso e Isolamento

1. **Geração de Convites (Autorização)**:
   - O endpoint `POST /api/auth/invitations` exige autenticação via token JWT.
   - O backend valida se o usuário autenticado possui a propriedade `admin` como `true` no banco de dados.
   - **Isolamento de Escopo Administrativo**: A flag `admin` confere privilégios administrativos **apenas dentro da empresa (`company_id`) à qual o usuário está vinculado**. Um usuário administrador da Empresa A não possui nenhuma autoridade nem pode visualizar/gerar convites para a Empresa B.
   - O convite é criado associado ao `company_id` do administrador solicitante.
   - A validade do token gerado é calculada no backend de acordo com a variável `INVITATION_DURATION` configurada na inicialização do servidor.

2. **Isolamento de Tenants (Inquilinos)**:
   - A validação do convite (`GET /api/auth/validate-invitation`) e o registro final (`POST /api/auth/register`) impõem que o usuário seja criado exatamente sob o `company_id` vinculado ao convite, prevenindo injeções de tenant.
   - A variável de ambiente `COMPANY_ID` no backend atua como "hard limit", garantindo que qualquer tentativa de cadastro em uma instância dedicada utilize o tenant local.

3. **Criptografia e Proteção de Segredos**:
   - O `REGISTRATION_ACCESS_CODE` nunca é enviado pelo backend para o cliente. Ele é apenas recebido no cadastro livre e validado no servidor.
   - O token de convite deve ser gerado utilizando criptografia/UUIDs aleatórios e seguros (`uuid.New()`) para evitar adivinhação de tokens (brute-force).

4. **Tratamento contra Força Bruta**:
   - Recomenda-se aplicar Rate Limiting nos endpoints `/api/auth/validate-invitation` e `/api/auth/register` para mitigar tentativas automatizadas de adivinhação de códigos de acesso ou tokens de convite.
