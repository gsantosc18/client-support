# Frontend Specification: Client CRUD

Este documento especifica a interface com o usuário (UI/UX), navegação, responsividade, componentes e manipulação de estado do CRUD de Clientes no Next.js.

---

## 1. Visão Geral da Interface e UX

Toda a interface deve seguir as diretrizes do `AGENTS.md` e do `project-color-palette/SPEC.md` (se existir) visando uma estética premium, limpa e moderna, com paleta de cores elegantes (tons de ardósia, índigo/azul, cinza neutro escuro/claro), cantos arredondados suavizados, sombras delicadas, e transições de hover suaves.

---

## 2. Estrutura de Telas e Páginas

### 2.1. Tela de Listagem (`/clients`)
* **Layout**:
  * Cabeçalho superior: Título "Clientes", contador de totalizadores ("Exibindo X-Y de Z clientes") e botão premium "Adicionar Cliente" (com ícone de `+`).
  * Barra de Ferramentas:
    * Input de pesquisa robusto para buscar por Nome, E-mail ou CPF.
    * Select para filtrar por Status (Todos, Ativo, Inativo, Suspenso).
  * Tabela de Clientes:
    * Colunas: Nome, E-mail, Telefone, Status, Data de Criação, Última Atualização, Ações.
    * Ordenação: Clicar nos cabeçalhos das colunas altera a ordenação (ícones visuais `▲` e `▼` ou equivalentes modernos que alternam entre ascendente e descendente).
    * Status badges coloridos:
      * `ACTIVE`: Fundo verde claro, texto verde escuro (ex: Emerald-50/700).
      * `INACTIVE`: Fundo cinza claro, texto cinza escuro.
      * `SUSPENDED`: Fundo amarelo claro, texto amarelo escuro.
    * Ações rápidas na linha: Botões para visualizar detalhes (ícone de olho), editar (ícone de lápis) e remover (ícone de lixeira).
  * Paginação no rodapé:
    * Centralizada ou alinhada à direita.
    * Botões "Anterior" e "Próximo" desabilitados se estiver na primeira ou última página, respectivamente.
    * Ocultada automaticamente se a quantidade total de registros for menor ou igual a 10.

### 2.2. Tela de Detalhes (`/clients/[id]`)
* **Layout**:
  * Botão de voltar destacado no topo ("<- Voltar para Clientes").
  * Título com o nome completo do cliente e seu status badge no topo.
  * Botões de ação no topo direito: "Editar" (botão de destaque) e "Remover" (botão de perigo secundário).
  * Seção Principal em Cartões (Cards):
    * **Card 1: Informações Gerais**: Nome Completo, Data de Nascimento (formatada), Status.
    * **Card 2: Informações de Contato**: E-mail (clicável), Telefone (mascarado).
    * **Card 3: Documentação**: CPF (mascarado), RG, CNH.
    * **Card 4: Histórico**: Data de criação e última atualização com timestamps formatados de acordo com o timezone do usuário.

### 2.3. Telas de Criação (`/clients/new`) e Edição (`/clients/[id]/edit`)
* **Layout**:
  * Título limpo ("Novo Cliente" ou "Editar Cliente").
  * Formulário centralizado de largura máxima controlada.
  * Inputs organizados de forma semântica.
  * Botões no rodapé: "Cancelar" (estilo Outline/Neutro) e "Salvar" (estilo Solid/Primário).
* **Campos e Rótulos**:
  * Nome Completo (`*`)
  * E-mail
  * Telefone (com máscara de digitação em tempo real)
  * Data de Nascimento (Input tipo Date com calendário nativo)
  * CPF (com máscara de digitação em tempo real)
  * RG
  * CNH
  * Status (Select visível apenas na tela de Edição)
* **Validações e Feedbacks**:
  * Validação local em tempo real no submit (Nome obrigatório).
  * Exibição de borda vermelha e texto descritivo abaixo de campos inválidos.
  * Desativação temporária do botão "Salvar" durante a submissão para evitar cliques duplicados.
  * Exibição de Toasts globais (Sucesso/Erro) ao concluir a operação.

---

## 3. Máscaras de Entrada e Sanitização

* **CPF**: Máscara `999.999.999-99`.
* **Telefone**: Máscara `(99) 99999-9999` ou `(99) 9999-9999` dinamicamente ajustável dependendo do número de dígitos digitados.
* **Sanitização**: Ao submeter o formulário de criação/edição à API, o frontend deve limpar os caracteres especiais das máscaras (ex: `123.456.789-01` -> `12345678901`).

---

## 4. Modal de Confirmação de Deleção (`ClientDeleteModal`)

Para remover um cliente, exibe-se uma modal flutuante contendo:
1. Um título de alerta vermelho ("Excluir Cliente?").
2. Uma descrição clara contendo a mensagem de que a operação é irreversível e o cliente será desativado.
3. Um texto instrutivo: "Para confirmar a exclusão, digite **delete** no campo abaixo:".
4. Um input de texto focado por padrão.
5. Botão "Cancelar" (fecha a modal).
6. Botão "Remover" (estilo vermelho de perigo, desabilitado por padrão e **só habilitado se o texto digitado for exatamente `"delete"`**).
7. Se a API retornar erro de que o cliente possui processos, o toast de erro deve exibir a mensagem: `"O cliente está vinculado a um processo e não pode ser removido."`.
