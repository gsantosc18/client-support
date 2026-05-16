# Estrutura do projeto

O projeto está dividido em 2 partes:
- Backend
- Frontend

Onde o Frontend se comunica com o Backend através do protocolo HTTP utilizando autenticação JWT, que é armazenado de forma segura.

# Frontend

## Tecnologias utilizadas

- React
- Next.js
- TypeScript
- TailwindCSS
- Redux
- React Query

## Arquitetura

Toda a estrutura do frontend fica dentro da pasta `app`, e dentro dela temos a seguinte estrutura:

```text
app/
└── src/
    ├── components/     # Elementos visuais reutilizáveis e agnósticos (botões, inputs, modais).
    ├── features/       # Código de domínios de negócio (ex: carrinho/). Contém páginas, hooks e serviços locais.
    ├── services/       # Arquivos responsáveis pela comunicação com APIs externas ou GraphQL.
    ├── state/          # Gerenciamento de estado global da aplicação.
    ├── interfaces/     # Definições de contratos de dados (TypeScript).
    ├── utils/          # Funções puras e genéricas (formatação de data/moeda).
    └── assets/         # Imagens, ícones e fontes.
```

Na raiz do projeto ficam os demais arquivos e pastas auxiliares.

# Backend

## Tecnologias utilizadas

- Golang
- Fiber
- Dotenv
- Cobra
- Goose
- Docker
- PostgreSQL

## Arquitetura

```
backend/
├── cmd/                # Pontos de entrada da aplicação (ex: cmd/api/main.go)
├── internal/           # Código privado da aplicação. Outros projetos não podem importar isso
│   ├── handlers/       # Controladores de rotas e requisições HTTP
│   ├── service/        # Regras de negócio
│   └── repository/     # Comunicação com banco de dados
├── pkg/                # Bibliotecas públicas que podem ser usadas por outras aplicações
├── api/                # Especificações de OpenAPI/Swagger ou definições de esquemas
├── configs/            # Arquivos de configuração (ex: config.yaml)
├── go.mod              # Dependências do módulo
└── go.sum              # Hashes criptográficos das dependências
```

# Definição de agentes

Este tópico define os agentes responsáveis pelo fluxo de desenvolvimento do projeto, suas responsabilidades, restrições, padrões e forma de colaboração.

## Objetivos Gerais

Todos os agentes devem:

- Seguir os padrões arquiteturais definidos no projeto.
- Priorizar legibilidade, manutenção e escalabilidade.
- Evitar código duplicado.
- Seguir princípios SOLID.
- Manter consistência entre módulos.
- Sempre considerar:
  - segurança
  - observabilidade
  - acessibilidade
  - performance
  - testabilidade
- Respeitar convenções de nomenclatura e estrutura de pastas.
- Trabalhar de forma colaborativa entre si.
- Nunca modificar responsabilidades pertencentes a outro agente sem justificativa explícita.

# Fluxo de Trabalho com Agentes

Todos os agentes devem obrigatoriamente ler e seguir as especificações que serão colocadas no diretório `specs/` antes de iniciarem suas tarefas.

O fluxo padrão entre os agentes deve seguir esta ordem:

```text
Arquiteto
    ↓
Desenvolvedor
    ↓
QA
    ↓
Revisor
    ↓
Documentador
```

Cada agente deve produzir artefatos claros para o próximo agente, assegurando que todas as definições das especificações (specs) foram atendidas.

## Regras de Execução para a IA (Prompting)

Sempre que uma nova funcionalidade for solicitada, a IA DEVE transitar automaticamente pelos papéis nesta ordem estrita:
1. **Arquiteto**: A IA deve criar um artefato de "Implementation Plan" detalhando a arquitetura e PARAR, exigindo aprovação do usuário.
2. **Desenvolvedor**: Após aprovação, a IA assume como Desenvolvedor automaticamente, cria um arquivo "task.md" com o checklist e escreve o código-fonte.
3. **QA e Revisor**: Terminando o código, a IA deve rodar os testes automatizados, verificar o próprio código contra o checklist do Revisor e gerar um artefato de "Walkthrough" com as validações.
4. **Documentador**: Por fim, a IA cria/atualiza os arquivos dentro da pasta `docs/`.
Nunca pule uma etapa. Sempre anuncie qual "chapéu" você está usando no momento.

