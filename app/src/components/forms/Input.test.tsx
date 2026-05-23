import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="E-mail" placeholder="Enter email" />);
    expect(screen.getByText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders error message and applies error styles', () => {
    render(<Input label="Password" error="Invalid password" placeholder="Enter pass" />);
    expect(screen.getByText('Invalid password')).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText('Enter pass');
    expect(input.className).toContain('border-destructive');
  });
});
