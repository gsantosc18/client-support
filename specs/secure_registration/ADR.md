# ARCHITECTURAL DECISION RECORD (ADR.md) - Cadastro Seguro de Usuários

## ADR-005
Registro Seguro e Isolamento por Variáveis de Ambiente

### Contexto
Para deploys isolados (single-tenant por servidor), o uso de IDs de empresas passados na URL e a ausência de restrições no registro público criam vulnerabilidades onde qualquer usuário externo pode cadastrar uma conta ou descobrir o ID interno de uma empresa por inspeção do tráfego.

### Decisão
Decidimos fixar o ID da empresa no servidor e no cliente usando variáveis de ambiente (`COMPANY_ID` / `NEXT_PUBLIC_COMPANY_ID`). Além disso, implementaremos um controle duplo de segurança para registro:
1. **Cadastro Livre via Código de Acesso**: Protegido por uma senha comum do tenant (`REGISTRATION_ACCESS_CODE`) configurada em variáveis de ambiente.
2. **Cadastro por Convite de Admin**: Onde o administrador gera um link com um token temporário e de uso único que preenche e bloqueia o e-mail do convidado, dispensando o código de acesso.

### Consequências
- **Positivas**:
  - Elimina a exposição desnecessária do `company_id` nas URLs de login e recuperação de senha.
  - Segurança aprimorada contra cadastros não autorizados.
  - Melhor experiência para o usuário convidado (e-mail já preenchido, sem necessidade de saber códigos secretos da empresa).
- **Negativas**:
  - Requer a criação de uma nova tabela `user_invitations` e migrations no MariaDB.
  - Introduz a necessidade de gerenciar variáveis de ambiente adicionais na implantação de novos tenants.
