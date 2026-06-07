# Guia de Deploy: Docker Registry & Docker Swarm

Este documento descreve o fluxo operacional para realizar o deploy em ambiente de produção utilizando o registry de imagens privado `registry.advocase.site` e a orquestração de contêineres com o Docker Swarm.

---

## 1. Fluxo de Publicação de Imagens (Registry)

As imagens dos serviços são compiladas localmente ou via pipeline de CI/CD, tagueadas e publicadas no registry privado.

### Passo 1.1: Autenticação
Antes de enviar as imagens, efetue a autenticação no registry privado:
```bash
docker login registry.advocase.site
```
Insira as credenciais de acesso quando solicitado.

### Passo 1.2: Compilação e Identificação (Build & Tag)
O Docker Swarm necessita que as imagens estejam acessíveis no registry para serem distribuídas entre os nós do cluster.

#### Backend (Golang)
Compile o backend a partir do diretório raiz do projeto:
```bash
docker build \
  -t registry.advocase.site/client-support/backend:latest \
  ./backend
```

#### Frontend (Next.js App)
O build do frontend requer a definição da URL da API produtiva. Substitua o valor abaixo pela URL real de produção:
```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.advocase.site/api \
  -t registry.advocase.site/client-support/app:latest \
  ./app
```

### Passo 1.3: Publicação (Push)
Envie as imagens tagueadas para o registry privado:
```bash
docker push registry.advocase.site/client-support/backend:latest
docker push registry.advocase.site/client-support/app:latest
```

---

## 2. Estrutura da Stack (`docker-stack.yml`)

O arquivo [docker-stack.yml](file:///Users/gedalias.caldas/Documents/client-suport/docker-stack.yml) define os serviços em produção. 

### Diferenças para o Ambiente Local:
1. **Sem Diretiva de Build**: O Swarm não compila imagens; ele baixa imagens pré-compiladas do registry.
2. **Alta Disponibilidade**: Os serviços de aplicação (`backend` e `app`) são configurados com `replicas: 2`.
3. **Atualização Sem Parada (Rolling Update)**: Configurado com `order: start-first` para iniciar o contêiner atualizado antes de terminar o antigo, evitando quedas na aplicação.
4. **Volumes Nomeados**: Os volumes persistentes são definidos como volumes nomeados do Docker para melhor gerenciamento pelo motor de volume.
5. **Restrições de Colocação**: Os serviços com estado local (`db` e `redis`) possuem restrições para rodar apenas no nó `manager` para evitar a perda de dados se migrados de nó (caso não haja storage compartilhado e distribuído).

---

## 3. Orquestração e Deploy no Cluster Swarm

A execução do deploy da stack é feita a partir do nó manager do cluster Docker Swarm.

### Passo 3.1: Inicializar o Swarm (se necessário)
Caso a máquina atual ainda não seja um nó Swarm ativo:
```bash
docker swarm init
```

### Passo 3.2: Deploy da Stack com Autenticação no Registry
Para que todos os nós workers do cluster consigam obter as imagens do registry privado, utilize a flag `--with-registry-auth` ao fazer o deploy:
```bash
docker stack deploy --with-registry-auth -c docker-stack.yml client-support
```

### Passo 3.3: Monitorar a Stack
Para inspecionar o status do deployment e a integridade das tarefas:

* **Listar serviços criados**:
  ```bash
  docker stack services client-support
  ```

* **Visualizar tarefas e contêineres rodando**:
  ```bash
  docker stack ps client-support
  ```

* **Exibir logs de um serviço específico**:
  ```bash
  docker service logs -f client-support_backend
  ```

---

## 4. Atualizações (Rolling Updates)

Para publicar uma nova versão em produção após alterações de código:
1. Compile e envie as imagens atualizadas com a tag de versão (ex: `v1.0.1` ou `latest`):
   ```bash
   docker build -t registry.advocase.site/client-support/backend:latest ./backend
   docker push registry.advocase.site/client-support/backend:latest
   ```
2. Atualize o serviço em execução no cluster para puxar a nova imagem:
   ```bash
   docker service update --image registry.advocase.site/client-support/backend:latest --with-registry-auth client-support_backend
   ```
   *O Docker Swarm atualizará um container por vez, respeitando a configuração de delay e ordem definida na stack.*
