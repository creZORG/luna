
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { userService, UserProfile } from '@/services/user.service';
import { usePathname, useRouter } from 'next/navigation';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isProfilePending: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true, isProfilePending: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfilePending, setIsProfilePending] = useState(false);
  const pathname = usePathname();
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        let profile = await userService.getUserProfile(user.uid);
        if (!profile) {
          profile = await userService.createDefaultUserProfile(user);
        }
        setUserProfile(profile);

        if (!profile.emailVerified && pathname !== '/verify-email') {
            router.push('/verify-email');
        }

        if (!profile.roles || profile.roles.length === 0) {
          setIsProfilePending(true);
        } else {
          setIsProfilePending(false);
        }

      } else {
        setUser(null);
        setUserProfile(null);
        setIsProfilePending(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isProfilePending }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
