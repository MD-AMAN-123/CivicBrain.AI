import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { explainConcept, generateQuiz } from './gemini';

// Mock fetch
global.fetch = vi.fn();

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('explainConcept', () => {
    it('returns a reply on successful fetch', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ reply: 'This is a test explanation' })
      });

      const reply = await explainConcept({ topic: 'test', level: 'beginner' });
      expect(reply).toBe('This is a test explanation');
      expect(global.fetch).toHaveBeenCalledWith('/api/gemini', expect.anything());
    });

    it('handles server errors gracefully', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ reply: 'Server exploded' })
      });

      const reply = await explainConcept({ topic: 'test', level: 'beginner' });
      expect(reply).toContain('Server exploded');
    });

    it('handles fetch timeouts/aborts', async () => {
      (global.fetch as Mock).mockImplementation(() => {
        const err = new Error('AbortError');
        err.name = 'AbortError';
        throw err;
      });

      const reply = await explainConcept({ topic: 'test', level: 'beginner' });
      expect(reply).toContain('timed out');
    });
  });

  describe('generateQuiz', () => {
    it('parses JSON from AI response correctly', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ reply: '[{"question": "Q1", "options": ["A", "B"], "answer": "A"}]' })
      });

      const quiz = await generateQuiz('test topic');
      expect(quiz).toHaveLength(1);
      expect(quiz[0].question).toBe('Q1');
    });

    it('returns a fallback quiz on parse error', async () => {
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ reply: 'not json' })
      });

      const quiz = await generateQuiz('test topic');
      expect(quiz[0].question).toContain('minimum age to vote');
    });
  });
});