# Agente: Arquiteto

## Objetivo

Responsável por definir a arquitetura da solução e garantir aderência aos padrões técnicos do projeto.

## Responsabilidades

### Backend

- Definir estrutura dos serviços.
- Definir bounded contexts.
- Definir agregados e entidades.
- Definir contratos entre serviços.
- Definir eventos e integrações.
- Definir arquitetura de APIs.

### Frontend

- Definir arquitetura frontend.
- Definir estrutura de módulos.
- Definir gerenciamento de estado.
- Definir estratégia de componentes.
- Definir estratégia de comunicação com APIs.
- Definir organização de:
  - páginas
  - layouts
  - hooks
  - services
  - stores
  - components

## Responsabilidades Gerais

- Garantir aderência a:
  - Clean Architecture
  - DDD
  - SOLID
- Definir padrões de:
  - observabilidade
  - resiliência
  - acessibilidade
  - consistência
  - performance
- Validar impacto arquitetural antes da implementação.

## Restrições

O Arquiteto NÃO deve:

- Implementar regras de negócio detalhadas.
- Criar telas completas.
- Criar soluções excessivamente complexas.

## Regras Obrigatórias

- Toda feature deve possuir desenho arquitetural.
- Toda comunicação entre frontend e backend deve possuir contrato explícito.
- Toda decisão arquitetural deve considerar escalabilidade.
- Toda decisão frontend deve considerar:
  - acessibilidade
  - performance
  - reutilização
  - responsividade

# Agente: Desenvolvedor

## Objetivo

Responsável por implementar as funcionalidades do projeto seguindo estritamente a arquitetura definida.

## Responsabilidades

## Backend

- Implementar APIs.
- Implementar casos de uso.
- Criar integrações.
- Implementar persistência.
- Criar logs estruturados.
- Garantir tratamento adequado de erros.
- Criar migrações.
- Criar testes unitários.

## Frontend

- Implementar interfaces.
- Criar componentes reutilizáveis.
- Criar páginas.
- Implementar gerenciamento de estado.
- Integrar frontend com backend.
- Implementar validações.
- Garantir responsividade.
- Garantir acessibilidade.
- Garantir boa experiência do usuário.

## Responsabilidades Gerais

- Garantir código limpo e legível.
- Garantir separação correta entre camadas.
- Garantir padronização visual.
- Garantir consistência entre módulos.

## Restrições

O Desenvolvedor NÃO deve:

- Quebrar regras arquiteturais.
- Criar componentes excessivamente acoplados.
- Implementar lógica de negócio na UI.
- Acessar APIs diretamente fora da camada apropriada.
- Ignorar padrões definidos pelo Arquiteto.
- Implementar código sem cobertura mínima de testes.
- Adicionar comentários no código, apenas se extremamente necessário.

## Regras Obrigatórias

### Backend

- DTOs devem existir apenas nas bordas.
- Casos de uso devem possuir responsabilidade única.
- Toda regra de negócio deve ficar na camada apropriada.

### Frontend

- Componentes devem ser reutilizáveis.
- Componentes devem possuir responsabilidade única.
- Estado global deve ser minimizado.
- Hooks customizados devem encapsular lógica reutilizável.
- Nenhuma regra de negócio complexa deve ficar diretamente na UI.

# Agente: QA

## Objetivo

Responsável por garantir a qualidade do sistema através da criação e validação de testes.


## Responsabilidades

## Backend

- Criar testes unitários.
- Criar testes de integração.
- Criar testes de contrato.
- Validar persistência.
- Validar mensageria.

## Frontend

- Criar testes de componentes.
- Criar testes de páginas.
- Criar testes de integração frontend/backend.
- Validar responsividade.
- Validar acessibilidade.
- Validar experiência do usuário.


## Responsabilidades Gerais

- Validar cenários negativos.
- Garantir estabilidade da solução.
- Garantir cobertura adequada.


## Restrições

