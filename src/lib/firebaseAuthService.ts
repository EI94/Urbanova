import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from './firebase';
import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Interfaccia per l'utente
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  role?: string;
  company?: string;
}

// Interfaccia per il risultato dell'autenticazione
export interface AuthResult {
  user: User;
  success: boolean;
  error?: string;
}

class FirebaseAuthService {
  private static instance: FirebaseAuthService;

  private constructor() {}

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService();
    }
    return FirebaseAuthService.instance;
  }

  // ========================================
  // REGISTRAZIONE UTENTE
  // ========================================

  async signup(email: string, password: string, displayName: string, firstName?: string, lastName?: string): Promise<AuthResult> {
    try {
      // Crea utente con Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Aggiorna il displayName
      if (user) {
        await updateProfile(user, {
          displayName: displayName
        });

        // Crea profilo utente in Firestore
        await this.createUserProfile(user.uid, {
          email: user.email,
          displayName: displayName,
          firstName: firstName || '',
          lastName: lastName || '',
          role: 'USER',
          company: '',
          createdAt: new Date()
        });

        return {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            firstName: firstName,
            lastName: lastName,
            role: 'USER'
          },
          success: true
        };
      }

      throw new Error('Errore durante la creazione dell\'utente');
    } catch (error: any) {
      console.error('Errore durante la registrazione:', error);
      
      let errorMessage = 'Errore durante la registrazione';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email già in uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password troppo debole';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email non valida';
      }

      return {
        user: {} as User,
        success: false,
        error: errorMessage
      };
    }
  }

  // ========================================
  // LOGIN UTENTE
  // ========================================

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Login con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ottieni profilo utente da Firestore
      const userProfile = await this.getUserProfile(user.uid);

      // Aggiorna ultimo login
      await this.updateLastLogin(user.uid);

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || userProfile?.displayName || '',
          firstName: userProfile?.firstName,
          lastName: userProfile?.lastName,
          role: userProfile?.role || 'USER',
          company: userProfile?.company
        },
        success: true
      };
    } catch (error: any) {
      console.error('Errore durante il login:', error);
      
      let errorMessage = 'Errore durante il login';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Utente non trovato';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password errata';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Troppi tentativi. Riprova più tardi';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Account disabilitato';
      }

      return {
        user: {} as User,
        success: false,
        error: errorMessage
      };
    }
  }

  // ========================================
  // LOGOUT UTENTE
  // ========================================

  async logout(): Promise<boolean> {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Errore durante il logout:', error);
      return false;
    }
  }

  // ========================================
  // RESET PASSWORD
  // ========================================

  async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error('Errore durante il reset password:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('Email non trovata');
      }
      
      throw new Error('Errore durante l\'invio dell\'email di reset');
    }
  }

  // ========================================
  // STATO AUTENTICAZIONE
  // ========================================

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Ottieni profilo completo da Firestore
        const userProfile = await this.getUserProfile(firebaseUser.uid);
        
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userProfile?.displayName || '',
          firstName: userProfile?.firstName,
          lastName: userProfile?.lastName,
          role: userProfile?.role || 'USER',
          company: userProfile?.company
        };
        
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // ========================================
  // UTENTE CORRENTE
  // ========================================

  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName
      };
    }
    return null;
  }

  // ========================================
  // PROFILO UTENTE
  // ========================================

  private async createUserProfile(uid: string, profileData: any): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Errore durante la creazione del profilo utente:', error);
    }
  }

  private async getUserProfile(uid: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Errore durante il recupero del profilo utente:', error);
      return null;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'ultimo login:', error);
    }
  }

  // ========================================
  // AGGIORNAMENTO PROFILO
  // ========================================

  async updateUserProfile(uid: string, updates: any): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del profilo:', error);
      return false;
    }
  }
}

export const firebaseAuthService = FirebaseAuthService.getInstance();
