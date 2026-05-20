# ADR-001: Arquitetura de Autenticação JWT com Refresh

## Contexto
O sistema precisa manter sessões ativas com segurança, permitindo o "manter-me logado" por 7 dias, ou por 30 minutos em computadores públicos.

## Decisão
Implementar JWT dual-token (Access + Refresh). O Access Token sempre terá vida curta (30 min). O Refresh Token terá vida baseada na opção "manter logado". Adicionalmente, logout será implementado por Token Blacklisting.

## Consequências
- Aumenta a segurança do token JWT.
- Complexidade adicional no Frontend para gerenciar 401s e fazer refresh automático.
- Necessidade de infraestrutura para Token Blacklist.
