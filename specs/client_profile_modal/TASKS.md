# Tasks: Client Profile Modal in Process Details

## Frontend
- [ ] Criar o componente `ClientDetailModal` em `app/src/features/clients/components/ClientDetailModal.tsx`.
  - Exibir dados como nome, email, telefone, data de nascimento e documentos.
  - Implementar botão de cópia ao lado dos documentos (CPF, RG, CNH) e também do email e da data de nascimento.
  - Implementar feedback visual de cópia bem sucedida ("Copiado!" por 1.5s).
- [ ] Modificar `ProcessDetailPage.tsx` em `app/src/features/processes/pages/ProcessDetailPage.tsx` para importar e renderizar a modal.
  - Adicionar controle de estado `activeClientId` para gerenciar a abertura e fechamento da modal.
  - Substituir o clique do botão "Ver Perfil do Cliente" para abrir a modal em vez de navegar.

## QA / Testes
- [ ] Desenvolver teste E2E com Cypress em `cypress/e2e/app/` para validar a abertura da modal a partir da página de detalhes do processo, a exibição das informações do cliente e o funcionamento dos botões de copiar.
