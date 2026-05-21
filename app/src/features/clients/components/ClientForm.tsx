import React, { useState, useEffect } from 'react';
import { Client } from '@/interfaces/client.interface';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';

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

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  errorMessage,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [cnh, setCnh] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone ? formatPhone(initialData.phone) : '');
      
      // format birthdate from ISO/UTC format YYYY-MM-DDT... to YYYY-MM-DD for input date
      if (initialData.birth_date) {
        setBirthDate(initialData.birth_date.substring(0, 10));
      } else {
        setBirthDate('');
      }

      setCpf(initialData.cpf ? formatCPF(initialData.cpf) : '');
      setRg(initialData.rg || '');
      setCnh(initialData.cnh || '');
      setStatus(initialData.status || 'ACTIVE');
    }
  }, [initialData]);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const payload: Client = {
      full_name: fullName.trim(),
      email: email.trim() === '' ? null : email.trim(),
      phone: cleanDigits(phone),
      birth_date: birthDate === '' ? null : birthDate,
      cpf: cleanDigits(cpf),
      rg: rg.trim() === '' ? null : rg.trim(),
      cnh: cnh.trim() === '' ? null : cnh.trim(),
      status: initialData ? status : 'ACTIVE',
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-slate-100 shadow-md">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="full-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nome Completo <span className="text-red-500 font-bold">*</span>
          </label>
          <input
            id="full-name"
            type="text"
            required
            placeholder="Ex: João da Silva"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <Input
            label="E-mail"
            id="email"
            type="email"
            placeholder="Ex: joao@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Telefone
          </label>
          <input
            id="phone"
            type="text"
            placeholder="Ex: (11) 98888-7777"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label htmlFor="birth-date" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Data de Nascimento
          </label>
          <input
            id="birth-date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <label htmlFor="cpf" className="block text-sm font-semibold text-slate-700 mb-1.5">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            placeholder="Ex: 000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        <div>
          <Input
            label="RG"
            id="rg"
            type="text"
            placeholder="Ex: 12.345.678-9"
            value={rg}
            onChange={(e) => setRg(e.target.value)}
          />
        </div>

        <div>
          <Input
            label="CNH"
            id="cnh"
            type="text"
            placeholder="Ex: 12345678900"
            value={cnh}
            onChange={(e) => setCnh(e.target.value)}
          />
        </div>

        {initialData && (
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Status <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
              <option value="SUSPENDED">Suspenso</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Salvar
        </Button>
      </div>
    </form>
  );
};
