# Security Specification: Containerização de Frontend e Backend

Este documento especifica os padrões de segurança de infraestrutura (Hardening), controle de privilégios e isolamento de rede aplicados aos containers do **Client Support Hub**.

---

## 1. Princípio do Menor Privilégio (Least Privilege Principle)

Por padrão, os containers Docker rodam como usuário `root` (UID 0), o que representa um grave risco de segurança: se um invasor explorar uma vulnerabilidade na aplicação (ex: Remote Code Execution), ele ganhará privilégios administrativos no host hospedeiro.

### 1.1. Hardening do Backend (Golang)
* **Usuário não-raiz**: Criamos um grupo e usuário sem privilégios diretamente no Dockerfile:
  ```dockerfile
  RUN addgroup -S appgroup && adduser -S appuser -G appgroup
  USER appuser
  ```
* **ID do Usuário**: O UID/GID alocado não deve colidir com usuários reais do sistema host.
* **Escrita Restrita**: O processo executará em modo Read-Only, exceto pelo diretório `/app/storage` que é montado explicitamente para receber arquivos de upload.

### 1.2. Hardening do Frontend (Next.js)
* **Usuário Embutido**: O Next.js de produção rodará sob o usuário restrito `nextjs` e grupo `nodejs` pré-configurados no Dockerfile:
  ```dockerfile
  RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001 -G nodejs
  USER nextjs
  ```
* **Bloqueio de Execução de Scripts**: O usuário `nextjs` não possui permissões de escrita na pasta do servidor `/app` standalone, prevenindo injeções e modificações maliciosas em tempo de runtime.

---

## 2. Mitigação de Vulnerabilidades (Image Hardening)

* **Imagens Base Minimalistas**: Substituímos imagens pesadas (Debian/Ubuntu completo) por `alpine` ou `distroless`. Isso reduz a superfície de ataque ao remover pacotes supérfluos, diminuindo a presença de ferramentas como `curl`, `wget`, `apt`, ou compiladores que facilitariam o movimento lateral de um atacante.
* **Redução de CVEs**: Imagens base Alpine são atualizadas frequentemente e contêm o mínimo de dependências do sistema operacional.

---

## 3. Isolamento e Segurança de Rede

* **Proteção de Portas Críticas**: O banco de dados PostgreSQL e o Redis não devem ter suas portas expostas diretamente para a internet pública em produção. A comunicação entre o backend e o banco de dados deve ocorrer estritamente pela rede Docker interna virtualizada. Apenas as portas HTTP do Frontend (`3000`) e da API do Backend (`8080`) são mapeadas para acesso público.
* **Segurança de Variáveis**: Credenciais cruciais como `DATABASE_URL` e chaves privadas JWT devem vir exclusivamente do ambiente de execução (injetadas via secrets ou variáveis gerenciadas de forma segura), nunca hardcoded no repositório.
