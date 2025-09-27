
import { getAuth, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc, collection, updateDoc, Timestamp } from 'firebase/firestore';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { SendEmailRequest } from '@/ai/flows/send-email-types';

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

  async sendVerificationCode(uid: string, email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15); // Expires in 15 minutes

    const verificationRef = doc(db, 'emailVerifications', uid);
    await setDoc(verificationRef, {
      code,
      email,
      expires: Timestamp.fromDate(expires),
    });

    const emailRequest: SendEmailRequest = {
      to: { address: email, name: 'Luna User' },
      subject: 'Your Verification Code',
      htmlbody: `<div>Your Luna Essentials portal verification code is: <b>${code}</b>. This code will expire in 15 minutes.</div>`,
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
