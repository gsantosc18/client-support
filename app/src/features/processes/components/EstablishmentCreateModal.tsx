import React, { useState } from 'react';
import { useEstablishments } from '../hooks/useEstablishments';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';
import { Establishment } from '@/interfaces/establishment.interface';

interface EstablishmentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (est: Establishment) => void;
}

export const EstablishmentCreateModal: React.FC<EstablishmentCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createEstablishment, error, setError } = useEstablishments();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    if (!name.trim() || !address.trim() || !city.trim() || !state.trim()) {
      setError('Todos os campos são obrigatórios');
      setSubmitting(false);
      return;
    }

    const payload: Establishment = {
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
    };

    const est = await createEstablishment(payload);
    if (est) {
      onSuccess(est);
      onClose();
      // Reset form
      setName('');
      setAddress('');
      setCity('');
      setState('');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-primary/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-background-surface rounded-2xl shadow-xl border border-border-default overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-background-muted">
          <h3 className="text-base font-bold text-text-primary">Novo Estabelecimento</h3>
          <button
            onClick={onClose}
            type="button"
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Nome Fantasia / Razão Social *"
              id="est-name"
              placeholder="Ex: CRAS Centro"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Endereço Completo *"
              id="est-address"
              placeholder="Ex: Avenida Paulista, 1000 - Cj 12"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  label="Cidade *"
                  id="est-city"
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="Estado (UF) *"
                  id="est-state"
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-default mt-6">
            <Button
              type="button"
              onClick={onClose}
              disabled={submitting}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              isLoading={submitting}
              variant="primary"
            >
              Salvar Estabelecimento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