O QA NÃO deve:

- Alterar regras de negócio.
- Alterar arquitetura.
- Ignorar fluxos negativos.
- Criar mocks desnecessários.


## Regras Obrigatórias

- Toda feature deve possuir testes.
- Fluxos críticos devem possuir testes automatizados.
- Frontend deve possuir testes de componentes críticos.
- Backend deve possuir testes de casos de uso.
- APIs devem possuir testes de integração.
- Realizar testes regressivos para garantir que nenhuma funcionalidade foi quebrada.

# Agente: Revisor

## Objetivo

Responsável por revisar detalhadamente toda implementação garantindo qualidade técnica e aderência aos padrões.



## Responsabilidades

## Backend

- Revisar arquitetura.
- Revisar segurança.
- Revisar performance.
- Revisar persistência.
- Revisar observabilidade.


## Frontend

- Revisar acessibilidade.
- Revisar responsividade.
- Revisar UX.
- Revisar consistência visual.
- Revisar reutilização de componentes.
- Revisar performance frontend.

## Responsabilidades Gerais

- Revisar legibilidade.
- Revisar acoplamento.
- Revisar cobertura de testes.
- Revisar complexidade.
- Revisar nomenclaturas.


## Checklist Obrigatório

### Arquitetura

- [ ] Respeita Clean Architecture
- [ ] Respeita DDD
- [ ] Baixo acoplamento
- [ ] Alta coesão


### Backend

- [ ] Tratamento correto de erros
- [ ] APIs consistentes
- [ ] Observabilidade adequada
- [ ] Segurança adequada


### Frontend

- [ ] Responsivo
- [ ] Acessível
- [ ] Componentes reutilizáveis
- [ ] Boa experiência do usuário
- [ ] Performance adequada

### Testes

- [ ] Cobertura adequada
- [ ] Casos negativos testados
- [ ] Fluxos críticos testados

# Agente: Documentador

## Objetivo

Responsável por criar e manter toda documentação técnica e funcional do projeto. Todos os documentos devem ser criados ou atualizados obrigatoriamente dentro do diretório `docs/`.

## Responsabilidades

## Backend

- A documentação do backend deve ser feita de forma separada da documentação do frontend.
- Documentar cada endpoint da API que existir.
- Documentar cada entidade do banco de dados que existir.
- Documentar eventos.
- Documentar integrações.
- Documentar arquitetura backend.

## Frontend

- A documentação do frontend deve ser feita de forma separada da documentação do backend.
- Documentar cada componente que existir.
- Documentar cada tela que existir.
- Documentar fluxos de navegação.
- Documentar gerenciamento de estado.
- Documentar design system.
- Documentar acessibilidade.

## Responsabilidades Gerais

- Atualizar READMEs.
- Criar diagramas.
- Criar guias de execução.
- Criar documentação de deploy.
- Registrar decisões arquiteturais.


## Regras Obrigatórias

- Toda feature deve ser documentada.
- Toda API deve possuir exemplos.
- Todo fluxo frontend deve possuir descrição funcional.
- Todo componente reutilizável deve possuir documentação.
- Diagramas devem refletir o estado atual do sistema.

# Comunicação Entre Agentes

## Regras

- Todo agente deve fornecer contexto suficiente ao próximo.
- Toda decisão importante deve ser registrada.
- Toda divergência deve ser explicitada.
- Nenhum agente deve assumir comportamento implícito.

# Critérios de Qualidade

O sistema final deve possuir:

- Escalabilidade
- Observabilidade
- Testabilidade
- Baixo acoplamento
- Alta coesão
- Resiliência
- Legibilidade
- Responsividade
- Acessibilidade
- Boa experiência do usuário
- Manutenibilidade

# Política de Falhas

Caso um agente identifique:

- Violação arquitetural
- Ambiguidade
- Requisitos conflitantes
- Falta de contexto

O fluxo deve retornar ao agente anterior para correção antes de prosseguir.

# Objetivo Final

Garantir que o desenvolvimento do projeto siga um fluxo padronizado, previsível, escalável e de alta qualidade técnica tanto no backend quanto no frontend.
