import { signInAnonymously, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config';

export const signInAnonymouslyUser = () => signInAnonymously(auth);
export const signOut = () => firebaseSignOut(auth);

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};
