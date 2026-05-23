import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormActions } from './FormActions';

describe('FormActions Component', () => {
  it('renders buttons correctly and calls onCancel handler', () => {
    const handleCancel = jest.fn();
    render(
      <FormActions isLoading={false} onCancel={handleCancel} cancelText="Voltar" submitText="Gravar" />
    );

    const cancelButton = screen.getByRole('button', { name: /voltar/i });
    const submitButton = screen.getByRole('button', { name: /gravar/i });

    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(cancelButton);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('displays loading state and disables both buttons', () => {
    render(
      <FormActions isLoading={true} onCancel={jest.fn()} />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    const submitButton = screen.getByRole('button', { name: /salvar/i });

    expect(cancelButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
