### 1. Novo Componente: `ClientVaultSection.tsx`
- **Localização**: `app/src/features/clients/components/ClientVaultSection.tsx`
- **Função**: Exibir a listagem dos itens do cofre sob a forma de uma seção elegante de "Cofre de Credenciais".
- **Comportamento**:
  - Exibe um botão para "Adicionar Credencial".
  - Lista os itens cadastrados. Cada item possui:
    - Título da credencial.
    - Botão "Exibir" (ícone de olho) que aciona a chamada para o endpoint de detalhe/revelação para mostrar a senha em texto claro.
    - Botão "Ocultar" para voltar ao estado oculto/mascarado.
    - Botão "Copiar" (copia a senha para a área de transferência usando `navigator.clipboard.writeText`).
    - Botão "Editar" e "Excluir".

### 2. Novo Componente: `VaultItemModal.tsx`
- **Localização**: `app/src/features/clients/components/VaultItemModal.tsx`
- **Função**: Modal contendo formulário de criação/edição de item do cofre.
- **Campos**:
  - Título (Obrigatório)
  - Senha (Obrigatório)
  - Observações (Opcional, Textarea)

### 3. Integração na Página de Detalhe: `ClientDetailPage.tsx`
- Adicionar o componente `<ClientVaultSection clientId={client.id} />` na parte inferior da página, criando uma seção com design premium e limpo.

### 4. Custom Hook e Service:
- **Service**: `app/src/features/clients/services/vaultService.ts` contendo as chamadas HTTP via axios/fetch usando o token JWT para os endpoints de cofre.
- **Hook**: `app/src/features/clients/hooks/useClientVault.ts` gerenciando o estado local dos itens (listagem, loading, erros, criação, update, delete, reveal).
