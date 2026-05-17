import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Quiz from './Quiz';
import { generateQuiz } from '../services/gemini';
import { saveQuizScore, earnBadge } from '../services/userService';
import React from 'react';

// Mock dependencies
vi.mock('../services/gemini', () => ({
  generateQuiz: vi.fn(),
}));

vi.mock('../services/userService', () => ({
  saveQuizScore: vi.fn(),
  earnBadge: vi.fn(),
}));

const mockQuestions = [
  {
    question: "What is the minimum age to vote in India?",
    options: ["16", "18", "21", "25"],
    answer: "18"
  },
  {
    question: "Which body conducts elections in India?",
    options: ["Supreme Court", "Parliament", "Election Commission", "NITI Aayog"],
    answer: "Election Commission"
  }
];

describe('Quiz Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    vi.mocked(generateQuiz).mockReturnValue(new Promise(() => { })); // Never resolves
    render(<Quiz onClose={() => { }} />);
    expect(screen.getByText(/Analyzing recent learning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders questions after loading', async () => {
    vi.mocked(generateQuiz).mockResolvedValue(mockQuestions);
    render(<Quiz />);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[0].question)).toBeInTheDocument();
    });

    mockQuestions[0].options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('handles correct answer and moves to next question', async () => {
    vi.mocked(generateQuiz).mockResolvedValue(mockQuestions);
    render(<Quiz />);

    await waitFor(() => screen.getByText(mockQuestions[0].question));

    const correctOption = screen.getByText("18");
    fireEvent.click(correctOption);

    await waitFor(() => {
      expect(screen.getByText(mockQuestions[1].question)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays results at the end and saves score', async () => {
    vi.mocked(generateQuiz).mockResolvedValue([mockQuestions[0]]);
    render(<Quiz />);

    await waitFor(() => screen.getByText(mockQuestions[0].question));
    fireEvent.click(screen.getByText("18"));

    await waitFor(() => {
      expect(screen.getByText(/Quiz Complete/i)).toBeInTheDocument();
      expect(screen.getByText(/1 \/ 1/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(saveQuizScore).toHaveBeenCalledWith(1);
    expect(earnBadge).toHaveBeenCalledWith('quiz_master');
  });

  it('handles retry functionality', async () => {
    vi.mocked(generateQuiz).mockResolvedValue(mockQuestions);
    render(<Quiz />);

    await waitFor(() => screen.getByText(mockQuestions[0].question));

    // Complete quiz
    fireEvent.click(screen.getByText("18"));
    await waitFor(() => screen.getByText(mockQuestions[1].question), { timeout: 3000 });

    fireEvent.click(screen.getByText("Election Commission"));
    await waitFor(() => screen.getByText(/Quiz Complete/i), { timeout: 3000 });

    const retryBtn = screen.getByRole('button', { name: /try another/i });
    fireEvent.click(retryBtn);

    expect(generateQuiz).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Analyzing recent learning/i)).toBeInTheDocument();
  });

  it('handles failure state', async () => {
    vi.mocked(generateQuiz).mockResolvedValue([]);
    render(<Quiz />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to generate quiz/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
  });
});
