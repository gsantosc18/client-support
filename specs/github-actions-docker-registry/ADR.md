# Architectural Decision Record (ADR)

## ADR-002: Automatização do Pipeline de Build e Publicação de Imagens Docker via GitHub Actions

### Contexto
O projeto **Client Support Hub** utiliza Docker para empacotamento tanto no ambiente de desenvolvimento local quanto em produção. Para produção, a orquestração é feita via Docker Swarm, o qual requer que as imagens estejam acessíveis no registry privado `registry.advocase.site`. O processo manual de build e push local consome tempo do desenvolvedor, exige login local e pode introduzir divergências nos artefatos criados devido a variações no ambiente de build local (versões do Node, Go, Docker, etc.).

### Decisão
Decidiu-se pela criação de um pipeline automatizado de CI/CD utilizando o GitHub Actions. O workflow será acionado automaticamente a cada push na branch principal (`main`/`master`) ou por disparo manual (`workflow_dispatch`). O workflow usará o Docker Buildx com cache integrado (`type=gha`) para otimizar a velocidade de build e publicará as imagens com as tags `latest` e o hash do commit (`sha-<hash>`) no registry `registry.advocase.site`.

### Consequências
* **Pontos Positivos**:
  * Automação total da publicação de novas versões.
  * Padronização das imagens finais geradas em um ambiente de build limpo e idêntico.
  * Velocidade no pipeline graças ao Docker Layer Caching (cache `gha`).
  * Rastreabilidade, permitindo deploys com base em tags específicas de commit.
* **Pontos Negativos/Desafios**:
  * Dependência de credenciais válidas configuradas como secrets no GitHub.
  * Consumo de minutos de execução do GitHub Actions runner gratuito.
