import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock Supabase
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    }
  }
}));

describe('App Component', () => {
  it('renders the brand title', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/CivicBrain.AI/i)).toBeDefined();
  });

  it('renders main navigation links', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Home/i)).toBeDefined();
    expect(screen.getByText(/Dashboard/i)).toBeDefined();
    expect(screen.getByText(/Process Guide/i)).toBeDefined();
    expect(screen.getByText(/AI Assistant/i)).toBeDefined();
  });
});
