# Product Specification: Login e Cadastro de Usuário

## Objetivos da Feature
Permitir que o usuário se cadastre no sistema, vincule-se a uma companhia existente (passada via URL) e realize login de forma segura para acessar o painel. Além disso, disponibilizar funcionalidades de recuperação e redefinição de senha e opção de "Manter-me logado".

## Requisitos Funcionais
1. **Cadastro**: Nome, sobrenome, e-mail, telefone (opcional), data de nascimento, company_id (url), senha, confirmação de senha, aceite de termo.
2. **Login**: E-mail, senha, opção "manter-me logado".
3. **Recuperação de Senha**: E-mail para envio de link.
4. **Redefinição de Senha**: Nova senha e confirmação via link seguro.
5. **Logout**: Invalidação do acesso atual.

## Regras de Negócio
- E-mail único por companhia.
- Senha: min 8 caracteres, 1 número, 1 char especial, 1 maiúscula, 1 minúscula, sem seq >= 3 (letras ou números), diferente de nome completo, e-mail e telefone.
- Companhia deve existir e estar ATIVA.
- Bloqueio após 3 tentativas de login falhas (30 min de bloqueio).
- E-mail de recuperação só deve indicar sucesso genericamente. O link expira em 15 minutos e deve ser único.
- A redefinição de senha deve invalidar o token de recuperação.

## Critérios de Aceite
- Usuário consegue se cadastrar e os dados são validados no backend e frontend.
- Usuário consegue logar recebendo Access e Refresh tokens.
- Refresh token dura 30min ou 7 dias ("Manter-me logado").
- Tokens são invalidados em Blacklist no logout.
