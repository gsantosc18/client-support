# Security Specification

- **Senhas**: Armazenadas usando BCrypt. Validadas rigorosamente.
- **Tokens**: JWT assinados. Access com short-lived time (30min).
- **Brute Force**: Bloqueio de 30 minutos após 3 falhas.
- **Enumeração**: Endpoint de recuperação responde identicamente para email existente ou não.
- **Revogação**: Tokens descartados vão para Blacklist (Redis ou Tabela).
