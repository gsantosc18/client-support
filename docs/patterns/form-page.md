# Padrão Oficial — Página de Formulário

Este documento define o padrão obrigatório para páginas de formulário do sistema.

Todas as telas de:
- criação
- edição
- cadastro
- atualização
- configuração

DEVEM seguir esta estrutura.

---

## Objetivo

Garantir:
- consistência visual
- previsibilidade
- acessibilidade
- reutilização
- melhor geração automática por IA

---

## Estrutura Obrigatória

Toda Página de Formulário deve conter:
1. Cabeçalho da página (PageHeader)
2. Área principal do formulário (FormContainer)
3. Agrupamento lógico dos campos (FormSection)
4. Área de ações fixas (FormActions)
5. Estados de loading e erro

---

## Anatomia da Página

┌─────────────────────────────┐
│ Breadcrumb opcional         │
├─────────────────────────────┤
│ Título da Página            │
├─────────────────────────────┤
│ Card/Formulário Principal   │
│                             │
│ Seção de Campos             │
│ Seção de Campos             │
│ Seção de Campos             │
│                             │
├─────────────────────────────┤
│ Cancelar | Salvar           │
└─────────────────────────────┘

---

## Regras do Cabeçalho

O topo da página deve conter:
- título claro
- espaçamento consistente
- alinhamento vertical

Exemplos:
- Novo Cliente
- Editar Processo

---

## Regras do Container Principal

O formulário deve:
- utilizar largura controlada
- possuir superfície destacada
- utilizar padding interno consistente
- possuir separação visual entre seções

Recomendado:
- max-width moderado
- centralização horizontal
- card com borda suave

---

## Organização dos Campos

Campos DEVEM ser agrupados semanticamente em seções lógicas.

Exemplo:

### Dados Pessoais
- Nome
- CPF
- Data de nascimento

### Contato
- Telefone
- E-mail

### Endereço
- Cidade
- Estado
- CEP

---

## Regras dos Inputs

Todos os inputs devem:
- possuir label
- possuir placeholder opcional
- possuir mensagem de erro
- possuir estado disabled
- possuir estado loading
- possuir focus acessível

Nunca:
- utilizar apenas placeholder sem label
- utilizar campos sem feedback visual
- utilizar campos desalinhados

---

## Grid de Campos

Desktop:
- máximo de 3 colunas para formulários comuns
- evitar excesso de colunas

Mobile:
- sempre coluna única

Nunca:
- utilizar grids densos
- compactar excessivamente os campos

---

## Regras de Botões

Toda Página de Formulário deve possuir:

### Ação Primária
- salvar
- atualizar

### Ação Secundária
- cancelar
- voltar

---

## Ordem dos Botões

Desktop:
- `[Cancelar] [Salvar]` (Ação secundária/descartável à esquerda e ação primária/salvamento à direita)

Mobile:
- botões empilhados ou largura total

---

## Regras de Salvamento

Durante submissão:
- desabilitar botão principal
- exibir loading
- evitar múltiplos submits

Exemplo:
- Salvando...
- Criando cliente...
- Atualizando processo...

---

## Validação

Toda validação deve:
- ocorrer visualmente
- indicar campo inválido
- possuir mensagem clara
- evitar mensagens genéricas

Exemplo correto:
- CPF inválido
- E-mail obrigatório

Exemplo incorreto:
- Campo inválido

---

## Estados Obrigatórios

A página deve possuir:

### Loading State
Skeleton ou loading visual.

### Error State
Mensagem clara de erro.

### Success Feedback
Toast ou feedback visual.

### Disabled State
Campos bloqueados quando necessário.

---

## Responsividade

Mobile:
- coluna única
- botões em largura total
- espaçamento confortável

Desktop:
- agrupamentos horizontais moderados
- leitura facilitada

---

## Acessibilidade

Todos os formulários DEVEM:
- seguir WCAG AA
- possuir labels acessíveis
- possuir navegação por teclado
- possuir focus-visible
- possuir contraste adequado

---

## Restrições Obrigatórias

Nunca:
- colocar botões no topo do formulário
- utilizar mais de um CTA primário
- criar formulários excessivamente largos
- misturar múltiplos padrões de campos
- utilizar placeholders como labels
- criar validações invisíveis

---

## Estrutura Recomendada React

```tsx
import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FormContainer } from '@/components/forms/FormContainer';
import { FormSection } from '@/components/forms/FormSection';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { FormActions } from '@/components/forms/FormActions';

export const ExampleFormPage: React.FC = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de submissão
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Novo Cliente" 
        description="Preencha as informações do cliente para cadastrá-lo." 
      />

      <FormContainer onSubmit={handleSubmit}>
        <FormSection title="Dados Pessoais">
          <FormField label="Nome Completo" id="full-name" required>
            <Input id="full-name" placeholder="Ex: João da Silva" required />
          </FormField>
        </FormSection>

        <FormActions 
          isLoading={false} 
          onCancel={() => {}} 
          cancelText="Cancelar"
          submitText="Salvar"
        />
      </FormContainer>
    </PageLayout>
  );
};
```

---

## Componentes Esperados

A implementação deve reutilizar:
- PageHeader
- FormContainer
- FormSection
- FormField
- Input
- Select
- Textarea
- Checkbox
- RadioGroup
- FormActions

---

## Bibliotecas Oficiais

Formulários devem utilizar:
- React Hook Form
- Zod
- shadcn/ui

---

## Objetivo Final

Todas as páginas de formulário do sistema devem:
- parecer parte do mesmo produto
- possuir comportamento previsível
- manter consistência visual
- reduzir improvisação da IA
- facilitar manutenção futura
- melhorar experiência do usuário
