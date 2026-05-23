# Frontend Specification: Process Annotations

Este documento descreve as diretrizes de design, layout de componentes, experiência do usuário (UX) e comportamento reativo para a seção de Anotações no Frontend.

---

## 1. Posicionamento e Layout

A nova seção de **Anotações** deve ser anexada no final da aba de **Detalhes do Processo**, ocupando a largura total do grid da página.

```text
+-------------------------------------------------------------+
|  [Detalhes do Processo]                                     |
|  Status: Em Andamento     Protocolo: 12345                  |
|  ...                                                        |
+-------------------------------------------------------------+
|  [Clientes Vinculados]         [Responsável]                |
+-------------------------------------------------------------+
|                                                             |
|  ANOTAÇÕES DE ACOMPANHAMENTO                                 |
|                                                             |
|  +-------------------------------------------------------+  |
|  | Escreva uma nova anotação...                          |  |
|  | Visibilidade: [ Pública [v] ]          [ Adicionar ]  |  |
|  +-------------------------------------------------------+  |
|                                                             |
|  Anotações Anteriores:                                      |
|  +-------------------------------------------------------+  |
|  | Operador Silva - Há 2 min        [Pública] [Edit][Del]|  |
|  | "O cliente enviou o comprovante de endereço."         |  |
|  +-------------------------------------------------------+  |
|  | Operador Silva - 23/05/2026 10:00 [Privada]           |  |
|  | "Lembrete: Cobrar o cliente sobre a certidão na seg." |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

---

## 2. Componentização e Fluxo do Estado

A funcionalidade será dividida em três componentes sob `app/src/features/processes/components/`:

### 2.1. Container principal: `ProcessAnnotations.tsx`
* Responsável por gerenciar o fetch inicial e o cache através do hook `useProcessAnnotations`.
* Renderiza o formulário de criação e a lista ordenada de cards de anotação.

### 2.2. Formulário: `AnnotationForm.tsx`
* **Textarea**: Campo de digitação de texto com limite visual de caracteres (0/2000) e validação de campo vazio.
* **Select**: Dropdown estilizado para escolha da visibilidade:
  * "Pública" (`PUBLIC`) - Ícone de globo ou cadeado aberto.
  * "Privada" (`PRIVATE`) - Ícone de cadeado fechado.
* **Botão**: Botão com micro-animação (efeito hover e active) e estado de *loading* durante o envio.

### 2.3. Card de Anotação: `AnnotationCard.tsx`
* Exibe o nome do autor, o conteúdo da nota formatado com quebras de linha (`white-space: pre-wrap`), badge de visibilidade e o momento da criação.
* **Badges de Visibilidade (Meramente Classificativos)**:
  * **Pública**: Fundo azul suave com texto azul escuro (ex: HSL tailoredo).
  * **Privada**: Fundo roxo suave com texto roxo escuro (indicando anotação particular/confidencial).
  * *Observação*: Ambas as anotações são renderizadas na lista para todos os operadores ativos da mesma empresa que visitarem a tela.
* **Edição Inline**:
  * Ao clicar no botão de editar, o card se transforma em uma caixa de texto permitindo edição direta na lista.
* **Regra Dinâmica dos 15 Minutos**:
  * O componente deve conter uma lógica de temporizador interna (`useEffect` com `setInterval` de 30 segundos) que calcula continuamente se `created_at` tem menos de 15 minutos de diferença do horário atual.
  * Se o tempo ultrapassar os 15 minutos ou se o usuário logado não for o criador, os botões de "Editar" e "Excluir" desaparecem da tela instantaneamente, sem necessidade de reload da página.

---

## 3. Design System & Acessibilidade (Acessibilidade e Responsividade)

* **Cores e Contrastes**:
  * Seguir estritamente a paleta de cores premium do projeto (tons harmoniosos para dark e light mode).
  * Bordas suaves (`border-slate-200` ou similar), sombras discretas (`shadow-sm`) e fundos de inputs confortáveis.
* **Acessibilidade (ARIA)**:
  * Todos os botões interativos devem possuir tags `aria-label` descritivas (ex: `aria-label="Editar anotação"`, `aria-label="Excluir anotação permanente"`).
  * Suporte a navegação por teclado (`tabindex` nos inputs e botões).
* **Responsividade**:
  * Em dispositivos mobile, o formulário e os cards se ajustam para ocupar 100% da largura útil da tela, empilhando os botões de ação verticalmente se necessário, oferecendo uma experiência móvel fluida.
