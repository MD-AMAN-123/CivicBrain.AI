import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Assistant from './Assistant';
import { MemoryRouter } from 'react-router-dom';
import { explainConcept } from '../services/gemini';
import { CreateMLCEngine } from "@mlc-ai/web-llm";
import React from 'react';

// Mock dependencies
vi.mock('../services/gemini', () => ({
  explainConcept: vi.fn(),
}));

vi.mock("@mlc-ai/web-llm", () => ({
  CreateMLCEngine: vi.fn(),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('Assistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial greeting', () => {
    render(
      <MemoryRouter>
        <Assistant />
      </MemoryRouter>
    );
    expect(screen.getByText(/Hello! I'm Aura AI/i)).toBeInTheDocument();
  });

  it('handles sending a message via cloud (Gemini)', async () => {
    vi.mocked(explainConcept).mockImplementation(async ({ onStream }) => {
      onStream("The election process in India is...");
      return Promise.resolve();
    });

    render(
      <MemoryRouter>
        <Assistant />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/chat input/i);
    fireEvent.change(input, { target: { value: 'How do I vote?' } });
    fireEvent.click(screen.getByLabelText(/send message/i));

    expect(screen.getByText('How do I vote?')).toBeInTheDocument();
    
    const reply = await screen.findByText(/The election process in India is/i, {}, { timeout: 5000 });
    expect(reply).toBeInTheDocument();
  });

  it('toggles local mode and initializes engine', async () => {
    // Mock GPU support
    Object.defineProperty(navigator, 'gpu', {
      value: {},
      configurable: true
    });

    const mockEngine = {
      chat: {
        completions: {
          create: vi.fn()
        }
      }
    };
    vi.mocked(CreateMLCEngine).mockResolvedValue(mockEngine as unknown as MLCEngine);

    render(
      <MemoryRouter>
        <Assistant />
      </MemoryRouter>
    );

    const toggle = screen.getByLabelText(/toggle local ai offline mode/i);
    fireEvent.click(toggle);

    const initializingMsg = await screen.findByText(/Waking up Aura AI/i, {}, { timeout: 5000 });
    expect(initializingMsg).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/Waking up Aura AI/i)).not.toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('handles quick topic clicks', async () => {
    render(
      <MemoryRouter>
        <Assistant />
      </MemoryRouter>
    );

    const evmBtn = screen.getByText(/Explain EVM/i);
    fireEvent.click(evmBtn);

    const message = await screen.findByText('Explain EVM', {}, { timeout: 5000 });
    expect(message).toBeInTheDocument();
  });

  it('shows error when offline and engine not ready', async () => {
    // Mock offline BEFORE render
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true
    });

    render(
      <MemoryRouter>
        <Assistant />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/chat input/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByLabelText(/send message/i));

    const errorMsg = await screen.findByText(/I'm currently offline/i, {}, { timeout: 5000 });
    expect(errorMsg).toBeInTheDocument();
  });
});
