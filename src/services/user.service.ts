
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    roles: ('admin' | 'sales' | 'operations' | 'finance' | 'manufacturing' | 'digital-marketing')[];
    emailVerified: boolean;
}

class UserService {
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                return { uid, ...userDoc.data() } as UserProfile;
            } else {
                console.warn(`No user profile found for UID: ${uid}`);
                return null;
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    }

     async createDefaultUserProfile(user: User): Promise<UserProfile> {
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'New User',
            roles: [], // Start with no roles
            emailVerified: false, // Email is not verified on creation
        };

        try {
            await setDoc(doc(db, 'users', user.uid), userProfile);
            return userProfile;
        } catch (error) {
            console.error("Error creating default user profile:", error);
            throw new Error("Could not create user profile in database.");
        }
    }

    async getUsers(): Promise<UserProfile[]> {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users: UserProfile[] = [];
            usersSnapshot.forEach(doc => {
                users.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });
            return users;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Could not fetch user list.");
        }
    }
}

export const userService = new UserService();
