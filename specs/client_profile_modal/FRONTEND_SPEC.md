# Frontend Spec: Client Profile Modal in Process Details

## Componentes

### 1. `ClientDetailModal` (Novo Componente)
- **Localização**: `app/src/features/clients/components/ClientDetailModal.tsx`
- **Props**:
  - `clientId`: `string`
  - `isOpen`: `boolean`
  - `onClose`: `() => void`
- **Comportamento**:
  - No `useEffect`, ao abrir a modal e com base no `clientId`, chama o hook `useClients` (`fetchClientByID`) para buscar os detalhes completos do cliente.
  - Exibe um skeleton ou spinner de carregamento enquanto busca os dados.
  - Exibe os dados cadastrais em seções limpas.
  - Ao lado de Email, Data de Nascimento, CPF, RG e CNH, exibe o botão de copiar com feedback visual temporário (ex: "Copiado!" ou ícone de check com cor verde que volta ao normal após 1.5s).

### 2. `ProcessDetailPage` (Modificação)
- **Localização**: `app/src/features/processes/pages/ProcessDetailPage.tsx`
- **Modificações**:
  - Adicionar estado `activeClientId` para controlar qual perfil de cliente está sendo visualizado na modal (iniciando em `null`).
  - Atualizar o botão "Ver Perfil do Cliente" para definir o `activeClientId` do cliente clicado, em vez de fazer redirect de página.
  - Renderizar o componente `<ClientDetailModal clientId={activeClientId} isOpen={!!activeClientId} onClose={() => setActiveClientId(null)} />` no final da página.

## Interface e Design
- **Fidelidade Visual**: Modal centralizada com overlay semi-transparente e desfoque (`backdrop-blur-sm`).
- **Animações**: Transições suaves para aparecer e sumir (`animate-fade-in` e `animate-scale-in`).
- **Acessibilidade**: Foco inicial na modal ao abrir, fechamento via tecla `Esc` e clique no overlay.
