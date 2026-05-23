# Product Specification: Process Annotations (Anotações de Acompanhamento do Processo)

Este documento especifica os objetivos funcionais, as regras de negócio e os critérios de aceite para a funcionalidade de anotações de acompanhamento em Processos.

---

## 1. Visão Geral e Objetivos

O principal objetivo desta funcionalidade é permitir que os operadores registrem anotações de acompanhamento (notas, ocorrências, lembretes) diretamente na aba/tela de detalhes de um Processo. Essas anotações auxiliam na comunicação interna e na manutenção do histórico de evolução do caso, com suporte a níveis de classificação de visibilidade pública e privada, além de uma política de segurança temporal para edição e remoção pelo criador da nota.

---

## 2. Requisitos Funcionais (RF)

### RF-001: Exibição de Anotações na Tela de Detalhes
* A tela de visualização de detalhes do processo deve conter uma nova seção dedicada a "Anotações" no rodapé da página.
* As anotações devem ser carregadas e exibidas em ordem cronológica reversa (da mais recente para a mais antiga).
* A listagem de anotações exibe todas as anotações registradas para o processo da mesma empresa, independentemente do tipo de visibilidade ("Pública" ou "Privada").

### RF-002: Criação de Anotações
* Qualquer usuário autenticado pertencente à mesma empresa (`company_id`) do processo deve poder registrar uma nova anotação.
* A criação de anotação exige o preenchimento de:
  * **Conteúdo** (Texto da anotação, campo obrigatório).
  * **Visibilidade** (Seleção obrigatória entre "Pública" ou "Privada").
* A anotação criada é associada de forma automática ao processo (`process_id`), à empresa (`company_id`) e ao usuário autor (`user_id`).

### RF-003: Edição de Anotação pelo Criador
* O criador de uma anotação deve ser capaz de editar o seu texto.
* O botão de "Editar" só deve ser exibido e estar ativo se:
  * O usuário autenticado for o criador original da anotação.
  * O tempo decorrido desde a criação da anotação for menor ou igual a 15 minutos.
* Após os 15 minutos, a anotação torna-se definitiva e o botão de edição deixa de ser exibido.

### RF-004: Remoção Física de Anotação pelo Criador
* O criador de uma anotação deve ser capaz de excluir permanentemente a nota.
* O botão de "Excluir" só deve ser exibido e estar ativo se:
  * O usuário autenticado for o criador original da anotação.
  * O tempo decorrido desde a criação da anotação for menor ou igual a 15 minutos.
* A remoção de uma anotação resulta na sua exclusão física definitiva no banco de dados (hard delete).

---

## 3. Regras de Negócio (RN)

### RN-001: Isolamento de Empresa (Multitenancy)
* Um usuário de uma determinada empresa (`company_id`) nunca poderá visualizar, criar ou modificar anotações vinculadas a processos de outras empresas.

### RN-002: Visibilidade de Anotações na Empresa
* **Visibilidade Unificada**:
  * Qualquer usuário ativo da mesma empresa que tenha acesso ao processo pode visualizar todas as anotações associadas a ele, independentemente do tipo de visibilidade.
  * O tipo de visibilidade ("Pública" vs. "Privada") atua como um marcador descritivo (badge) visual na interface para fins organizacionais (ex: para rotular anotações confidenciais ou informativas).

### RN-003: Janela Temporal Limitada (Regra dos 15 Minutos)
* Modificações e exclusões de anotações só são permitidas nos primeiros 15 minutos após o carimbo de data/hora de criação (`created_at`).
* Esta regra é validada tanto no cliente (interface do usuário) quanto de forma estrita no servidor (regra de negócios do backend).

### RN-004: Deleção Física (Hard Delete)
* Ao contrário do processo que utiliza soft delete histórico (`DeletedProcess`), a remoção de uma anotação realiza um `DELETE` físico na tabela de banco de dados, limpando permanentemente o registro.

### RN-005: Ausência de Notificações
* A criação, alteração ou exclusão de anotações não deve disparar nenhum tipo de e-mail, push notification ou sinal em tempo real nesta fase. O acompanhamento é estritamente assíncrono via carregamento da interface.

---

## 4. Critérios de Aceite (CA)

### CA-001: Visibilidade Compartilhada de Anotações Privadas
* **Dado** que o Usuário A e o Usuário B pertencem à mesma empresa e visualizam o mesmo Processo X;
* **Quando** o Usuário A cria uma anotação com visibilidade "Privada";
* **Então** tanto o Usuário A quanto o Usuário B enxergam essa anotação no rodapé de detalhes do processo, com o respectivo badge indicativo de "Privada".

### CA-002: Bloqueio Temporal de Edição/Deleção (Interface)
* **Dado** que o criador de uma anotação visualiza o card de sua nota;
* **Quando** o relógio do sistema indicar que se passaram 14 minutos e 59 segundos desde `created_at`;
* **Então** os botões de "Editar" e "Deletar" são exibidos no card da anotação.
* **Quando** o tempo atinge 15 minutos ou mais;
* **Então** os botões de "Editar" e "Deletar" desaparecem dinamicamente da interface para esse card.

### CA-003: Bloqueio Temporal no Backend (Segurança)
* **Dado** que um usuário mal-intencionado captura o `ID` de sua anotação e tenta enviar uma requisição `PUT` ou `DELETE` diretamente à API após 16 minutos da criação;
* **When** o servidor recebe a requisição;
* **Então** o servidor rejeita a transação retornando código `400 Bad Request` com uma mensagem clara sobre a expiração do limite de 15 minutos.
