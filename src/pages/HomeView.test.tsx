import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HomeView from './HomeView';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ThreeScene to avoid GL context issues in tests
vi.mock('../components/ThreeScene', () => ({
  default: () => <div data-testid="three-scene" />
}));

describe('HomeView Component', () => {
  it('renders hero title and subtitle', () => {
    render(
      <MemoryRouter>
        <HomeView />
      </MemoryRouter>
    );
    expect(screen.getByText(/Democracy,/i)).toBeInTheDocument();
    expect(screen.getByText(/Master the election process/i)).toBeInTheDocument();
  });

  it('navigates to timeline on button click', () => {
    render(
      <MemoryRouter>
        <HomeView />
      </MemoryRouter>
    );
    const startBtn = screen.getByRole('button', { name: /start your civic journey/i });
    fireEvent.click(startBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/timeline');
  });

  it('shows demo options when Watch Demo is clicked', () => {
    render(
      <MemoryRouter>
        <HomeView />
      </MemoryRouter>
    );
    const watchBtn = screen.getByRole('button', { name: /view demo options/i });
    fireEvent.click(watchBtn);
    
    expect(screen.getByText(/Demo by AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Step by step guide/i)).toBeInTheDocument();
  });

  it('hides demo options when close button is clicked', () => {
    render(
      <MemoryRouter>
        <HomeView />
      </MemoryRouter>
    );
    // Open demo options
    fireEvent.click(screen.getByRole('button', { name: /view demo options/i }));
    
    const closeBtn = screen.getByRole('button', { name: /close demo options/i });
    fireEvent.click(closeBtn);
    
    expect(screen.queryByText(/Demo by AI/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Watch Demo/i)).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(
      <MemoryRouter>
        <HomeView />
      </MemoryRouter>
    );
    expect(screen.getByText(/Process Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Explainer/i)).toBeInTheDocument();
    expect(screen.getByText(/Local Info/i)).toBeInTheDocument();
    expect(screen.getByText(/Gamified Learning/i)).toBeInTheDocument();
  });
});
