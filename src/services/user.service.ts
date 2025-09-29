

import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc, orderBy } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { createEmailTemplate } from '@/lib/email-template';
import { activityService } from './activity.service';
import { uploadImageFlow } from '@/ai/flows/upload-image-flow';
import type { Product } from '@/lib/data';


export type UserRole = 'admin' | 'sales' | 'operations' | 'finance' | 'manufacturing' | 'digital-marketing' | 'influencer' | 'delivery-partner' | 'pickup-location-staff';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    roles: UserRole[];
    emailVerified: boolean;
    profileSetupComplete: boolean; // New field
    photoURL?: string;
    qualifications?: string;
    socialLinks?: { platform: string; url: string }[];
}

export interface UserProfileUpdateData {
    displayName?: string;
    qualifications?: string;
    socialLinks?: { platform: string; url: string }[];
    photoDataUrl?: string; // For new photo uploads
    profileSetupComplete?: boolean;
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
            profileSetupComplete: false, // Profile setup is not complete
            photoURL: '',
            qualifications: '',
            socialLinks: [],
        };

        try {
            // Ensure the data being set includes the uid and email inside the document
            const dataToSet = {
                uid: userProfile.uid,
                email: userProfile.email,
                displayName: userProfile.displayName,
                roles: userProfile.roles,
                emailVerified: userProfile.emailVerified,
                profileSetupComplete: userProfile.profileSetupComplete,
                photoURL: userProfile.photoURL,
                qualifications: userProfile.qualifications,
                socialLinks: userProfile.socialLinks,
            };
            await setDoc(doc(db, 'users', user.uid), dataToSet);
            
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
            const q = query(collection(db, 'users'), orderBy('displayName'));
            const usersSnapshot = await getDocs(q);
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
    
    async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
         try {
            const q = query(collection(db, 'users'), where('roles', 'array-contains', role), orderBy('displayName'));
            const usersSnapshot = await getDocs(q);
            const users: UserProfile[] = [];
            usersSnapshot.forEach(doc => {
                users.push({ uid: doc.id, ...doc.data() } as UserProfile);
            });
            return users;
        } catch (error) {
            console.error(`Error fetching users with role ${role}:`, error);
            throw new Error(`Could not fetch users with role ${role}.`);
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
            if (data.profileSetupComplete) updateData.profileSetupComplete = data.profileSetupComplete;
            
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
                 activityService.logActivity(
                    data.profileSetupComplete ? `Completed their profile setup.` : `Updated their profile.`,
                    user.uid,
                    user.displayName
                );
            }

        } catch (error) {
            console.error("Error updating user profile:", error);
            throw new Error("Could not update user profile.");
        }
    }
}

export const userService = new UserService();
