import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormContainer } from './FormContainer';

describe('FormContainer Component', () => {
  it('renders children correctly', () => {
    render(
      <FormContainer>
        <button type="submit">Submit</button>
      </FormContainer>
    );
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('renders global error message banner when provided', () => {
    render(
      <FormContainer errorMessage="Erro crítico ao processar o formulário">
        <input type="text" />
      </FormContainer>
    );
    expect(screen.getByText('Erro crítico ao processar o formulário')).toBeInTheDocument();
  });
});
