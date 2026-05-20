# Guia de Testes de Frontend, Mapeamento de Interface e Automação Cypress (QA)

Este documento descreve as diretrizes, ferramentas, configurações e boas práticas para a execução de testes de frontend, mapeamento de comportamento de interface e testes automatizados com Cypress pelo **Agente de QA**, conforme definido em `AGENTS.md`.

---

## Objetivo do Mapeamento de Interface

O principal objetivo de navegar pelas páginas alteradas do frontend é garantir que qualquer modificação ou nova funcionalidade:
1. **Comportamento Correto**: Apresente o fluxo lógico esperado pelo usuário, sem falhas de navegação.
2. **Consistência Visual**: Mantenha a fidelidade estética, responsividade e alinhamento visual em diferentes resoluções.
3. **Prevenção de Regressões**: Não quebre comportamentos ou elementos visuais existentes em outras partes do sistema.

---

## Metodologia de Teste e Mapeamento

Sempre que houver alterações no frontend (páginas, componentes ou fluxos), o QA deve seguir os seguintes passos:

### 1. Identificação de Páginas Afetadas
- Analisar a especificação de frontend (`FRONTEND_SPEC.md`) e a lista de tarefas executadas (`TASKS.md`).
- Mapear todas as rotas e componentes que foram criados ou alterados.

### 2. Navegação Dinâmica e Interação
- Acessar o sistema executando a infraestrutura local:
  ```bash
  make infra
  ```
- Interagir com todos os elementos interativos das telas alteradas (botões, inputs, modais, links, formulários).
- Simular diferentes cenários de entrada de dados (fluxos felizes e caminhos de exceção).

### 3. Validação Visual e de Layout
- Validar a responsividade em dispositivos móveis e desktops.
- Garantir a legibilidade de textos, contrastes adequados e acessibilidade básica de navegação por teclado.

---

## Automação de Testes com Cypress

O **Agente de QA** é responsável por manter e expandir o projeto de automação construído com **Cypress**, que engloba tanto testes de fluxo de usuário ponta a ponta (E2E) no frontend quanto validações de requisições de API diretamente no backend.

### 1. Configuração do Ambiente e Portas

Os serviços em ambiente de desenvolvimento rodam sob as seguintes especificações de portas locais:
* **Frontend**: `http://localhost:3000` (URL base padrão para navegação e teste E2E do Cypress).
* **Backend**: `http://localhost:8080` (URL base padrão para requisições de API diretas no Cypress via `cy.request()`).

No arquivo de configuração do Cypress (encapsulado e executado diretamente a partir de `cypress/cypress.config.js`), os caminhos das configurações devem ser relativos à pasta raiz do Cypress (`cypress/`):

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    env: {
      backendUrl: "http://localhost:8080"
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    specPattern: "e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "support/e2e.js",
    fixturesFolder: "fixtures",
    setupNodeEvents(on, config) {
      // Plugins or events setup if needed
    },
  },
});
```

### 2. Estrutura do Projeto Cypress

Toda a infraestrutura de automação do Cypress fica armazenada e isolada dentro da pasta `cypress/`, contendo seu próprio `package.json` e arquivos de dependência:

```text
cypress/
├── package.json              # Dependências locais do Cypress
├── package-lock.json         # Lockfile das dependências
├── cypress.config.js         # Configuração relativa à pasta cypress/
├── e2e/
│   ├── auth/
│   │   ├── login.cy.js       # Testes de login, "Manter-me logado" e lockout temporário (E2E)
│   │   ├── register.cy.js    # Testes de cadastro, senha fraca, termos de uso e e-mail duplicado (E2E)
│   │   └── recovery.cy.js    # Testes de fluxo de esqueci minha senha e redefinição (E2E)
│   └── api/
│       └── backend_api.cy.js # Testes diretos contra endpoints Go Fiber (Status HTTP, JWT, Blacklist)
├── fixtures/
│   └── users.json            # Payload de usuários de teste
└── support/
    ├── commands.js           # Comandos customizados com formatação automática de data
    └── e2e.js                # Arquivo de carregamento global e bypass de exceções
```

### 3. Execução dos Testes Cypress

Para rodar os testes localmente, certifique-se de que a infraestrutura está ativa (`make infra`). Em seguida, utilize o script global encapsulado no Makefile ou os comandos locais:

* **Modo Headless (Execução Automática no Pipeline/Shell)**:
  ```bash
  make tests-e2e
  # ou na pasta 'cypress/'
  cd cypress && npm run cypress:run
  ```

* **Modo Interativo (Painel do Cypress para Debugging)**:
  ```bash
  cd cypress && npx cypress open
  ```

---

## Ferramentas Recomendadas

Para a execução e automação destes testes, o QA pode utilizar as seguintes ferramentas:

| Ferramenta | Finalidade | Tipo de Validação |
| :--- | :--- | :--- |
| **Cypress** | Automação completa de fluxos E2E (localhost:3000) e testes de API (localhost:8080). | Fluxo completo / Integração / Regressão |
| **Subagente de Navegador (Browser Agent)** | Navegação simulada por IA para validações interativas rápidas. | Funcional / Visual |
| **Jest & React Testing Library** | Testes unitários e de integração de componentes. | Lógica / Estrutural |

---

## Evidências e Documentação

Ao concluir o mapeamento, o QA deve registrar no **Walkthrough**:
- Quais fluxos de navegação e cenários de teste automatizados (Cypress) foram testados.
- Prints ou links de gravações comprovando que a interface se comporta perfeitamente.
- Ocorrência de edge cases identificados durante a navegação.
