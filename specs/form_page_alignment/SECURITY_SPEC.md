# Security Specification — Alinhamento de Páginas de Formulário

Este documento descreve os mecanismos de segurança aplicados nos formulários a fim de mitigar riscos de injeção de script e vazamento de dados.

---

## 1. Prevenção contra Ataques de Injeção (XSS)

- **Sanitização Automatizada**: Todas as entradas do tipo texto e área de texto devem ser limpas (`trim`) antes do envio. Tags HTML inseridas nos campos de texto devem ser interpretadas como literais pelo React (comportamento padrão) e sanitizadas a nível de API para evitar injeções XSS persistentes no banco de dados.
- **Tratamento de Dados de Contato e CPF**:
  - CPFs e Telefones devem sofrer limpeza de caracteres não numéricos no frontend (mantendo apenas dígitos) antes de trafegarem pela rede. Isso previne manipulações de queries e scripts maliciosos injetados nas strings.

---

## 2. Autenticação e Validação de Ownership

- **Proteção de Rotas de Formulário**: As rotas de formulário (`/clients/create`, `/clients/:id/edit`, `/processes/create`, `/processes/:id/edit`) devem validar no ciclo de vida do Next.js se o usuário possui sessão ativa e JWT válido.
- **Isolamento de Tenant (Company ID)**:
  - Os IDs de clientes e estabelecimentos carregados nas seleções dropdown do formulário de processos são estritamente filtrados pelo `company_id` do usuário logado na sessão ativa, prevenindo ataques do tipo BOLA (Broken Object Level Authorization).
- **Desabilitação Defensiva**: Durante submissões concorrentes, as ações de exclusão e cancelamento são bloqueadas na interface para evitar a remoção de itens em formulários parcialmente salvos.
