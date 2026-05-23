import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Client } from '@/interfaces/client.interface';
import { FormContainer } from '@/components/forms/FormContainer';
import { FormSection } from '@/components/forms/FormSection';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/forms/Input';
import { Select } from '@/components/forms/Select';
import { FormActions } from '@/components/forms/FormActions';

interface ClientFormProps {
  initialData?: Client | null;
  onSubmit: (data: Client) => Promise<void>;
  isLoading: boolean;
  onCancel: () => void;
  errorMessage: string | null;
}

// Funções de máscara e utilitários de limpeza
const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  }
  return digits
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);
};

const cleanDigits = (value?: string | null): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits === '' ? null : digits;
};

// Esquema de Validação Zod
const clientSchema = z.object({
  full_name: z.string().min(3, 'Nome Completo deve conter pelo menos 3 caracteres'),
  email: z.string()
    .email('Formato de e-mail inválido')
    .nullable()
    .or(z.literal('')),
  phone: z.string().nullable().or(z.literal('')),
  birth_date: z.string().nullable().or(z.literal('')),
  cpf: z.string()
    .refine((val) => {
      if (!val) return true;
      const digits = val.replace(/\D/g, '');
      return digits.length === 0 || digits.length === 11;
    }, 'CPF deve conter exatamente 11 dígitos')
    .nullable()
    .or(z.literal('')),
  rg: z.string().nullable().or(z.literal('')),
  cnh: z.string().nullable().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      birth_date: '',
      cpf: '',
      rg: '',
      cnh: '',
      status: 'ACTIVE',
    },
  });

  // Sync data from initialData when editing
  useEffect(() => {
    if (initialData) {
      reset({
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone ? formatPhone(initialData.phone) : '',
        birth_date: initialData.birth_date ? initialData.birth_date.substring(0, 10) : '',
        cpf: initialData.cpf ? formatCPF(initialData.cpf) : '',
        rg: initialData.rg || '',
        cnh: initialData.cnh || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      reset({
        full_name: '',
        email: '',
        phone: '',
        birth_date: '',
        cpf: '',
        rg: '',
        cnh: '',
        status: 'ACTIVE',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (values: ClientFormValues) => {
    const payload: Client = {
      full_name: values.full_name.trim(),
      email: values.email?.trim() === '' ? null : values.email?.trim(),
      phone: cleanDigits(values.phone),
      birth_date: values.birth_date === '' ? null : values.birth_date,
      cpf: cleanDigits(values.cpf),
      rg: values.rg?.trim() === '' ? null : values.rg?.trim(),
      cnh: values.cnh?.trim() === '' ? null : values.cnh?.trim(),
      status: initialData ? values.status : 'ACTIVE',
    };

    await onSubmit(payload);
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'SUSPENDED', label: 'Suspenso' },
  ];

  return (
    <FormContainer onSubmit={handleSubmit(handleFormSubmit)} errorMessage={errorMessage}>
      <FormSection title="Informações Gerais" columns={2}>
        <div className="md:col-span-2">
          <FormField label="Nome Completo" id="full-name" required error={errors.full_name?.message}>
            <Input
              id="full-name"
              type="text"
              placeholder="Ex: João da Silva"
              disabled={isLoading}
              {...register('full_name')}
            />
          </FormField>
        </div>

        <FormField label="E-mail" id="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="Ex: joao@email.com"
            disabled={isLoading}
            {...register('email')}
          />
        </FormField>

        <FormField label="Telefone" id="phone" error={errors.phone?.message}>
          <Input
            id="phone"
            type="text"
            placeholder="Ex: (11) 98888-7777"
            disabled={isLoading}
            {...register('phone')}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              setValue('phone', formatted, { shouldValidate: true });
            }}
          />
        </FormField>

        <FormField label="Data de Nascimento" id="birth-date" error={errors.birth_date?.message}>
          <Input
            id="birth-date"
            type="date"
            disabled={isLoading}
            {...register('birth_date')}
          />
        </FormField>

        <FormField label="CPF" id="cpf" error={errors.cpf?.message}>
          <Input
            id="cpf"
            type="text"
            placeholder="Ex: 000.000.000-00"
            disabled={isLoading}
            {...register('cpf')}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value);
              setValue('cpf', formatted, { shouldValidate: true });
            }}
          />
        </FormField>

        <FormField label="RG" id="rg" error={errors.rg?.message}>
          <Input
            id="rg"
            type="text"
            placeholder="Ex: 12.345.678-9"
            disabled={isLoading}
            {...register('rg')}
          />
        </FormField>

        <FormField label="CNH" id="cnh" error={errors.cnh?.message}>
          <Input
            id="cnh"
            type="text"
            placeholder="Ex: 12345678900"
            disabled={isLoading}
            {...register('cnh')}
          />
        </FormField>

        {initialData && (
          <FormField label="Status" id="status" required error={errors.status?.message}>
            <Select
              id="status"
              options={statusOptions}
              disabled={isLoading}
              {...register('status')}
            />
          </FormField>
        )}
      </FormSection>

      <FormActions
        isLoading={isLoading}
        onCancel={onCancel}
        cancelText="Cancelar"
        submitText="Salvar"
      />
    </FormContainer>
  );
};
