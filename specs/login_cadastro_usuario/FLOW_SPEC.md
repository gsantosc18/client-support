# Flow Specification

## Fluxo de Login
1. Frontend envia credenciais.
2. Backend valida email. Se falhar, incrementa tentativas no user e bloqueia se >= 3.
3. Backend valida senha (bcrypt). Se sucesso, zera tentativas falhas.
4. Gera Access Token (30min) e Refresh Token (30min ou 7 dias).
5. Frontend guarda tokens e redireciona para painel.

## Fluxo de Recuperação
1. Frontend envia email.
2. Backend procura user.
3. Se existir e ativo, gera token único, expiração=15min, salva no DB.
4. Backend dispara envio SMTP (assíncrono).
5. Backend responde 200 genérico.
6. Frontend exibe mensagem de sucesso.

## Fluxo de Logout
1. Frontend envia request para `/logout` com token.
2. Backend pega o token e salva na Blacklist.
3. Frontend limpa tokens locais e vai pra tela de login.
