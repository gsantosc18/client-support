# Frontend Specification — Alinhamento da Página de Listagem

Este documento define especificamente os elementos de interface e componentes a serem alterados no frontend.

---

## 1. Mapeamento de Mudanças Visuais

### 1.1. Botão "Novo Registro"
* O texto do botão deve possuir o padrão `+ Novo + [Recurso]` (ex: `+ Novo Cliente` e `+ Novo Processo`).
* O sinal de `+` é um elemento gráfico do ícone SVG.
* Variante: `primary`.

### 1.2. Painel de Filtros e Busca (Modal)
* **Ativação:** Substituir os inputs e selects inline por um botão com ícone de funil.
* **Modal:** Ao clicar no botão, abre-se uma tela sobreposta (modal/diálogo).
* **Campos no Modal:**
  * Busca (campo texto)
  * Status (combobox)
* **Ações no Modal:**
  * Botão `"Aplicar Filtros"` (cor primária)
  * Botão `"Limpar Filtros"` (variante outline)

### 1.3. Área de Tags de Filtro
* Exibir logo acima da tabela uma lista de tags horizontais representando os filtros em vigor (ex: `"Status: Ativo"`, `"Busca: Gedalias"`).
* Cada tag deve possuir um botão `x` para ser removida individualmente.
* Deve haver um link/botão `"Limpar todos"` ao lado das tags para remover todas simultaneamente.

### 1.4. Tabela de Registros
* A ordenação de colunas com o ícone deve alternar puramente entre crescente (`asc`) e decrescente (`desc`).
* A coluna de Ações (última coluna da tabela) deve usar cores expressivas nos botões:
  * Visualização: Ícone de olho com cor azul (`text-info/80 hover:text-info hover:bg-info/10`).
  * Edição: Ícone de lápis com cor verde (`text-success/80 hover:text-success hover:bg-success/10`).
  * Exclusão: Ícone de lixeira com cor vermelha (`text-destructive/80 hover:text-destructive hover:bg-destructive/10`).

### 1.5. Linha Inferior de Paginação
* Canto esquerdo: `"Mostrando X–Y de Z registros"` (ex: `"Mostrando 1–10 de 120 clientes"`).
* Canto direito: Controles de navegação (Anterior / Próximo).
