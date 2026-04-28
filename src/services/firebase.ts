import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDE6ibn86aiLeXbIld_MxT8jxe4O-XlW_M",
  authDomain: "civicbrain-ai.firebaseapp.com",
  projectId: "civicbrain-ai",
  storageBucket: "civicbrain-ai.firebasestorage.app",
  messagingSenderId: "535154913013",
  appId: "1:535154913013:web:b32a6ba38287fb2e775fbc",
  measurementId: "G-ZFHVQ17369"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
