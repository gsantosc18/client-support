import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state and is disabled', () => {
    const { container } = render(<Button isLoading>Submit</Button>);
    expect(screen.getByText('Submit')).toBeInTheDocument();
    // Verifica a presenca da classe animate-spin de acordo com o componente original (lucide-react Loader2)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-background-muted');
  });
});
