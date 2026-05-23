import React from 'react';
import { Button } from './Button';

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  cancelText?: string;
  submitText?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  isLoading,
  onCancel,
  cancelText = 'Cancelar',
  submitText = 'Salvar',
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border-default mt-6 w-full">
      <Button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        variant="outline"
        className="w-full sm:w-auto font-semibold"
      >
        {cancelText}
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        isLoading={isLoading}
        variant="primary"
        className="w-full sm:w-auto font-semibold"
      >
        {submitText}
      </Button>
    </div>
  );
};
