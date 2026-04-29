import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { supabase } from '../lib/supabase';

export interface UserProgress {
  completedModules: string[];
  totalPoints: number;
  quizScores: number[];
  badges: string[];
  streak: number;
  lastActive: string;
}

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  totalPoints: 0,
  quizScores: [],
  badges: [],
  streak: 0,
  lastActive: new Date().toISOString().split('T')[0]
};

export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return DEFAULT_PROGRESS;

    if (!db) {
      console.warn("Firestore not initialized");
      return DEFAULT_PROGRESS;
    }

    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...DEFAULT_PROGRESS,
        ...data
      } as UserProgress;
    } else {
      await setDoc(userRef, DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return DEFAULT_PROGRESS;
  }
};


export const updateModuleCompletion = async (moduleTitle: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const userRef = doc(db, 'users', user.id);
  await updateDoc(userRef, {
    completedModules: arrayUnion(moduleTitle),
    totalPoints: increment(10)
  });
};

export const saveQuizScore = async (score: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const userRef = doc(db, 'users', user.id);
  await updateDoc(userRef, {
    quizScores: arrayUnion(score),
    totalPoints: increment(score * 5)
  });
};

export const earnBadge = async (badgeId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const userRef = doc(db, 'users', user.id);
  await updateDoc(userRef, {
    badges: arrayUnion(badgeId)
  });
};

