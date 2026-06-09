# Tarefas de Desenvolvimento da Landing Page

Este documento contém o checklist de tarefas para implementar e testar a nova landing page da aplicação.

---

## Frontend

- [ ] **Modificar a Página Inicial (`app/src/app/page.tsx`)**:
  - [ ] Importar Redux Store (`useSelector`, `RootState`) e Next.js Navigation.
  - [ ] Implementar cabeçalho público reativo.
  - [ ] Implementar seção hero com título impactante, textos persuasivos e botões CTA inteligentes.
  - [ ] Criar ilustração interativa do dashboard em CSS puro (Tailwind CSS) com animações suaves de transição.
  - [ ] Criar grade de 4 recursos principais com ícones e efeitos hover de "levitação".
  - [ ] Criar seção de estatísticas do sistema com design moderno e gradiente sutil.
  - [ ] Criar rodapé corporativo com links e copyright.

---

## Qualidade e Testes (QA)

- [ ] **Criar Testes E2E com Cypress**:
  - [ ] Criar arquivo `cypress/e2e/app/landing_page.cy.ts`.
  - [ ] Validar que a landing page carrega corretamente para visitantes anônimos.
  - [ ] Validar que os CTAs e links de login/cadastro direcionam para as rotas corretas.
  - [ ] Validar que, se o usuário estiver logado, a landing page exibe o botão "Ir para o Painel" e redireciona com sucesso para a listagem de clientes.
