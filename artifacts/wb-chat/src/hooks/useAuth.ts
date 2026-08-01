import { useState, useEffect } from 'react';
import { onAuthStateChanged } from '../firebase/auth';
import type { User } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsub = onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
      if (u) {
        localStorage.setItem('wb_uid', u.uid);
      } else {
        localStorage.removeItem('wb_uid');
      }
    });
    return () => unsub();
  }, []);

  return {
    user,
    isLoading,
    isAuthorized: !!user,
  };
};
