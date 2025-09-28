import { getAuth, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, collection, updateDoc, Timestamp } from 'firebase/firestore';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { SendEmailRequest } from '@/ai/flows/send-email-types';
import { createEmailTemplate } from '@/lib/email-template';

const auth = getAuth(app);

class AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      // Normalize Firebase auth errors into a user-friendly message
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password.');
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.');
        default:
          throw new Error('An unknown error occurred. Please try again later.');
      }
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }
  
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }

  async sendVerificationCode(uid: string, email: string, displayName: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Expires in 15 minutes

    const verificationRef = doc(db, 'emailVerifications', uid);
    await setDoc(verificationRef, {
      code,
      email,
      expires: Timestamp.fromDate(expires),
    });

    const emailBody = `
      <p>Hello ${displayName},</p>
      <p>Thank you for joining the Luna Essentials team portal. To secure your account, please use the following verification code:</p>
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #333; background-color: #f0f8ff; padding: 15px 20px; border-radius: 0.5rem; display: inline-block; border: 1px dashed #add8e6;">
          ${code}
        </p>
      </div>
      <p>This code will expire in 15 minutes. If you did not request this code, you can safely ignore this email.</p>
    `;

    const emailHtmlBody = createEmailTemplate('Verify Your Email Address', emailBody);

    const emailRequest: SendEmailRequest = {
      to: { address: email, name: displayName },
      subject: 'Your Luna Essentials Verification Code',
      htmlbody: emailHtmlBody,
    };

    await sendEmail(emailRequest);
  }

  async checkVerificationCode(uid: string, code: string): Promise<boolean> {
    const verificationRef = doc(db, 'emailVerifications', uid);
    const docSnap = await getDoc(verificationRef);

    if (!docSnap.exists()) {
      throw new Error('No verification request found. Please try again.');
    }

    const data = docSnap.data();
    const now = new Date();

    if (data.expires.toDate() < now) {
      await deleteDoc(verificationRef);
      throw new Error('Verification code has expired. Please request a new one.');
    }

    if (data.code === code) {
      // Code is correct. Update the user's profile and delete the verification doc.
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { emailVerified: true });
      await deleteDoc(verificationRef);
      return true;
    }

    return false;
  }
}

export const authService = new AuthService();
