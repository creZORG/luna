

import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';
import { activityService } from './activity.service';
import { uploadImageFlow } from '@/ai/flows/upload-image-flow';
import type { Product } from '@/lib/data';


export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    roles: ('admin' | 'sales' | 'operations' | 'finance' | 'manufacturing' | 'digital-marketing')[];
    emailVerified: boolean;
    photoURL?: string;
    qualifications?: string;
    socialLinks?: { platform: string; url: string }[];
}

export interface UserProfileUpdateData {
    displayName?: string;
    qualifications?: string;
    socialLinks?: { platform: string; url: string }[];
    photoDataUrl?: string; // For new photo uploads
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
            photoURL: '',
            qualifications: '',
            socialLinks: [],
        };

        try {
            await setDoc(doc(db, 'users', user.uid), userProfile);
            
            // Log this activity
            activityService.logActivity(`New user signed up: ${userProfile.displayName} (${userProfile.email})`, 'system', 'System');


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

            const emailHtml = createEmailTemplate(emailSubject, emailBody);

            for (const admin of admins) {
                await sendEmail({
                    to: { address: admin.email, name: admin.displayName },
                    subject: emailSubject,
                    htmlbody: emailHtml,
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

    async updateUserRoles(uid: string, roles: UserProfile['roles'], adminUid: string, adminName: string): Promise<void> {
        try {
            const userDocRef = doc(db, 'users', uid);
            await updateDoc(userDocRef, { roles });
            
            const targetUser = await this.getUserProfile(uid);
            
            if (targetUser) {
                activityService.logActivity(
                    `Updated roles for ${targetUser.displayName} to: ${roles.join(', ')}`,
                    adminUid,
                    adminName
                );
            }

        } catch (error) {
            console.error("Error updating user roles:", error);
            throw new Error("Could not update user roles in the database.");
        }
    }

    async updateUserProfile(uid: string, data: UserProfileUpdateData): Promise<void> {
        try {
            const userDocRef = doc(db, 'users', uid);
            const updateData: any = {};

            if (data.displayName) updateData.displayName = data.displayName;
            if (data.qualifications) updateData.qualifications = data.qualifications;
            if (data.socialLinks) updateData.socialLinks = data.socialLinks;
            
            if (data.photoDataUrl) {
                const imageUrl = await uploadImageFlow({
                    imageDataUri: data.photoDataUrl,
                    folder: 'profile-photos'
                });
                updateData.photoURL = imageUrl;
            }

            if (Object.keys(updateData).length > 0) {
                await updateDoc(userDocRef, updateData);
            }
            
            const user = await this.getUserProfile(uid);
            if (user) {
                activityService.logActivity(`Updated their profile.`, user.uid, user.displayName);
            }

        } catch (error) {
            console.error("Error updating user profile:", error);
            throw new Error("Could not update user profile.");
        }
    }

    async getProduct(productId: string): Promise<Product | null> {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return null;
    }
}

export const userService = new UserService();
