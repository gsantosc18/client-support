# Frontend Specification: Client Delete

Este documento especifica os componentes visuais, comportamento da interface, estados da UI e tratamentos de erro no frontend para a feature de exclusão de clientes.

---

## 1. Visão Geral e Componentes Reutilizados

A funcionalidade reutiliza o componente `ClientDeleteModal` existente em `app/src/features/clients/components/ClientDeleteModal.tsx`.

No entanto, a modal atual e o fluxo precisam de pequenos ajustes funcionais e estéticos para se alinharem perfeitamente à nova especificação de **exclusão física e definitiva**:

### 1.1. Alterações no `ClientDeleteModal`
* **Texto de Confirmação**:
  * Atualizar o texto descritivo na modal para:
    > "Tem certeza de que deseja excluir o cliente **{clientName}**? Esta operação irá excluir permanentemente o cadastro de cliente do sistema e arquivar os dados históricos. Esta ação é irreversível."
  * Manter a validação que exige digitar a palavra `"delete"` para habilitar o botão "Remover".

---

## 2. Tratamento de Erros e Feedback Visual

* **Se a deleção falhar**:
  * A modal deve continuar aberta.
  * O erro retornado pela API (por exemplo, "O cliente está vinculado a um processo e não pode ser removido.") deve ser exibido no banner de erro vermelho dentro da modal:
    ```tsx
    {errorMessage && (
      <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm font-medium text-red-600 leading-snug">
        {errorMessage}
      </div>
    )}
    ```
* **Se a deleção for concluída com sucesso**:
  * Fechar a modal.
  * Atualizar a lista de clientes para remover o cliente deletado (por exemplo, invalidando a query do React Query no cache, forçando um refetch ou limpando o estado).
  * Exibir um Toast de sucesso premium no canto superior direito: `"Cliente excluído e arquivado com sucesso!"`.
