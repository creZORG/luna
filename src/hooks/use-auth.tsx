
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
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
  refetchUserProfile?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, loading: true, isProfilePending: false });


// This mapping defines the primary dashboard for each role.
const ROLE_DASHBOARDS: Record<string, string> = {
    'admin': '/admin/dashboard',
    'sales': '/sales',
    'operations': '/operations',
    'finance': '/finance',
    'manufacturing': '/manufacturing',
    'digital-marketing': '/campaigns',
    'influencer': '/campaigns',
};

// This defines the order of importance for roles if a user has multiple.
const ROLE_PRIORITY: (keyof typeof ROLE_DASHBOARDS)[] = [
    'admin',
    'operations',
    'sales',
    'manufacturing',
    'finance',
    'digital-marketing',
    'influencer',
];

const getPrimaryDashboard = (roles: UserProfile['roles']): string => {
    for (const role of ROLE_PRIORITY) {
        if (roles.includes(role)) {
            return ROLE_DASHBOARDS[role];
        }
    }
    // Fallback for users with no roles or unrecognized roles
    return '/admin/dashboard'; 
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const fetchUserProfile = useCallback(async (firebaseUser: User) => {
      let profile = await userService.getUserProfile(firebaseUser.uid);
      if (!profile) {
        profile = await userService.createDefaultUserProfile(firebaseUser);
      }
      setUserProfile(profile);
      return profile;
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const profile = await fetchUserProfile(user);

        // --- START REDIRECTION LOGIC ---
        const isAuthPage = ['/login', '/verify-email', '/profile-setup'].includes(pathname);
        
        if (profile) {
            // If email is not verified, force them to the verification page.
            if (!profile.emailVerified) {
                if (pathname !== '/verify-email') {
                    router.push('/verify-email');
                }
            } 
            // If email is verified but profile setup is not complete
            else if (!profile.profileSetupComplete) {
                 if (pathname !== '/profile-setup') {
                    router.push('/profile-setup');
                }
            }
            // If everything is complete and they are on an auth page, redirect to dashboard
            else if (isAuthPage) {
                const dashboardUrl = getPrimaryDashboard(profile.roles);
                router.push(dashboardUrl);
            }
        }
        // --- END REDIRECTION LOGIC ---

      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router, fetchUserProfile]);
  
  const refetchUserProfile = useCallback(async () => {
    if (user) {
        await fetchUserProfile(user);
    }
  }, [user, fetchUserProfile]);
  
  const isProfilePending = userProfile && (!userProfile.roles || userProfile.roles.length === 0);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isProfilePending, refetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

