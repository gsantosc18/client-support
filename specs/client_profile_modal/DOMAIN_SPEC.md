# Domain Spec: Client Profile Modal in Process Details

## Bounded Contexts
- **Process Context**: Identifica a vinculação entre processos e seus clientes associados.
- **Client Context**: Gerencia a entidade `Client` e disponibiliza suas informações cadastrais (CPF, RG, CNH, email, telefone, data de nascimento).

## Entidades e Objetos de Valor
Nesta feature, utilizamos as entidades de domínio já existentes no sistema:
1. **Client (Entidade)**:
   - `id`: Identificador único do cliente.
   - `full_name`: Nome completo do cliente.
   - `email`: Endereço de email.
   - `phone`: Número de telefone.
   - `birth_date`: Data de nascimento do cliente.
   - `cpf`: Cadastro de Pessoa Física.
   - `rg`: Registro Geral.
   - `cnh`: Carteira Nacional de Habilitação.

## Estados da Interface (Frontend State)
- **Fechado (Closed)**: A modal não está renderizada ou visível.
- **Carregando (Loading)**: Buscando os dados detalhados do cliente pelo `id` através da API `/api/clients/:id`.
- **Exibindo (Open)**: Apresentando as informações cadastrais do cliente de forma estruturada.
- **Erro (Error)**: Exibe mensagem amigável em caso de falha de conexão ou erro ao obter os dados do cliente.
