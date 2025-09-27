
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    roles: ('admin' | 'sales' | 'operations' | 'finance' | 'manufacturing' | 'digital-marketing')[];
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
