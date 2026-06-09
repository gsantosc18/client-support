# Especificação de Produto: Nome da Empresa no Header Dinâmico

Este documento define os objetivos de negócios, requisitos funcionais e critérios de aceite para a exibição dinâmica do nome da empresa conectada no cabeçalho superior do site.

---

## 1. Objetivos

* **Customização Visual**: Substituir o nome estático "SuporteCliente" no cabeçalho pelo nome real da empresa cadastrada no banco de dados, oferecendo uma experiência personalizada baseada no tenant/empresa do usuário autenticado.
* **Eficiência e Performance**: Evitar chamadas excessivas ao banco de dados e à rede através de uma estratégia robusta de cache (tanto no frontend quanto no backend).
* **Consistência**: Garantir que a barra superior de navegação seja uniforme em todas as páginas e atualizada imediatamente após o carregamento das informações.

---

## 2. Requisitos Funcionais

* **RF-001**: O sistema deve buscar dinamicamente o nome da empresa associada ao operador atualmente autenticado através de uma chamada segura à API.
* **RF-002**: A primeira letra do nome da empresa deve ser utilizada no avatar circular (substituindo a letra estática "C" ou "P" do cabeçalho).
* **RF-003**: O nome da empresa deve ser exibido com animação de carregamento (skeleton ou pulse) enquanto a requisição backend estiver pendente.
* **RF-004**: O frontend deve ler as informações da empresa a partir do cache local (Redux ou Web Storage) para evitar requisições desnecessárias a cada troca de rota.
* **RF-005**: O backend deve responder de forma eficiente utilizando cache em memória/Redis para as requisições de consulta aos dados da empresa.

---

## 3. Regras de Negócio

* **RN-001**: As informações da empresa só podem ser consultadas por usuários autenticados.
* **RN-002**: O usuário só pode visualizar os dados da empresa à qual está vinculado (restrição por ID extraído do JWT de sessão).
* **RN-003**: Em caso de falha de comunicação ou erro no servidor, o sistema deve exibir "SuporteCliente" como fallback para garantir que a interface não quebre.

---

## 4. Critérios de Aceite

* **CA-001**: Ao fazer login, a barra superior exibe o nome real da empresa (ex: "Empresa de Demonstração").
* **CA-002**: A navegação entre páginas da aplicação (Clientes para Processos e vice-versa) não deve realizar chamadas adicionais à rota `/api/company`.
* **CA-003**: A atualização manual da página (F5/Reload) mantém o nome da empresa na barra de navegação sem flashes prolongados de carregamento, recuperando o valor do Web Storage.
* **CA-004**: Ao clicar em "Sair", o cache do frontend contendo o nome da empresa deve ser completamente limpo do estado do Redux e dos storages locais.
