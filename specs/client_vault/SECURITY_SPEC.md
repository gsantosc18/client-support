# Security Spec: Client Credentials Vault

## Requisitos de Criptografia
1. **Algoritmo**: AES-256-GCM (Advanced Encryption Standard em modo Galois/Counter Mode).
2. **Key Derivation**: Derivar a chave simétrica de 32 bytes usando SHA-256 a partir do `VAULT_KEY` ou `JWT_SECRET` (para conveniência).
3. **Nonce / IV**: Um IV criptograficamente seguro e aleatório de 12 bytes gerado por operação de escrita (usando `crypto/rand`).
4. **Formato de Armazenamento**: O payload criptografado final no banco de dados deve ser armazenado em formato hexadecimal ou base64 composto de:
   `hex(nonce) + ":" + hex(ciphertext)` ou similar, ou concatenado diretamente. A concatenação simples `nonce || ciphertext` codificada em hexadecimal ou Base64 é o ideal para o campo string TEXT.

## Validação de Ownership (Segurança de Invasão)
- **Validação de CompanyID**: Toda requisição para `/api/clients/:client_id/vault` deve verificar se o cliente informado (`:client_id`) pertence à mesma empresa (`company_id`) do usuário que está autenticado no JWT (extraído através de `middleware.Protected`).
- O item do cofre solicitado pelo `:id` também deve ter seu `company_id` validado contra o `company_id` do JWT.
- Se houver divergência, retornar `403 Forbidden` ou `404 Not Found` para evitar enumeração de recursos.
- A exclusão do cliente ou empresa limpa em cascata (`ON DELETE CASCADE`) seus respectivos registros do cofre.
