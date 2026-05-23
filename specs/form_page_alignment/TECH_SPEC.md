# Technical Specification — Alinhamento de Páginas de Formulário

Descreve as especificações de componentes, estilizações globais, estruturas de propriedades e integração com bibliotecas de formulário no frontend.

---

## 1. Arquitetura de Componentes Estruturais (Prop Contracts)

Os novos componentes globais criados em `app/src/components/forms/` deverão possuir as seguintes assinaturas e contratos TypeScript:

### A. `FormContainer.tsx`
```tsx
interface FormContainerProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errorMessage?: string | null;
}
```
- **Estilização Base**: `space-y-6 bg-background-surface p-8 rounded-xl border border-border-default shadow-sm w-full`

### B. `FormSection.tsx`
```tsx
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}
```
- **Estilização Base**: `<fieldset>` contendo título `h3` com estilo `text-sm font-bold text-text-secondary border-b border-border-default pb-2 mb-4`.
- O container dos filhos (`children`) deve aplicar dinamicamente:
  - `columns === 1`: `grid grid-cols-1 gap-6`
  - `columns === 2`: `grid grid-cols-1 md:grid-cols-2 gap-6`
  - `columns === 3`: `grid grid-cols-1 md:grid-cols-3 gap-6`

### C. `FormField.tsx`
```tsx
interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```
- **Estilização Base**: Renderiza a tag `<label htmlFor={id} className="block text-sm font-semibold text-text-secondary mb-1.5">`.
- Renderiza o asterisco vermelho `<span className="text-destructive font-bold">*</span>` se `required` for verdadeiro.
- Injeta dinamicamente a mensagem de erro abaixo do input: `<span className="text-xs text-destructive mt-1.5 block font-medium animate-in fade-in duration-100">`.

### D. `FormActions.tsx`
```tsx
interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  cancelText?: string;
  submitText?: string;
}
```
- **Estilização Base**: Container `flex justify-end gap-3 pt-4 border-t border-border-default mt-6`.
- Renderiza o botão "Cancelar" com variante `outline` e botão "Salvar" com variante `primary` e prop `isLoading={isLoading}`.

---

## 2. Componentes de Inputs Semânticos

### A. `Select.tsx`
```tsx
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: boolean;
}
```
- **Estilização Base**: `w-full rounded-lg border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus-visible:border-action-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all cursor-pointer`

### B. `Textarea.tsx`
```tsx
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}
```
- **Estilização Base**: Mesmos estilos de borda e focus do Select, acrescido de `resize-none` e padding vertical confortável.

---

## 3. Padrão de Integração: React Hook Form + Zod

Os formulários refatorados devem instanciar o hook `useForm` associado a um resolver do Zod:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  fullName: z.string().min(3, 'Nome deve conter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido').nullable().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { ... }
});
```
