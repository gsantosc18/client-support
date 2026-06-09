# Product Specification: Landing Page

Este documento define o escopo do produto, regras de negócio e critérios de aceite para a nova landing page do sistema **SuporteCliente**.

---

## 1. Objetivos da Feature

Substituir a página padrão do Next.js (que serve como boilerplate) por uma landing page moderna, responsiva, com visual premium e focada em conversão. O objetivo principal é apresentar o sistema aos visitantes e direcioná-los para o login ou cadastro de novas contas.

---

## 2. Requisitos Funcionais (RF)

* **RF-001 (Navegação Superior)**:
  * Exibir o logotipo do sistema.
  * Se o usuário **não estiver autenticado**, exibir botões de atalho: "Entrar" (redireciona para `/login`) e "Cadastrar-se" (redireciona para `/register`).
  * Se o usuário **estiver autenticado**, exibir um botão de atalho "Ir para o Painel" (redireciona para `/clients`).
* **RF-002 (Seção Hero)**:
  * Apresentar uma chamada impactante (H1) explicando o valor da plataforma.
  * Subtítulo explicativo com tipografia moderna.
  * Botões de chamada para ação (CTAs) em destaque (ex: "Iniciar Agora Grátis" e "Falar com Suporte").
  * Mockup visual premium ou animação representando o painel de processos e clientes.
* **RF-003 (Seção de Recursos/Features)**:
  * Grid de cards detalhando as principais funcionalidades:
    * **Controle de Clientes**: Cadastro, listagem e gestão fácil.
    * **Fluxo de Processos**: Acompanhamento dinâmico, notas e histórico.
    * **Segurança e JWT**: Controle seguro de acessos.
    * **Interface Fluida**: UI otimizada e responsiva.
* **RF-004 (Seção de Estatísticas/Social Proof)**:
  * Exibir números relevantes de mentira/demonstração com visualização de impacto (ex: "+10k Processos Ativos", "99.9% Uptime", "Milhares de Clientes Atendidos").
* **RF-005 (Rodapé/Footer)**:
  * Direitos autorais, links para políticas de privacidade, redes sociais e suporte técnico.

---

## 3. Regras de Negócio (RN)

* **RN-001 (Identificação de Sessão)**:
  * A landing page deve ler a sessão ativa do usuário (verificar se `accessToken` e `isAuthenticated` existem no estado global ou localStorage/sessionStorage).
  * Caso o usuário clique em "Iniciar Agora" ou "Ir para o Painel" e já esteja logado, ele deve ser levado diretamente para `/clients`.
* **RN-002 (Paleta de Cores e Identidade Visual)**:
  * Deve utilizar estritamente a identidade visual baseada nas variáveis de CSS definidas no arquivo `globals.css` (ex: cores primitivas brand-vibrant, brand-cyan, brand-teal).
  * O design deve ter aspecto moderno (efeito de gradiente linear/radial no fundo, cantos arredondados, sombras sutis e micro-transições nos estados hover).

---

## 4. Critérios de Aceite

* [ ] O usuário consegue visualizar a landing page acessando a rota raiz `/`.
* [ ] A página é 100% responsiva, oferecendo uma experiência fluida no desktop, tablet e mobile.
* [ ] Os botões de navegação e CTAs alteram sua aparência dependendo do estado de autenticação (usuário logado vs não logado).
* [ ] Todos os botões interativos possuem estados hover com transição suave.
* [ ] Nenhum elemento de imagem ou texto fica quebrado ou desalinhado.
