# PRODUCT SPECIFICATION (PRODUCT_SPEC.md) - Cadastro Seguro de Usuários

## Objetivos da Funcionalidade

Garantir o controle de acesso e segurança no registro de usuários em cenários de deploys isolados (single-tenant por instância), mitigando o risco de cadastros não autorizados.

1. **Associação Nativa de Empresa**: A aplicação passa a ler o ID de empresa diretamente de variáveis de ambiente do servidor e cliente, removendo a necessidade de passar o ID exposto por parâmetro na URL no fluxo padrão de Login/Cadastro.
2. **Restrição por Código de Acesso**: O registro livre de usuários é protegido por um código secreto configurado no servidor (Passcode/Código de Acesso), compartilhado privadamente pela organização.
3. **Fluxo de Convite Administrativo**: Permitir que administradores convidem novos colaboradores diretamente a partir do painel administrativo. O convidado receberá um link de convite contendo um token de uso único que o desobriga de saber o código de acesso e bloqueia o e-mail de registro para o endereço convidado.

## Requisitos Funcionais

1. **Configuração de Instância**:
   - O backend e o frontend devem ler o ID fixo da empresa a partir do arquivo `.env` (`COMPANY_ID` no backend, `NEXT_PUBLIC_COMPANY_ID` no frontend).
   - O backend deve ler o código de acesso de cadastro da variável de ambiente `REGISTRATION_ACCESS_CODE`.
   - A validade do token de convite deve ser configurada via variável de ambiente `INVITATION_DURATION` (padrão de 24 horas caso não definida).

2. **Registro Protegido por Código**:
   - A tela de registro `/register` exibirá um novo campo obrigatório chamado **"Código de Acesso"**.
   - O backend validará se o código de acesso informado no cadastro coincide com o valor de `REGISTRATION_ACCESS_CODE`. Se não coincidir, recusará o registro com um erro amigável.

3. **Geração de Convites por Administrador**:
   - Usuários com a flag `admin` como `true` no banco de dados podem gerar convites para novos e-mails.
   - O convite gerado terá um token criptográfico temporário, cuja duração é definida por `INVITATION_DURATION`.
   - O administrador criará o convite no menu de gerenciamento de operadores, que ganhará uma nova seção dedicada ("Gerenciar Convites").

4. **Registro via Convite**:
   - Ao acessar `/register?invitation_token=xxx`, o frontend valida o token com o backend.
   - Se o token for válido e não expirado:
     - O campo **"Código de Acesso"** é ocultado.
     - O campo **"E-mail"** é preenchido automaticamente com o e-mail convidado e bloqueado para edição (somente leitura).
   - Ao enviar o formulário, o backend consome o token de convite e cria o usuário associado à empresa correspondente.

## Critérios de Aceite

1. Tentar registrar sem código de acesso ou com código incorreto deve falhar com a mensagem "Código de acesso inválido".
2. Tentar registrar utilizando um convite expirado ou já utilizado deve exibir "Este convite é inválido ou já foi utilizado".
3. A tela de login `/login` deve funcionar sem nenhum parâmetro na URL, utilizando o ID de empresa estático do `.env`.
4. Apenas usuários autenticados e que possuem a flag `admin` igual a `true` no banco de dados podem visualizar a seção "Gerenciar Convites" no menu de gerenciamento de operadores e gerar convites.

