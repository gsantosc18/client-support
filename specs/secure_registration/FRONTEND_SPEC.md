# FRONTEND SPECIFICATION (FRONTEND_SPEC.md) - Cadastro Seguro de Usuários

## Telas Alteradas e Novas Interfaces

### 1. Tela de Registro (`/register`)
- **Comportamento Reativo ao Token**:
  - Tenta extrair `invitation_token` dos parâmetros de URL.
  - Se houver `invitation_token`:
    - Faz a chamada à API de validação `GET /api/auth/validate-invitation?token={token}`.
    - Se válido: preenche o campo "E-mail" e o desabilita (readonly). Oculta o campo **"Código de Acesso"**.
    - Se inválido: exibe alerta de erro destacado e impede a submissão do formulário.
  - Se NÃO houver `invitation_token`:
    - Exibe o campo **"Código de Acesso"** (obrigatório, input do tipo password/text).
    - O e-mail permanece livre para preenchimento.

### 2. Tela de Login (`/login`) e Recuperação de Senha (`/forgot-password`)
- Deixam de ler `company_id` da URL. Passam a usar estritamente o `NEXT_PUBLIC_COMPANY_ID` configurado nas variáveis de ambiente.

### 3. Painel de Convites Administrativos (Nova UI)
- Adicionar uma seção ou aba "Gerenciar Convites" **dentro da página/menu de gerenciamento de operadores**.
- **Restrição de Acesso**: Esta seção só deve estar visível e acessível para usuários autenticados que possuam a flag `admin` como `true` no seu perfil de usuário.
- **Componente `InviteUserForm`**:
  - Campo de entrada para o "E-mail do Convidado".
  - Botão "Gerar Convite".
  - Exibição do link gerado em uma caixa de texto amigável para cópia (Clipboard Copy Button) contendo a URL: `https://<domain>/register?invitation_token=<token>`.
