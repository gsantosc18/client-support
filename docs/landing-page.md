# Documentação do Frontend: Landing Page

## Visão Geral

A Landing Page (página inicial do sistema) substitui a página de boas-vindas padrão do Next.js. Ela serve como a porta de entrada pública do sistema **SuporteCliente**, apresentando a proposta de valor do produto, demonstrando os principais recursos visuais e direcionando os usuários para as rotas corretas (Login, Cadastro ou Painel Administrativo) com base no seu estado de autenticação ativo.

---

## Estrutura do Módulo

Os arquivos envolvidos nesta feature são:

* **Página Inicial (`app/src/app/page.tsx`)**: Componente Next.js configurado para rodar no cliente (`"use client"`), contendo a marca, menu de navegação responsivo, hero section, mockup de dashboard em CSS puro, grade de features, seção de estatísticas e rodapé.
* **Teste E2E (`cypress/e2e/app/landing_page.cy.js`)**: Arquivo de testes automatizados Cypress cobrindo a navegação de visitantes não autenticados e o redirecionamento de usuários logados.

---

## Integração com a Identidade Visual (Design System)

A interface utiliza estritamente as variáveis CSS declaradas no `globals.css` e mapeadas no `tailwind.config.ts`:

1. **Cores de Destaque**:
   * O título principal faz uso de um gradiente linear `bg-gradient-to-r from-brand-cyan to-brand-vibrant bg-clip-text text-transparent`.
   * Elementos interativos secundários utilizam `border-border-default` com transições de fundo para `bg-background-muted`.
2. **Efeitos e Profundidade (Aesthetics)**:
   * **Glow/Ambient Background**: Duas elipses com desfoque radial (`blur-[100px]`) e opacidade reduzida no fundo do Hero criam uma atmosfera moderna e de alta fidelidade visual.
   * **Efeito Levitação**: Os cards da grade de recursos possuem a transição `hover:-translate-y-1 hover:shadow-lg hover:border-action-primary/30 transition-all duration-300`, simulando profundidade ao passar o mouse.
3. **Mockup Interativo de Dashboard**:
   * Uma representação animada de alta fidelidade do painel de processos e clientes criada em CSS puro.
   * Contém contadores numéricos de processos e tags de status piscantes/pulsantes (`animate-pulse`) representando fluxos ativos (ex: "Em Andamento").
   * Um mini-gráfico vertical de barras animado (`animate-bounce`) no canto inferior demonstra o dinamismo da plataforma sem carregar scripts pesados de terceiros.

---

## Fluxos de Navegação e Estados de Sessão

Para evitar erros de hidratação (hydration errors) devido à leitura de tokens locais do navegador pelo Next.js durante a pré-renderização estática do lado do servidor (SSR), o componente usa um gancho de montagem inicial:

```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true);
}, []);
```

### 1. Comportamento para Visitante Anônimo (Não Autenticado)
* O cabeçalho exibe links explícitos para **Entrar** (redireciona para `/login`) e **Criar Conta** (redireciona para `/register`).
* O botão CTA principal do Hero exibe o texto "Iniciar Agora Grátis" e aponta para a rota `/register`.

### 2. Comportamento para Usuário Autenticado
* O cabeçalho substitui as opções de autenticação pelo botão **Ir para o Painel** (redireciona para `/clients`).
* O CTA do Hero se adapta para "Ir para o Painel" e redireciona diretamente para o fluxo principal de visualização de clientes (`/clients`).

---

## Testes Automatizados E2E (Cypress)

A integridade do comportamento e a consistência visual da landing page são asseguradas pelo teste automatizado `landing_page.cy.js`:

1. **Cenário de Visitante Anônimo**:
   * Valida se a página renderiza o título principal, grade de recursos, estatísticas e rodapé.
   * Certifica que os botões de cabeçalho "Entrar" e "Criar Conta" existem.
   * Valida se a navegação do CTA e dos botões direcionam corretamente para `/register` e `/login`.
2. **Cenário de Usuário Logado**:
   * Simula um login com um usuário de teste persistindo a sessão.
   * Visita a raiz `/` e valida que os botões de login/registro sumiram, dando lugar a "Ir para o Painel".
   * Verifica se o clique em "Ir para o Painel" redireciona com sucesso para `/clients`.

### Executando os Testes E2E
Você pode rodar toda a suíte de testes de ponta a ponta digitando o seguinte comando no terminal na raiz do projeto:

```bash
make tests-e2e
```
ou na pasta `cypress/`:
```bash
npm run cypress:run
```
