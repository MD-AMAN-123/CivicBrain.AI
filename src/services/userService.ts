import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';

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
  const user = auth.currentUser;
  if (!user) return DEFAULT_PROGRESS;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProgress;
  } else {
    await setDoc(userRef, DEFAULT_PROGRESS);
    return DEFAULT_PROGRESS;
  }
};

export const updateModuleCompletion = async (moduleTitle: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    completedModules: arrayUnion(moduleTitle),
    totalPoints: increment(10)
  });
};

export const saveQuizScore = async (score: number) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    quizScores: arrayUnion(score),
    totalPoints: increment(score * 5)
  });
};

export const earnBadge = async (badgeId: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    badges: arrayUnion(badgeId)
  });
};
