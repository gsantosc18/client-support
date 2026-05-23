# Tasks — Alinhamento de Páginas de Formulário

Este documento detalha o checklist de tarefas a serem realizadas por cada agente no fluxo de trabalho de desenvolvimento para alinhar os formulários com o padrão oficial.

---

## 1. Agente: Desenvolvedor (Implementação)

### A. Componentes Genéricos Globais (`app/src/components/forms/`)
- [ ] Criar `FormContainer.tsx` padronizando classes de container, sombra, borda e exibição de erro global.
- [ ] Criar `FormSection.tsx` organizando agrupamento semântico, cabeçalhos de seção e grid adaptável de colunas (1 a 3 colunas).
- [ ] Criar `FormField.tsx` padronizando `<label>`, indicadores obrigatórios e exibição estilizada de erros locais.
- [ ] Criar `FormActions.tsx` gerenciando botões de ação e ordem de botões em desktop `[Cancelar] [Salvar]`.
- [ ] Criar dropdown semântico `Select.tsx` padronizado.
- [ ] Criar componente `Textarea.tsx` para áreas de texto amplas.
- [ ] Refatorar `Input.tsx` para adotar estritamente variáveis de cor e espaçamentos globais do tema.

### B. Formulário de Clientes (`app/src/features/clients/`)
- [ ] Criar esquema Zod para validação dos dados de cliente.
- [ ] Refatorar `ClientForm.tsx` migrando o gerenciamento de estados locais para o React Hook Form.
- [ ] Substituir inputs e botões inline pelos novos componentes globais estruturais.
- [ ] Integrar tratamento do estado `isLoading` nos inputs para desabilitar digitação no submit.

### C. Formulário de Processos (`app/src/features/processes/`)
- [ ] Criar esquema Zod para validação dos dados de processo.
- [ ] Refatorar `ProcessForm.tsx` migrando o gerenciamento de estados locais para o React Hook Form.
- [ ] Substituir o uso de alertas do navegador (`alert()`) por tratamento visual e mapeado de validação nos wrappers `FormField`.
- [ ] Migrar seletores customizados e modals de múltiplos clientes e estabelecimento para operarem em sintonia com o hook form.
- [ ] Substituir componentes de input/textarea locais pelos novos unificados.

### D. Tela de Login (`app/src/app/login/`)
- [ ] Ajustar layout do formulário em `page.tsx` para alinhar com os componentes novos, otimizando legibilidade e comportamento de erro.

---

## 2. Agente: QA (Garantia de Qualidade e Testes)

- [ ] Criar testes unitários para validar a renderização correta e propagação de propriedades nos componentes `FormContainer`, `FormSection`, `FormField` e `FormActions`.
- [ ] Atualizar ou criar testes Cypress E2E validando o fluxo de criação de clientes com campos válidos/inválidos e as respectivas mensagens de validação.
- [ ] Atualizar ou criar testes Cypress E2E para criação de processos, garantindo que o envio sem clientes ou estabelecimento exiba erros visuais em vez de disparar alertas nativos do navegador.
- [ ] Validar a responsividade dos formulários em dispositivos móveis (coluna única e botões largura total) e em telas desktop ultrawide.

---

## 3. Agente: Revisor (Garantia de Código)

- [ ] Verificar se os formulários estão usando estritamente as bibliotecas especificadas (`React Hook Form` e `Zod`).
- [ ] Confirmar se todas as cores estáticas hardcoded (ex: `text-slate-800`) foram eliminadas em prol das variáveis de tema semânticas (`text-text-primary`, etc.).
- [ ] Validar que nenhum formulário permite edição em inputs quando o estado `isLoading` for verdadeiro.

---

## 4. Agente: Documentador (Manutenção de Manuais)

- [ ] Atualizar os arquivos explicativos na pasta `docs/` detalhando as APIs dos novos componentes de formulários genéricos criados.
