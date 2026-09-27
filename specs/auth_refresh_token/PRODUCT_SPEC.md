# Product Specification: Autenticação Persistente e Renovação de Sessão (Refresh Token)

## Objetivos da Feature
Garantir que a opção "Manter-me logado" funcione de maneira ininterrupta e transparente para o usuário. Permitir que o sistema renove silenciosamente os tokens de acesso expirados (com ciclo de vida de 30 minutos) utilizando o Refresh Token (válido por 7 dias quando o checkbox estiver ativo, ou 30 minutos sem o checkbox), evitando deslogamentos indesejados durante o uso ou ao reabrir a aplicação.

## Requisitos Funcionais
1. **Endpoint de Renovação (Backend)**: Disponibilizar rota `POST /api/auth/refresh` que receba o `refresh_token`, valide sua integridade, assinatura, vigência e blacklist, emitindo um novo par de tokens (`access_token` e `refresh_token`).
2. **Rotação de Refresh Token (Segurança)**: Ao renovar a sessão, invalidar o `refresh_token` anterior na blacklist e emitir um novo `refresh_token` com o tempo restante ou renovado, mitigando riscos de reutilização.
3. **Interceptação Transparente (Frontend)**: Interceptar erros `401 Unauthorized` nas chamadas da API no Axios. Se houver um `refreshToken` persistido, executar a renovação de sessão de forma assíncrona, enfileirar requisições concorrentes e reexecutá-las sem interferir na navegação do usuário.
4. **Tratamento de Sessão Expirada**: Se o `refresh_token` estiver expirado, revogado ou for inválido, o frontend deve limpar a sessão e redirecionar para `/login`.

## Regras de Negócio
- O `access_token` continua com tempo de vida padrão de 30 minutos.
- O `refresh_token` terá tempo de vida de 7 dias quando "Manter-me logado" for selecionado, e 30 minutos caso não seja.
- O `refresh_token` é de uso único (Refresh Token Rotation): ao ser consumido, ele é adicionado à blacklist do Redis para evitar replay attacks.
- Se o usuário não marcou "Manter-me logado", o `refreshToken` não sobrevive ao encerramento da sessão do navegador.

## Critérios de Aceite
- Ao marcar "Manter-me logado", o usuário pode navegar por mais de 30 minutos sem ser deslogado.
- Requisições que falharem com 401 devido a token expirado são reexecutadas automaticamente e finalizadas com sucesso após o refresh.
- Se múltiplas requisições falharem com 401 simultaneamente, apenas uma chamada de refresh deve ser disparada ao backend, e todas as requisições pendentes devem ser resolvidas com o novo token.
- Caso o refresh falhe (token inválido ou expirado), os armazenamentos locais são limpos e o usuário é redirecionado para `/login`.
