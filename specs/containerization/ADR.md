# Architectural Decision Record (ADR): Containerização de Frontend e Backend

Este documento registra as decisões arquiteturais tomadas para o desenho e implementação da infraestrutura de containerização do **Client Support Hub**.

---

## ADR-001: Builds Multi-Stage para Backend e Frontend

### Contexto
O empacotamento padrão de imagens Docker tende a incluir compiladores, gerenciadores de pacotes e dependências de desenvolvimento. Isso resulta em imagens finais gigantescas (>1.2GB) e com superfícies de ataque aumentadas para vulnerabilidades de segurança (CVEs).

### Decisão
Decidimos adotar builds baseados em **Multi-stage** para ambos os componentes:
1. No Backend, compilamos o binário estaticamente na primeira fase (`golang:1.25-alpine`) e copiamos apenas o executável final e os arquivos de migração para a imagem de execução leve (`alpine:3.19`).
2. No Frontend, instalamos as dependências e buildamos o código Next.js em fases separadas, extraindo na fase final apenas os arquivos standalone estritamente necessários para rodar a aplicação.

### Consequências
* **Positivas**: Tamanho de imagem drasticamente menor (Backend < 50MB, Frontend < 150MB), tempo de build reduzido por caching de layers e segurança extremamente aprimorada.
* **Negativas**: Maior complexidade na escrita inicial dos arquivos `Dockerfile`.

---

## ADR-002: Estratégia de Build Standalone do Next.js

### Contexto
Servidores Next.js em produção geralmente exigem a presença do diretório `node_modules` inteiro, o que introduz um overhead massivo de disco e arquivos desnecessários gerados por dependências de build-time.

### Decisão
Decidimos habilitar e utilizar o recurso de compilação `standalone` nativo do Next.js via propriedade `output: 'standalone'` no `next.config.mjs`.

### Consequências
* **Positivas**: Reduz o tamanho do container frontend a um nível mínimo absoluto. O servidor gerado contém apenas os arquivos reais de execução.
* **Negativas**: Requer a cópia manual de arquivos de assets adicionais (como a pasta `public/` e `.next/static/`) no Dockerfile final para que o roteador saiba servir os elementos visuais estáticos.

---

## ADR-003: Execução sob Usuários Não-Raiz (Hardening)

### Contexto
Containers que executam sob o usuário padrão `root` (UID 0) estão suscetíveis a escalabilidade de privilégios no sistema operacional hospedeiro em caso de invasões ou vulnerabilidades de dia zero na aplicação.

### Decisão
Decidimos forçar a execução de todos os containers de runtime sob usuários de privilégios mínimos restritos:
1. No Frontend, o usuário padrão do Node `nextjs` e grupo `nodejs` assumem o controle.
2. No Backend, criamos explicitamente o usuário `appuser` e grupo `appgroup` para a execução do binário Go.

### Consequências
* **Positivas**: Conformidade com melhores práticas de DevSecOps, isolamento e proteção robusta contra vulnerabilidades de escalabilidade de privilégio.
* **Negativas**: Exige tratamentos explícitos de propriedade de arquivos (`chown`) no momento do build e pode requerer atenção especial ao ler ou gravar em volumes locais montados.

---

## ADR-004: Migrações de Banco de Dados Injetadas na Inicialização

### Contexto
A execução manual de migrações de banco de dados por desenvolvedores em ambientes compartilhados ou produção gera inconsistência de esquemas e erros operacionais. As migrações devem ser automatizadas.

### Decisão
Decidimos embutir o executável do Goose e o diretório de migrações na imagem do backend e executá-las automaticamente no script de inicialização do container (`CMD`), logo após a verificação de saúde do banco PostgreSQL.

### Consequências
* **Positivas**: Consistência absoluta de banco. O backend nunca iniciará se houver falhas nas migrations, prevenindo erros de compatibilidade de código com esquema antigo.
* **Negativas**: Em cenários de múltiplos containers rodando em cluster (ex: Kubernetes), múltiplos containers podem tentar rodar migrações ao mesmo tempo. Isso é mitigado pelo Goose, que utiliza bloqueio exclusivo via transação e tabela de controle interno.
