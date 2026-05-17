import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProgress, updateModuleCompletion, saveQuizScore, earnBadge } from './userService';
import { supabase } from '../lib/supabase';
import { getDoc, setDoc, updateDoc, type DocumentSnapshot } from 'firebase/firestore';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    }
  }
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(() => ({ type: 'doc-ref' })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(val => val),
  increment: vi.fn(val => val),
}));

// Mock the db export from firebase.ts
vi.mock('./firebase', () => ({
  db: { type: 'firestore' },
  auth: {}
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProgress', () => {
    it('returns default progress when no user is logged in', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: null }, error: null });
      
      const progress = await getUserProgress();
      expect(progress.totalPoints).toBe(0);
      expect(progress.completedModules).toEqual([]);
    });

    it('returns existing progress when user document exists', async () => {
      const mockUser = { id: 'user123' } as unknown as SupabaseUser;
      const mockData = { totalPoints: 100, badges: ['tester'] };
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockData
      } as unknown as DocumentSnapshot);

      const progress = await getUserProgress();
      expect(progress.totalPoints).toBe(100);
      expect(progress.badges).toContain('tester');
    });

    it('creates and returns default progress when user document is missing', async () => {
      const mockUser = { id: 'user123' } as unknown as SupabaseUser;
      
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as unknown as DocumentSnapshot);

      const progress = await getUserProgress();
      expect(setDoc).toHaveBeenCalled();
      expect(progress.totalPoints).toBe(0);
    });
  });

  describe('updateModuleCompletion', () => {
    it('calls updateDoc with correct parameters', async () => {
      const mockUser = { id: 'user123' } as unknown as SupabaseUser;
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      
      await updateModuleCompletion('Intro to Civics');
      
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          completedModules: 'Intro to Civics',
          totalPoints: 10
        })
      );
    });
  });

  describe('saveQuizScore', () => {
    it('calls updateDoc with quiz score and incremented points', async () => {
      const mockUser = { id: 'user123' } as unknown as SupabaseUser;
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      
      await saveQuizScore(5);
      
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          quizScores: 5,
          totalPoints: 25 // 5 * 5
        })
      );
    });
  });

  describe('earnBadge', () => {
    it('calls updateDoc with new badge ID', async () => {
      const mockUser = { id: 'user123' } as unknown as SupabaseUser;
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null });
      
      await earnBadge('first_quiz');
      
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          badges: 'first_quiz'
        })
      );
    });
  });
});
