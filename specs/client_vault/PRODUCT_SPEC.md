# Product Spec: Client Credentials Vault (Cofre de Clientes)

## Objetivos da Feature
Permitir que usuários cadastrem informações sigilosas de clientes, tais como senhas de portais, chaves de acesso e notas confidenciais. Essa informação não deve ser exibida diretamente na listagem padrão ou detalhes simples para evitar vazamento ou visualização por terceiros não autorizados. Ela deve ser armazenada de forma encriptada no banco de dados e decriptada apenas sob demanda direta do usuário (ação de revelação/acesso).

## Requisitos Funcionais
1. **Cadastrar Credencial (Vault Item)**: Associar uma credencial sigilosa a um cliente contendo Título (ex: "Acesso ao e-CAC"), Senha (encriptada) e Observações (encriptada).
2. **Listar Credenciais**: Exibir a lista de itens do cofre associados ao cliente. Os valores sensíveis (senha, observações) devem vir ocultados ou não retornados por padrão na listagem para proteção inicial.
3. **Revelar Credencial (Decriptar)**: Solicitar a visualização de um item específico do cofre, retornando os dados originais decriptados (exibidos após uma ação explícita na interface).
4. **Editar Credencial**: Atualizar título, senha ou observações do item do cofre.
5. **Remover Credencial**: Excluir permanentemente uma credencial do cofre do cliente.

## Regras de Negócio
1. **Segurança de Dados (At Rest)**: Os campos de usuário, senha e observações no banco de dados devem ser encriptados de forma simétrica com algoritmo forte (AES-256-GCM).
2. **Isolamento de Tenant (Company)**: Um usuário de uma empresa (Company) só pode ver/modificar itens do cofre de clientes pertencentes à mesma empresa.
3. **Auditoria / Controle de Acesso**: Apenas usuários autenticados têm direito a visualizar a lista e decriptar itens do cofre. O campo `user_id` que identifica o criador/modificador do registro é preenchido automaticamente pelo backend com base no usuário logado.

## Critérios de Aceite
- O banco de dados nunca deve salvar a senha ou o usuário em texto claro.
- A requisição para criar ou atualizar o cofre deve receber e encriptar os dados antes da persistência.
- O endpoint de listagem padrão do cofre de um cliente deve retornar os IDs e os títulos, mas NÃO deve retornar as senhas e observações decriptadas, ou deve mascará-las.
- O campo `user_id` deve ser armazenado automaticamente no banco de dados, associando a credencial ao operador logado, sem campo de preenchimento na interface.
- O endpoint de revelação (`GET /api/clients/:id/vault/:item_id`) deve retornar os dados decriptados com sucesso.
- Interface amigável e moderna contendo botões "Exibir" (olho) para revelar as informações e um botão "Copiar" rápido.
