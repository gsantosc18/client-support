# Product Spec: Client Profile Modal in Process Details (Modal de Perfil do Cliente)

## Objetivos da Feature
Permitir que usuários visualizem de forma rápida e contextualizada as informações de perfil de um cliente diretamente da página de detalhes de um processo, sem a necessidade de sair da página atual. A modal deve conter as informações cadastrais e de contato do cliente, além de oferecer botões de cópia rápida ao lado dos documentos para agilizar a rotina operacional do usuário.

## Requisitos Funcionais
1. **Botão de Visualização**: Substituir ou complementar a navegação no botão "Ver Perfil do Cliente" nos detalhes do processo para abrir uma modal interativa na mesma página.
2. **Exibição de Dados do Cliente**: Apresentar na modal as informações detalhadas do cliente selecionado: nome completo, email, telefone, data de nascimento e documentos.
3. **Cópia Rápida de Informações**: Adicionar um botão de cópia (clipboard copy) ao lado dos documentos cadastrados (CPF, RG, CNH), bem como do Email e da Data de Nascimento do cliente.
4. **Feedback Visual de Cópia**: Exibir uma indicação visual instantânea ("Copiado!") ao clicar no botão de cópia de qualquer campo.
5. **Ação de Fechar**: Permitir o fechamento da modal por botão de fechar (X), clicando fora da modal (backdrop) ou pressionando a tecla `Esc`.

## Regras de Negócio
1. **Acesso aos Dados**: As informações apresentadas na modal devem respeitar o escopo de permissões do usuário logado e a empresa (tenant) a qual ele pertence, garantindo privacidade e conformidade.
2. **Formatação de Documentos**: Os dados devem ser apresentados formatados, mas ao copiar, deve-se copiar o valor apropriado (no caso de e-mail e documentos, o valor textual limpo).

## Critérios de Aceite
1. Clicar no botão "Ver Perfil do Cliente" na página de detalhes de um processo abre a modal contendo o perfil do cliente sem recarregar a página.
2. A modal exibe: Nome Completo, Email, Telefone, Data de Nascimento, CPF, RG e CNH.
3. Ao lado dos campos Email, Data de Nascimento, CPF, RG e CNH, existe um botão de cópia.
4. Clicar no botão de cópia copia o respectivo valor para o clipboard do sistema operacional e exibe um feedback visual de "Copiado".
5. A modal é responsiva, possui design premium seguindo o padrão do sistema e pode ser fechada facilmente.
