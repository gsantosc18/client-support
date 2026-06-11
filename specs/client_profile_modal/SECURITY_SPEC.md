# Security Spec: Client Profile Modal in Process Details

## Autenticação e Autorização
1. **Controle de Sessão**: O acesso à modal e o carregamento dos dados pela API dependem de uma sessão autenticada do usuário (presença de token JWT válido no cabeçalho das requisições).
2. **Isolamento de Tenant**: O backend deve validar se o cliente solicitado (`:id`) pertence à mesma empresa (`company_id`) do usuário logado no token, impedindo vazamento de dados entre inquilinos.
3. **Clipboard Security**: A operação de cópia utiliza a API nativa do navegador (`navigator.clipboard.writeText`), que só é permitida em contextos seguros (HTTPS ou localhost) e por interação direta do usuário.
