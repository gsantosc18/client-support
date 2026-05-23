# Documentação dos Componentes Universais de Formulário

Este guia documenta o conjunto de componentes estruturais e inputs genéricos adicionados ao diretório `app/src/components/forms/`. Eles servem como os blocos fundamentais para qualquer formulário do sistema, garantindo consistência visual estrita ao Design System, acessibilidade (WCAG AA) e redução de código duplicado.

---

## 1. Componentes de Layout Estrutural

### A. `FormContainer`
Componente semântico que envolve o formulário principal, centralizando paddings, sombras e bordas padrões, além de gerenciar a exibição de erros gerais do servidor.

#### API / Propriedades
```typescript
interface FormContainerProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errorMessage?: string | null; // Erro global retornado pelo servidor
}
```

#### Exemplo de Uso
```tsx
import { FormContainer } from '@/components/forms/FormContainer';

<FormContainer onSubmit={handleSubmit} errorMessage={apiError}>
  {/* Conteúdo do formulário */}
</FormContainer>
```

---

### B. `FormSection`
Componente `<fieldset>` que agrupa logicamente blocos de campos afins. Padroniza o título da seção, descrição auxiliar e organiza automaticamente os campos em colunas flexíveis e responsivas.

#### API / Propriedades
```typescript
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3; // Grid responsivo (Mobile: 1 col, Desktop: 1 a 3 cols)
}
```

#### Exemplo de Uso
```tsx
import { FormSection } from '@/components/forms/FormSection';

<FormSection title="Informações Gerais" description="Dados básicos do cliente" columns={2}>
  <input name="primeiro_nome" />
  <input name="sobrenome" />
</FormSection>
```

---

### C. `FormField`
Componente responsável por encapsular cada controle individual de entrada. Renderiza o rótulo de forma acessível utilizando a relação lógica `htmlFor` $\rightarrow$ `id`, marca o campo obrigatório com o asterisco vermelho semântico (`*`) e projeta transições fluidas para exibição das mensagens de validação locais.

#### API / Propriedades
```typescript
interface FormFieldProps {
  label: string;
  id: string; // Deve coincidir com o id do input interno
  error?: string; // Mensagem de erro de validação (ex: Zod)
  required?: boolean;
  children: React.ReactNode;
}
```

#### Exemplo de Uso
```tsx
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';

<FormField label="E-mail" id="email-field" required error={errors.email?.message}>
  <Input id="email-field" type="email" {...register('email')} />
</FormField>
```

---

### D. `FormActions`
Painel inferior padrão para agrupar as ações de submissão do formulário. Força o botão de cancelamento à esquerda e salvamento à direita em resoluções desktop, alinhando com as diretrizes e gerenciando o estado de desabilitação e loading.

#### API / Propriedades
```typescript
interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  cancelText?: string; // Padrão: "Cancelar"
  submitText?: string; // Padrão: "Salvar"
}
```

#### Exemplo de Uso
```tsx
import { FormActions } from '@/components/forms/FormActions';

<FormActions
  isLoading={isLoading}
  onCancel={handleCancel}
  cancelText="Voltar"
  submitText="Salvar Registro"
/>
```

---

## 2. Componentes de Entrada Semânticos

### A. `Select`
Dropdown de seleção nativo e unificado, aplicando estilos consistentes aos inputs textuais convencionais, incluindo tratamento de focos acessíveis e anéis cromáticos de erro.

#### API / Propriedades
```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
}
```

#### Exemplo de Uso
```tsx
import { Select } from '@/components/forms/Select';

<Select
  options={[
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' }
  ]}
  {...register('status')}
/>
```

---

### B. `Textarea`
Área de texto com redimensionamento bloqueado (`resize-none`), preenchimento confortável e bordas compatíveis ao Design System.

#### API / Propriedades
```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}
```

#### Exemplo de Uso
```tsx
import { Textarea } from '@/components/forms/Textarea';

<Textarea
  rows={4}
  placeholder="Insira anotações..."
  {...register('observation')}
/>
```
