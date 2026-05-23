# Architectural Decision Record — Alinhamento de Páginas de Formulário

Este documento registra as decisões arquiteturais tomadas para a padronização e modernização do fluxo de formulários do sistema.

---

## ADR-002: Padronização Visual de Formulários e Adoção de React Hook Form + Zod

### Contexto
Atualmente, as telas de cadastro e edição de recursos (como Clientes e Processos) exibem inconsistências de design e comportamento visual:
- Os formulários usam tags HTML genéricas estilizadas com classes Tailwind repetitivas e declaradas inline, sem um container ou wrapper semântico global.
- A cor de texto e fontes dos rótulos (`<label>`) diferem entre telas e ignoram as variáveis do Design System, gerando disparidades de tom em relação aos tokens globais de cores.
- O gerenciamento de estado dos formulários é mantido por múltiplos `useState` locais avulsos e validações imperativas complexas no código de visualização, incluindo o disparo indesejado de caixas de diálogo nativas do navegador (`alert()`).

### Decisão
Decidiu-se:
1. **Criar um Componente de Layout Semântico e Genérico**: Desenvolver a suíte de componentes globais `FormContainer`, `FormSection`, `FormField` e `FormActions` dentro da pasta de componentes comuns.
2. **Refatorar o Rótulo de Input**: Centralizar a renderização de rótulos através de `FormField` para garantir o uso estrito dos tokens de cores do Design System, eliminando cores estáticas injetadas hardcoded.
3. **Adotar React Hook Form + Zod**: Migrar as telas de formulários para utilizarem validações declarativas robustas via esquemas Zod integrados com o React Hook Form.

### Consequências

#### Consequências Positivas:
- **Redução Drástica de Código Duplicado**: Formulários tornam-se altamente legíveis e focados puramente na declaração de campos e bindings, eliminando centenas de linhas de código boilerplate para validação manual e hooks de estado.
- **Consistência Estrita e Alinhamento**: Qualquer alteração no Design System de paddings, sombras ou tamanhos de texto de inputs se reflete automaticamente em todas as telas de formulários simultaneamente.
- **Experiência de Usuário Aprimorada**: Mensagens de erro com transições fluidas integradas abaixo de cada campo e foco automático no primeiro erro, melhorando a acessibilidade para leitores de tela e usuários de navegação por teclado.

#### Consequências Negativas:
- Curva de aprendizado curta para novos desenvolvedores entenderem o ecossistema do React Hook Form + Zod e a amarração aos componentes globais.
