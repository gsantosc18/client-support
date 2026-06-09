# Decisão Arquitetural: Landing Page Interativa

Este documento registra as decisões arquiteturais tomadas para a implementação da landing page.

---

## ADR-001
Substituição do Boilerplate Next.js por Landing Page Pública Interativa

### Contexto
A página inicial da aplicação ainda apresenta o layout padrão gerado pelo Next.js (com o logotipo do Next.js e links para a documentação do framework). Para dar uma identidade profissional ao sistema **SuporteCliente** e facilitar a onboarding de usuários, é fundamental implementar uma landing page de apresentação corporativa. Esta página precisa ser rápida, esteticamente agradável, alinhada com as cores da marca e inteligente o suficiente para identificar se o visitante já está autenticado a fim de otimizar sua jornada.

### Decisão
1. **Página Dinâmica baseada no Cliente**: Declarar `app/src/app/page.tsx` com `"use client"`. Isso permite ler o estado da Redux Store (`authStore`) em tempo de execução para renderizar botões de CTA personalizados e evitar redirecionamentos agressivos no lado do servidor que poderiam degradar a pontuação de SEO ou performance.
2. **Ilustração e Painel em CSS Puro**: Em vez de carregar imagens pesadas ou depender de assets externos não otimizados para o mockup do produto, criaremos um dashboard simulado interativo utilizando puramente classes do Tailwind CSS e animações CSS (keyframes).
3. **Menu Superior Contextual**: Integrar a navegação superior na própria landing page de forma independente do `Header` interno de clientes/processos, simplificando os links e focando em conversão (Entrar/Cadastrar vs Painel).

### Consequências
* **Positivas**:
  * Carregamento extremamente rápido devido à ausência de assets de imagem externos pesados na seção hero.
  * Experiência fluida para usuários logados, que podem pular a página de apresentação em um clique.
  * Consistência visual absoluta com o restante da aplicação usando as variáveis e tokens do CSS global.
* **Negativas**:
  * Ligeiro aumento do bundle inicial da página inicial devido à inclusão do estado do Redux no lado do cliente (mitigado pelo tamanho pequeno do authStore).
