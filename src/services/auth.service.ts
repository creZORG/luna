import { getAuth, signInWithEmailAndPassword, signOut, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

const auth = getAuth(app);

// NOTE: This service uses a simulated backend flow for OTP.
// A real implementation requires a Cloud Function to securely handle password hashing and email sending.

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

  // Step 1 of Sign up: Create a temporary request and (simulate) sending a code
  async startSignUp(displayName: string, email: string, password: string): Promise<{ verificationId: string }> {
    try {
      // In a REAL app, this should be a call to a secure backend endpoint (e.g., a Cloud Function).
      // The backend would handle code generation, password hashing, and sending the email via Zepto.
      // For this simulation, we'll do it on the client, which is NOT secure for production.
      
      const verificationId = doc(collection(db, 'id')).id; // Generate a random ID
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15-minute expiration

      // IMPORTANT: Storing plain text password is INSECURE. This is a simulation.
      // A backend function should store a securely hashed password.
      const tempRequestRef = doc(db, 'signup-requests', verificationId);
      await setDoc(tempRequestRef, {
        displayName,
        email,
        password, // DO NOT DO THIS IN PRODUCTION
        code: verificationCode,
        expiresAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      console.log(`
        *****************************************************************
        * SIMULATED EMAIL:
        * To: ${email}
        * Your verification code is: ${verificationCode}
        * This code expires in 15 minutes.
        * Verification ID: ${verificationId}
        *****************************************************************
      `);
      
      // The `verificationId` is the document ID for the temporary request.
      return { verificationId };

    } catch (error: any) {
       console.error("Error starting sign-up:", error);
       if (error.code === 'auth/email-already-in-use') {
         throw new Error('This email address is already in use by another account.');
       }
       throw new Error('Could not start the sign-up process.');
    }
  }

  // Step 2 of Sign up: Verify the code and create the user
  async completeSignUp(verificationId: string, code: string): Promise<User> {
    const requestRef = doc(db, 'signup-requests', verificationId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Sign-up request not found or expired. Please try signing up again.");
    }

    const requestData = requestSnap.data();
    const now = new Date();
    const expirationDate = (requestData.createdAt.toDate());
    expirationDate.setMinutes(expirationDate.getMinutes() + 15);


    if (now > expirationDate) {
        await deleteDoc(requestRef);
        throw new Error("Your verification code has expired. Please sign up again.");
    }

    if (requestData.code !== code) {
        throw new Error("Invalid verification code. Please check the code and try again.");
    }

    // --- Verification successful, now create the user ---
    try {
        const { email, password, displayName } = requestData;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a user profile document in 'users' collection
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            displayName: displayName,
            roles: [], // Assign default roles here, e.g., ['sales']
        });

        // Clean up the temporary request
        await deleteDoc(requestRef);

        return user;
    } catch (error: any) {
        // This might happen if the email is already in use (race condition)
        console.error("Error completing sign-up: ", error);
        await deleteDoc(requestRef); // Clean up failed request
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already registered.');
        }
        throw new Error("Could not create your account.");
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }
}

export const authService = new AuthService();
