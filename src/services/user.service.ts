
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { sendEmail } from '@/ai/flows/send-email-flow';

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
            
            // Notify admins of new user
            const admins = await this.getAdmins();
            const emailSubject = "New User Account Pending Setup";
            const emailBody = `
                <p>Hello Admins,</p>
                <p>A new user has just created an account and is waiting for their roles to be assigned.</p>
                <ul>
                    <li><strong>User:</strong> ${userProfile.displayName}</li>
                    <li><strong>Email:</strong> ${userProfile.email}</li>
                </ul>
                <p>Please log in to the admin dashboard to assign the appropriate roles.</p>
            `;

            for (const admin of admins) {
                await sendEmail({
                    to: { address: admin.email, name: admin.displayName },
                    subject: emailSubject,
                    htmlbody: emailBody,
                });
            }

            return userProfile;
        } catch (error) {
            console.error("Error creating default user profile or sending admin notification:", error);
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

    async getAdmins(): Promise<UserProfile[]> {
        const q = query(collection(db, 'users'), where('roles', 'array-contains', 'admin'));
        const querySnapshot = await getDocs(q);
        const admins: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            admins.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        return admins;
    }
}

export const userService = new UserService();
