# Product Specification: Client CRUD

Este documento especifica os objetivos funcionais, regras de negócio e critérios de aceite para a feature de CRUD de Clientes.

---

## 1. Objetivos da Feature

Permitir que as empresas gerenciem de forma eficiente o cadastro de seus clientes na plataforma de suporte ao cliente, oferecendo recursos completos de criação, visualização, edição, pesquisa, filtragem e exclusão lógica (desativação) de clientes de forma segura e responsiva.

---

## 2. Requisitos Funcionais

### 2.1. Listagem de Clientes
* **Acesso**: Exibida como página inicial da plataforma após o login do usuário.
* **Informações Exibidas**:
  * Nome Completo
  * E-mail
  * Telefone
  * Status (ACTIVE, INACTIVE, SUSPENDED)
  * Data de criação (Formatada em `DD/MM/AAAA HH:MM` baseado no timezone do usuário)
  * Última atualização (Formatada em `DD/MM/AAAA HH:MM` baseado no timezone do usuário)
  * Ações:
    * Botão de Visualizar Detalhes (ícone)
    * Botão de Editar Cliente (ícone)
    * Botão de Remover Cliente (ícone)
* **Paginação**:
  * Exibir 10 clientes por página.
  * Botões "Próxima página" e "Página anterior".
  * Exibição do status de carregamento: "Exibindo X-Y de Z clientes".
  * **Ocultação**: Se o total de registros (Z) for menor ou igual a 10, a paginação não deve ser renderizada.

### 2.2. Pesquisa de Clientes
* **Barra de Pesquisa**: Campo de busca textual em tempo real ou sob submissão.
* **Campos pesquisados**: Nome, E-mail, Telefone, Status, Data de criação, Data de atualização.

### 2.3. Ordenação de Clientes
* **Interação**: Ícones de ordenação ascendente e descendente no cabeçalho de todas as colunas da listagem.
* **Comportamento**:
  * 1º Clique: Ordenar em ordem ascendente.
  * 2º Clique: Ordenar em ordem descendente.
  * 3º Clique: Restaurar ordenação padrão (ou circular novamente para ascendente).

### 2.4. Filtros de Clientes
* **Componente de Filtros**: Localizado no topo da listagem de clientes.
* **Filtros disponíveis**:
  * Status (ACTIVE, INACTIVE, SUSPENDED)
  * Data de criação (intervalo ou data específica)
  * Data de atualização (intervalo ou data específica)

### 2.5. Botão de Adicionar Cliente
* **Posicionamento**: No topo da página de listagem de clientes.
* **Ação**: Redirecionar o usuário para a tela de criação de cliente.

### 2.6. Criação de Clientes
* **Formulário**: Apresentar campos de cadastro com base na definição de entidade do `DATABASE_SPEC.md`.
* **Marcação**: Todos os campos obrigatórios devem possuir um asterisco (`*`) ao lado do rótulo (label).
* **Campos Obrigatórios**: Nome Completo (`full_name`). Os demais campos de identificação (E-mail, CPF, RG, CNH, Data de Nascimento) são opcionais, mas devem ser únicos por empresa caso preenchidos.
* **Validações e Máscaras**:
  * Máscaras de entrada em tempo real para Telefone e CPF no frontend.
  * Envio de dados limpos (sem máscara) para a API no backend.
  * Validação no frontend e validação robusta no backend (com retorno apropriado de erros).
* **Tratamento de Datas**:
  * As datas de criação e atualização são gerenciadas pelo backend em UTC.
  * O frontend recebe as datas em UTC e aplica a conversão para o timezone local do usuário ao exibir.
* **Ações**:
  * Salvar: Envia os dados para a API e redireciona à listagem em caso de sucesso. Exibe mensagem amigável de erro se falhar.
  * Cancelar: Redireciona de volta à listagem de clientes.

### 2.7. Edição de Clientes
* **Formulário**: Mesma estrutura do formulário de criação, porém pré-carregado com os dados do cliente selecionado.
* **Campos Editáveis**: Todos exceto os metadados gerenciados internamente pelo backend (ID, CompanyID, CreatedAt, UpdatedAt).
* **Validações e Máscaras**: Seguem as mesmas regras da criação (incluindo validação de unicidade de documentos excluindo o próprio ID do cliente).

### 2.8. Detalhes de Clientes
* **Visualização**: Apresentar informações organizadas em cartões com excelente legibilidade e apelo estético premium.
* **Ações**:
  * Botão de Editar no topo.
  * Botão de Remover no topo.
  * Botão de Voltar para a listagem.

### 2.9. Remoção (Desativação) de Clientes
* **Confirmação**: Exibir uma modal de confirmação ao clicar em "Remover" (a partir da listagem ou da tela de detalhes).
* **Proteção contra Remoção Acidental**: O usuário deve obrigatoriamente digitar a palavra `"delete"` em um campo específico para habilitar o botão "Remover" na modal.
* **Regra de Vínculo**: Se o cliente estiver vinculado a algum processo aberto ou concluído, a exclusão/desativação deve ser abortada imediatamente. A API e a UI devem exibir a mensagem: `"O cliente está vinculado a um processo e não pode ser removido."`.
* **Tipo de Exclusão**: Conforme as políticas de conformidade e auditoria, a remoção é uma desativação lógica (Soft Delete), atualizando o status do cliente para `INACTIVE` no banco de dados.

---

## 3. Critérios de Aceite

1. **Paginação Inteligente**: Se houver menos de 10 clientes, a paginação não deve aparecer na tela.
2. **Máscaras Limpas**: Os dados de CPF e telefone devem ser salvos no banco de dados sem caracteres especiais (somente números).
3. **Bloqueio de Deleção**: Tentar remover um cliente com processos existentes deve falhar com a mensagem exata especificada.
4. **Timezones**: Datas salvas em UTC no banco de dados devem ser perfeitamente convertidas para o fuso horário local do navegador do usuário.
5. **Autenticação**: Nenhuma página do CRUD de clientes pode ser acessada sem um token JWT válido.
