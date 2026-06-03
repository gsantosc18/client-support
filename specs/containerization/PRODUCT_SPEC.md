# Product Specification: Containerização de Frontend e Backend

Este documento especifica os objetivos de negócio, requisitos não-funcionais, regras, critérios de aceite e fluxos de uso da infraestrutura de containerização do projeto **Client Support Hub**.

---

## 1. Objetivos da Feature

O objetivo principal desta funcionalidade é padronizar e isolar os ambientes de execução da aplicação utilizando Docker, garantindo que o software funcione de forma idêntica e previsível tanto na máquina de desenvolvimento local quanto nos ambientes de homologação e produção.

### Objetivos Específicos:
* **Ambiente de Desenvolvimento Unificado**: Facilitar o onboarding de novos desenvolvedores através de um fluxo simples de inicialização (`make infra` ou `make up`).
* **Paridade de Ambientes**: Mitigar bugs clássicos de "funciona na minha máquina" ao replicar a pilha tecnológica exata de produção localmente.
* **Segurança Aprimorada**: Garantir que as imagens finais em produção executem com privilégios reduzidos e contenham apenas o mínimo necessário de bibliotecas (Hardening).
* **Desempenho e Eficiência**: Reduzir significativamente o tamanho das imagens Docker e o tempo de build/inicialização dos containers.

---

## 2. Requisitos Não-Funcionais e Critérios de Aceite

Para garantir uma solução robusta e state-of-the-art, os containers devem atender aos seguintes critérios estritos de qualidade:

| ID | Requisito / Critério de Aceite | Detalhe Técnico |
|---|---|---|
| **RF-01** | Multi-Stage Builds | As imagens finais de produção do backend e frontend devem usar compilação e empacotamento multi-stage para descartar ferramentas de build no runtime. |
| **RF-02** | Otimização do Frontend | O build do frontend (Next.js) deve usar o recurso `output: 'standalone'`, gerando uma imagem de produção menor que **180MB** (em comparação com >1GB padrão). |
| **RF-03** | Otimização do Backend | O binário do backend (Golang) deve ser compilado estaticamente com remoção de símbolos de debug (`-ldflags="-s -w"`), gerando uma imagem final de produção menor que **50MB**. |
| **RF-04** | Hardening (Segurança) | As imagens de runtime de produção não devem rodar como `root`. Devem ser configurados os usuários `node` (frontend) e `appuser` (backend). |
| **RF-05** | Inicialização Resiliente | A orquestração via Docker Compose deve conter checagens de saúde (`healthcheck`) adequadas. O backend só deve iniciar após o banco de dados estar saudável. |
| **RF-06** | Migrações Automáticas | As migrações do banco de dados PostgreSQL via Goose devem ser executadas automaticamente no fluxo de inicialização antes do servidor do backend aceitar conexões. |

---

## 3. Regras de Negócio e Infraestrutura

1. **Paridade Dev/Prod**: 
   * No ambiente local (`development`), os volumes do código-fonte devem ser montados para suportar hot-reload e Fast Refresh no Next.js, e compilação em tempo de execução no Go.
   * No ambiente de `production`, o código-fonte deve ser totalmente copiado e embutido estaticamente na imagem, sem montagem de volumes de código.
2. **Persistência de Dados**:
   * O banco de dados PostgreSQL e as sessões do Redis devem persistir entre reinicializações de containers através de volumes nomeados no Docker (`pgdata` e `redisdata` ou similares).
3. **Isolamento de Credenciais**:
   * Nenhuma credencial sensível (senhas de banco, chaves JWT) deve ser embutida no código ou no Dockerfile diretamente. Devem ser expostas obrigatoriamente através de variáveis de ambiente (`.env`).

---

## 4. Fluxo Funcional de Uso

```mermaid
graph TD
    A[Desenvolvedor clica em 'make infra'] --> B[Docker Compose lê as configurações]
    B --> C[Inicializa Banco de Dados Postgres]
    B --> D[Inicializa Redis]
    C -->|Verifica Healthcheck pg_isready| E{Banco Saudável?}
    E -- Não -->|Espera 5s| C
    E -- Sim --> F[Inicializa Backend]
    F --> G[Roda Goose Migrations up]
    G --> H[Inicia Servidor Fiber na porta 8080]
    B --> I[Inicializa Frontend Next.js]
    I --> J[Expe na porta 3000 comunicando com Backend]
```
