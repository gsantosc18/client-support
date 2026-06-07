# Security Specification: GitHub Actions para Build e Push de Imagens Docker

Este documento descreve as práticas de segurança adotadas no workflow do GitHub Actions para proteger credenciais e integridade das imagens.

---

## 1. Armazenamento Seguro de Credenciais

Todas as credenciais sensíveis devem ser armazenadas como **GitHub Repository Secrets**. Nenhuma credencial pode ser gravada em texto puro no código ou arquivos de especificação.

### Secrets Utilizados:
* `REGISTRY_USERNAME`: Nome do usuário para autenticação no registro privado `registry.advocase.site`.
* `REGISTRY_PASSWORD`: Senha ou token de acesso com permissão de escrita/leitura para subir as imagens.

### Acesso a Secrets:
No arquivo YAML da Action, as credenciais são acessadas estritamente usando o contexto `${{ secrets.NAME }}`. O GitHub Actions oculta automaticamente esses valores nos logs de execução.

---

## 2. Permissões Mínimas do GITHUB_TOKEN

Por padrão, a Action deve rodar com permissões restritas (princípio do menor privilégio). O token gerado temporariamente pelo GitHub (`GITHUB_TOKEN`) deve conter apenas permissão de leitura de código:
```yaml
permissions:
  contents: read
```

---

## 3. Segurança das Imagens Compiladas

* **Usuários não-root**: As imagens geradas para frontend e backend não rodam como root (conforme especificado nos respectivos Dockerfiles). O pipeline garante que o empacotamento mantenha essas diretivas intactas.
* **Redução de Superfície de Ataque**: O pipeline utiliza multi-stage builds descartando ferramentas de compilação adicionais no estágio final das imagens.
