import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField Component', () => {
  it('renders label and handles htmlFor association correctly', () => {
    render(
      <FormField label="Sobrenome" id="sobrenome" required>
        <input id="sobrenome" type="text" />
      </FormField>
    );
    const label = screen.getByText(/sobrenome/i);
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'sobrenome');
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message when present', () => {
    render(
      <FormField label="Sobrenome" id="sobrenome" error="Sobrenome é obrigatório">
        <input id="sobrenome" type="text" />
      </FormField>
    );
    expect(screen.getByText('Sobrenome é obrigatório')).toBeInTheDocument();
  });
});
