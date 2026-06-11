# ADR-001
Criptografia de Credenciais de Clientes no Banco de Dados

## Contexto
O usuário necessita armazenar senhas e outras credenciais confidenciais de acesso a portais no cadastro do cliente. Para conformidade com segurança de dados corporativos e privacidade, essas credenciais não podem ficar em texto plano caso ocorra vazamento do banco de dados, nem devem ser visíveis para qualquer pessoa sem autorização explícita na UI.

## Decisão
Adotaremos criptografia simétrica com o algoritmo **AES-256-GCM** na camada de aplicação (backend). 
A chave simétrica será derivada usando SHA-256 a partir da variável de ambiente `VAULT_KEY` ou, na falta desta, a partir da `JWT_SECRET`.
Cada dado sensível (usuário, senha, observações) será criptografado individualmente com um nonce (Initialization Vector) único de 12 bytes gerado aleatoriamente e concatenado com o texto cifrado, salvando o resultado codificado em hexadecimal no banco de dados.
Na leitura comum (listagem), os dados sensíveis serão mascarados ou omitidos. Na leitura de revelação de credencial, o backend fará a decriptação reversa usando a chave simétrica e retornará em texto claro para exibição na UI.

## Consequências
- A segurança dos dados confidenciais de clientes passa a depender estritamente do segredo das variáveis de ambiente do backend.
- Pequeno custo de CPU para operações de encriptação e decriptação no backend (insignificante para o volume esperado).
- Impossibilidade de realizar buscas textuais eficientes nos campos encriptados diretamente no banco de dados (o que é aceitável, pois a listagem se dará por Título, que não é encriptado).
