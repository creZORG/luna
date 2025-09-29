
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerType,
} from '@/lib/partners.data';
import type { UserProfile, UserRole } from './user.service';
import { activityService } from './activity.service';
import { createEmailTemplate } from '@/lib/email-template';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { authService } from './auth.service';

interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  partnerType: PartnerType;
  message: string;
}

const PARTNER_TYPE_TO_ROLE: Record<PartnerType, UserRole> = {
    'influencer': 'influencer',
    'delivery-partner': 'delivery-partner',
    'pickup-location': 'pickup-location-staff',
};

class PartnerService {
  async createApplication(data: ApplicationData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'partnerApplications'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating partner application:', error);
      throw new Error('Could not submit your application.');
    }
  }

  async getApplications(): Promise<PartnerApplication[]> {
    try {
      const q = query(
        collection(db, 'partnerApplications'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as PartnerApplication)
      );
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw new Error('Could not fetch partner applications.');
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: PartnerApplicationStatus
  ): Promise<void> {
    const appRef = doc(db, 'partnerApplications', applicationId);

    try {
        const appDoc = await getDoc(appRef);
        if (!appDoc.exists()) throw new Error('Application not found.');
        const appData = appDoc.data() as Omit<PartnerApplication, 'id'>;

        await updateDoc(appRef, { status });

        // If approved, create the user account
        if (status === 'approved') {
            const batch = writeBatch(db);
            const userRef = doc(collection(db, 'users'));
            
            const newUserProfile: Omit<UserProfile, 'uid'> = {
                email: appData.email,
                displayName: appData.name,
                roles: [PARTNER_TYPE_TO_ROLE[appData.partnerType]],
                emailVerified: false,
                profileSetupComplete: false, // They must complete setup
                photoURL: `https://i.pravatar.cc/150?u=${userRef.id}`, // Placeholder avatar
                qualifications: '',
                socialLinks: [],
            };

            batch.set(userRef, newUserProfile);
            await batch.commit();

            // After creating the user, send them a welcome email and verification code
            await authService.sendVerificationCode(userRef.id, appData.email, appData.name);
            
            // Send welcome email (this is separate from verification)
            const welcomeSubject = "Welcome to the Luna Essentials Partner Program!";
            const welcomeBody = `
                <p>Hello ${appData.name},</p>
                <p>Congratulations! Your application to become a ${appData.partnerType.replace('-', ' ')} has been approved.</p>
                <p>We've sent a separate email with a verification code. Please use it to log in and set up your account on our partner portal.</p>
                <p>We're excited to have you on board!</p>
            `;
             const emailHtml = createEmailTemplate(welcomeSubject, welcomeBody);
            await sendEmail({
                to: { address: appData.email, name: appData.name },
                subject: welcomeSubject,
                htmlbody: emailHtml,
            });
        }

    } catch (error) {
         console.error('Error updating application status:', error);
         throw new Error('Could not update application status.');
    }
  }
}

export const partnerService = new PartnerService();
