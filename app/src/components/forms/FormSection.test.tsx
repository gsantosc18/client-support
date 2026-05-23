import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormSection } from './FormSection';

describe('FormSection Component', () => {
  it('renders section title and optional description', () => {
    render(
      <FormSection title="Dados Pessoais" description="Preencha suas informações">
        <input type="text" placeholder="Nome" />
      </FormSection>
    );
    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    expect(screen.getByText('Preencha suas informações')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
  });
});
