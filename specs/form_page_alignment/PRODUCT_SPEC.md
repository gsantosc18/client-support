# Product Specification — Alinhamento Visual e Comportamental de Formulários

Define os requisitos de produto, regras de negócio e critérios de aceitação para a padronização dos formulários de cadastro, edição e autenticação do sistema.

---

## 1. Objetivos

- **Consistência Visual**: Garantir que todos os formulários do sistema sigam exatamente a mesma linguagem de design, espaçamentos, tipografia, bordas e sombras.
- **Melhoria da Experiência do Usuário (UX)**: Substituir validações intrusivas do navegador (como `alert()`) por alertas visuais em tempo real, fornecendo feedbacks imediatos e claros.
- **Acessibilidade (WCAG AA)**: Assegurar que labels estejam sempre associados aos respectivos controles de entrada via atributo `htmlFor` e que erros de digitação sejam anunciados corretamente.
- **Prevenção de Erros de Submissão**: Desabilitar todas as entradas e botões durante a submissão para evitar disparos duplicados ou alterações concorrentes.

---

## 2. Requisitos Funcionais

- **RF-001**: O sistema deve possuir seções visuais agrupando campos afins (ex: "Dados Pessoais", "Contato").
- **RF-002**: Cada campo de formulário obrigatório deve apresentar uma indicação clara de obrigatoriedade (marcador asterisco vermelho `*`).
- **RF-003**: Ao submeter o formulário, caso ocorra algum erro de validação (ex: CPF incorreto ou e-mail inválido), a mensagem de erro detalhada deve ser exibida imediatamente sob o input problemático.
- **RF-004**: Durante a chamada de API para salvar as informações, todos os botões e campos de input do formulário devem ser desabilitados temporariamente e o botão primário deve mostrar um indicador visual de carregamento.
- **RF-005**: Em resoluções de desktop, o painel de ações deve dispor o botão de cancelamento à esquerda e o botão de salvamento à direita.

---

## 3. Regras de Negócio

- **RN-001**: Um formulário de cliente não pode ser submetido com um formato de CPF matematicamente inválido ou e-mail com estrutura incorreta.
- **RN-002**: Um formulário de processo não pode ser submetido sem que pelo menos um cliente ativo e um estabelecimento sejam associados a ele.
- **RN-003**: Validações de obrigatoriedade devem ser executadas no lado do cliente (frontend) antes do envio da requisição HTTP para o servidor.

---

## 4. Critérios de Aceitação

- **CA-001**: O formulário do cliente e de processos devem renderizar campos em formato responsivo de até 3 colunas em desktop e 1 coluna em mobile.
- **CA-002**: Nenhuma mensagem de validação de formulário deve utilizar pop-ups de sistema (`alert`).
- **CA-003**: O botão "Cancelar" deve fechar a tela ou redirecionar o usuário sem submeter os dados.
- **CA-004**: O design dos formulários deve possuir max-width moderado (máximo de `max-w-2xl` ou `max-w-4xl` dependendo da densidade), centralizado horizontalmente na tela.
