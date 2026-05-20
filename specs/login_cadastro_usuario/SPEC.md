# 1. Login e Cadastro de Usuário

## Objetivo

O usuário deve ter a possibilidade de se cadastrar no sistema e realizar login para ter acesso ao painel. 

## Cadastro de Usuário

O usuário deve preencher um formulário com as seguintes informações:
- Nome (obrigatório)
- Sobrenome (obrigatório)
- E-mail (obrigatório)
- Telefone (opcional)
- Data de nascimento (obrigatório)
- Código da companhia (obrigatório, deve ser passado na url no parametro "company_id" sem possibilidade de alteração)
- Senha (obrigatório)
- Confirmação de Senha (obrigatório, senha deve ser igual à senha)
- Termo de uso (obrigatório, checkbox)

O cadastro de usuário deve seguir as seguintes regras:
- O e-mail deve ser válido
- O e-mail deve ser único por companhia
- A senha deve ter pelo menos 8 caracteres
- A senha deve ter pelo menos 1 número
- A senha deve ter pelo menos 1 caractere especial
- A senha deve ter pelo menos 1 letra maiúscula
- A senha deve ter pelo menos 1 letra minúscula
- A senha não deve conter sequências de 3 ou mais letras
- A senha não deve conter sequências de 3 ou mais números
- A senha não deve ser igual ao nome completo
- A senha não deve ser igual ao e-mail
- A senha não deve ser igual ao telefone
- A Companhia deve ter um código único e deve estar cadastrada no sistema
- Companhia precisa estar com o status ATIVO para que o usuário possa se cadastrar.

## Login de Usuário

O usuário deve preencher um formulário com as seguintes informações:
- E-mail (obrigatório)
- Senha (obrigatório)
- Manter-me logado (checkbox)
- Esqueci minha senha (link)
- Não tenho uma conta? Cadastre-se (link)

Regras do login:
- Caso o login ou senha estejam inválidos, deve informar ao usuário uma mensagem amigável, sem indicar qual dos dois está incorreto.
- Caso o usuário esteja inválido e já tenha atingido 3 tentativas, deve bloquear o usuário por 30 minutos.
- Caso o usuário esteja inválido e ainda não tenha atingido 3 tentativas, deve permitir que o usuário tente novamente.
- Caso o usuário esteja válido, deve redirecionar o usuário para a página de painel.
- Caso o usuário marque a opção "Manter-me logado", o token JWT deve ter uma validade de 7 dias. Caso contrário, deve ter uma validade de 30 minutos.
- Caso o usuário clique em "Esqueci minha senha", deve redirecionar o usuário para a página de recuperação de senha.
- Caso o usuário clique em "Não tenho uma conta? Cadastre-se", deve redirecionar o usuário para a página de cadastro.

## Recuperação de senha

O usuário deve preencher um formulário com as seguintes informações:
- E-mail (obrigatório)

Regras da recuperação de senha:
- O sistema não deve expor se o e-mail existe ou se o usuário está inativo (prevenção contra Enumeração de Usuários). Deve sempre exibir uma mensagem de sucesso genérica: "Se o e-mail estiver cadastrado e ativo, você receberá um link de recuperação."
- Se o e-mail for válido e o usuário estiver ativo, deve enviar o e-mail para o usuário com o link em segundo plano.
- O link de recuperação de senha deve ter uma validade de 15 minutos.
- O link de recuperação de senha deve ser único.

## Envio de Email

O e-mail deve seguir as seguintes regras:
- O e-mail deve ser enviado pelo backend utilizando implementação própria (SMTP).
- O e-mail deve ter um assunto "Recuperação de senha - [NOME DA COMPANHIA]" (substitua [NOME DA COMPANHIA] pelo nome da companhia).
- O e-mail deve ter um corpo com o link de recuperação de senha.
- O e-mail deve ter um rodapé com as informações da companhia.

## Redefinição de senha

O usuário deve preencher um formulário com as seguintes informações:
- Senha (obrigatório)
- Confirmação de Senha (obrigatório, senha deve ser igual à senha)

Regras da redefinição de senha:
- O token de recuperação de senha deve ser válido e não expirado.
- A senha deve ter pelo menos 8 caracteres
- A senha deve ter pelo menos 1 número
- A senha deve ter pelo menos 1 caractere especial
- A senha deve ter pelo menos 1 letra maiúscula
- A senha deve ter pelo menos 1 letra minúscula
- A senha não deve conter sequências de 3 ou mais letras
- A senha não deve conter sequências de 3 ou mais números
- A senha não deve ser igual ao nome completo
- A senha não deve ser igual ao e-mail
- A senha não deve ser igual ao telefone
- Se o token de recuperação de senha for inválido ou expirado, deve informar ao usuário que o token é inválido ou expirado.
- Se o token de recuperação de senha for válido e não expirado, deve permitir que o usuário redefina a senha.
- Após a redefinição de senha, o token de recuperação de senha deve ser invalidado (marcado como utilizado ou removido do banco).

## Logout

O usuário deve ter a possibilidade de se deslogar do sistema. Ao fazer logout, o token JWT deve ser invalidado.

# Informações tecnicas

O login e cadastro devem seguir as seguintes regras:
- O login deve ser feito com e-mail e senha
- O cadastro deve ser feito com nome, sobrenome, e-mail, telefone, data de nascimento, senha, confirmação de senha, código da companhia e aceite do termo de uso.
- O sistema utilizará estratégia de Access Token e Refresh Token
- O Access Token JWT deve ter uma validade de 30 minutos e ser armazenado de forma segura
- O Refresh Token deve ter uma validade de 30 minutos, ou de 7 dias caso a opção "Manter-me logado" seja marcada
- O sistema deve implementar uma Token Blacklist (usando Redis ou banco de dados) para permitir a invalidação de tokens (ex: no logout)
- o servico de login e cadastro deve ser responsavel por criptografar a senha com bcrypt
- os usuarios cadastrados no sistema devem seguir as seguintes regras:
  - o usuario deve ter um id unico UUID
  - o usuario deve ter um nome
  - o usuario deve ter um sobrenome
  - o usuario deve ter um email
  - o usuario deve ter um telefone
  - o usuario deve ter uma data de nascimento
  - o usuario deve ter uma senha
  - o usuario deve ter uma data de criação
  - o usuario deve ter uma data de atualização
  - o usuario deve ter um status
  - o usuario deve ter um company_id
  - o usuario deve ter registro de tentativas falhas de login (ex: failed_login_attempts)
  - o usuario deve ter o momento do bloqueio temporário (ex: locked_until)
- o sistema deve possuir controle de tokens de recuperação de senha (na tabela do usuário ou tabela separada), com token e data de expiração
- a companhia deve ter um id unico UUID
- a companhia deve ter um nome
- a companhia deve ter uma data de criação
- a companhia deve ter uma data de atualização
- a companhia deve ter um status
- Guardar as informações de configuração do serviço em arquivo yaml e carregar utilizando viper no backend.
