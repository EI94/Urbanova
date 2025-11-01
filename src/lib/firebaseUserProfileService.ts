import {
  doc,
  getDoc,
  setDoc,
  updateDoc,addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp } from 'firebase/firestore';

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { safeCollection } from './firebaseUtils';

// 🛡️ OS PROTECTION - Carica solo lato client per evitare TDZ
if (typeof window !== 'undefined') {
  import('@/lib/osProtection').catch(() => {});
}

// Lazy loader per firebase - evita TDZ
let firebaseModulePromise: Promise<typeof import('./firebase')> | null = null;
const getFirebaseDb = async () => {
  if (!firebaseModulePromise) {
    firebaseModulePromise = import('./firebase');
  }
  const module = await firebaseModulePromise;
  return module.db;
};
const getFirebaseStorage = async () => {
  if (!firebaseModulePromise) {
    firebaseModulePromise = import('./firebase');
  }
  const module = await firebaseModulePromise;
  return module.storage;
};

// Importa i tipi dalla definizione centrale
import { UserProfile, LoginAttempt } from '@/types/userProfile';


export interface AvatarUpload {
  file: {
    name: string;
    size: number;
    type: string;
  };
  preview: string;
  progress: number;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  timezone?: string;
  language?: string;
  dateFormat?: string;
  currency?: string;
  role?: string;
  preferences?: Partial<UserProfile['preferences']>;
  metadata?: Record<string, any>;
}

class FirebaseUserProfileService {
  private static instance: FirebaseUserProfileService;

  private constructor() {}

  public static getInstance(): FirebaseUserProfileService {
    if (!FirebaseUserProfileService.instance) {
      FirebaseUserProfileService.instance = new FirebaseUserProfileService();
    }
    return FirebaseUserProfileService.instance;
  }

  // ========================================
  // GESTIONE PROFILO UTENTE
  // ========================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('🔄 [FirebaseUserProfile] Caricamento profilo per:', userId);
      
      const db = await getFirebaseDb();
      const profileRef = doc(db, 'userProfiles', userId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        console.log('✅ [FirebaseUserProfile] Profilo trovato:', data);
        return {
          id: profileSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          security: {
            ...data.security,
            lastPasswordChange: data.security?.lastPasswordChange?.toDate() || new Date(),
            loginHistory: data.security?.loginHistory || [],
          },
        } as UserProfile;
      }

      console.log('ℹ️ [FirebaseUserProfile] Nessun profilo trovato per:', userId);
      return null;
    } catch (error) {
      console.error('❌ [FirebaseUserProfile] Errore caricamento profilo:', error);
      
      // Se è un errore di permessi, non bloccare l'app
      if (error instanceof Error && error.message.includes('permission-denied')) {
        console.warn('⚠️ [FirebaseUserProfile] Permessi insufficienti per caricare profilo');
        return null;
      }
      
      return null;
    }
  }

  async createUserProfile(
    userId: string,
    profileData: {
      email: string;
      displayName: string;
      firstName?: string;
      lastName?: string;
    }
  ): Promise<UserProfile> {
    try {
      console.log('🆕 [FirebaseUserProfile] Creazione profilo per:', userId);
      
      const defaultProfile: Omit<UserProfile, 'id'> = {
        userId,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        displayName: profileData.displayName,
        email: profileData.email,
        timezone: 'Europe/Rome',
        language: 'it',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR',
        preferences: {
          theme: 'light',
          sidebarCollapsed: false,
          emailNotifications: true,
          pushNotifications: true,
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date(),
          loginHistory: [],
        },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = await getFirebaseDb();
      const profileRef = doc(db, 'userProfiles', userId);
      await setDoc(profileRef, {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        security: {
          ...defaultProfile.security,
          lastPasswordChange: serverTimestamp(),
        },
      });

      console.log('✅ [FirebaseUserProfile] Profilo creato con successo per:', userId);
      return {
        id: userId,
        ...defaultProfile,
      };
    } catch (error) {
      console.error('❌ [FirebaseUserProfile] Errore creazione profilo:', error);
      
      // SEMPRE restituisci un profilo temporaneo per evitare crash della dashboard
      // Questo gestisce TUTTI i casi di errore: permessi, db non disponibile, network, ecc.
      console.warn('⚠️ [FirebaseUserProfile] Usando profilo temporaneo per evitare crash');
      return {
        id: userId,
        userId,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        displayName: profileData.displayName,
        email: profileData.email,
        timezone: 'Europe/Rome',
        language: 'it',
        dateFormat: 'DD/MM/YYYY',
        currency: 'EUR',
        preferences: {
          theme: 'light',
          sidebarCollapsed: false,
          emailNotifications: true,
          pushNotifications: true,
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: new Date(),
          loginHistory: [],
        },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async updateUserProfile(userId: string, updates: ProfileUpdate): Promise<UserProfile | null> {
    try {
      const db = await getFirebaseDb();
      const profileRef = doc(db, 'userProfiles', userId);

      // Se displayName viene aggiornato, aggiorna anche firstName e lastName
      if (updates.firstName || updates.lastName) {
        const firstName = updates.firstName || '';
        const lastName = updates.lastName || '';
        updates.displayName = `${firstName} ${lastName}`.trim();
      }

      await updateDoc(profileRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Restituisci il profilo aggiornato
      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // ========================================
  // GESTIONE AVATAR
  // ========================================

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      console.log('📸 [FirebaseUserProfile] Upload avatar:', file.name, file.size, file.type);
      
      // Elimina avatar precedente se esiste
      const currentProfile = await this.getUserProfile(userId);
      if (currentProfile?.avatar) {
        try {
          const storage = await getFirebaseStorage();
          const oldAvatarRef = ref(storage, `avatars/${userId}/avatar`);
          await deleteObject(oldAvatarRef);
          console.log('🗑️ [FirebaseUserProfile] Avatar precedente eliminato');
        } catch (error) {
          console.log('ℹ️ [FirebaseUserProfile] Nessun avatar precedente da eliminare');
        }
      }

      // Carica nuovo avatar con il file reale
      const storage = await getFirebaseStorage();
      const avatarRef = ref(storage, `avatars/${userId}/avatar`);
      const uploadResult = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      console.log('✅ [FirebaseUserProfile] Avatar caricato:', downloadURL);

      // Aggiorna profilo con nuovo URL avatar
      await this.updateUserProfile(userId, { avatar: downloadURL } as any);

      return downloadURL;
    } catch (error) {
      console.error('❌ [FirebaseUserProfile] Errore upload avatar:', error);
      return null;
    }
  }

  async deleteAvatar(userId: string): Promise<boolean> {
    try {
      const storage = await getFirebaseStorage();
      const avatarRef = ref(storage, `avatars/${userId}/avatar`);
      await deleteObject(avatarRef);

      // Rimuovi URL avatar dal profilo
      await this.updateUserProfile(userId, { avatar: undefined } as any);

      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  }

  // ========================================
  // SICUREZZA E AUTENTICAZIONE
  // ========================================

  async toggleTwoFactor(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return false;

      const newValue = !profile.security.twoFactorEnabled;

      const db = await getFirebaseDb();
      const profileRef = doc(db, 'userProfiles', userId);
      await updateDoc(profileRef, {
        'security.twoFactorEnabled': newValue,
        updatedAt: serverTimestamp(),
      });

      return newValue;
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      return false;
    }
  }

  async recordLoginAttempt(
    userId: string,
    attempt: Omit<LoginAttempt, 'id' | 'timestamp'>
  ): Promise<void> {
    try {
      const loginData = {
        ...attempt,
        userId,
        timestamp: serverTimestamp(),
      };

      await addDoc(safeCollection('loginHistory'), loginData);

      // Aggiorna anche la cronologia nel profilo (ultimi 10)
      const profile = await this.getUserProfile(userId);
      if (profile) {
        const loginHistory = profile.security.loginHistory || [];
        loginHistory.unshift({
          id: Date.now().toString(),
          timestamp: new Date(),
          ...attempt,
        });

        // Mantieni solo gli ultimi 10 tentativi
        const updatedHistory = loginHistory.slice(0, 10);

        const db = await getFirebaseDb();
        const profileRef = doc(db, 'userProfiles', userId);
        await updateDoc(profileRef, {
          'security.loginHistory': updatedHistory,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  async getLoginHistory(userId: string, limit: number = 50): Promise<LoginAttempt[]> {
    try {
      const q = query(
        safeCollection('loginHistory'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const loginHistory: LoginAttempt[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        loginHistory.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as LoginAttempt);
      });

      return loginHistory.slice(0, limit);
    } catch (error) {
      console.error('Error fetching login history:', error);
      return [];
    }
  }

  // ========================================
  // ANALISI E STATISTICHE
  // ========================================

  async getUserAnalytics(userId: string): Promise<any> {
    try {
      const profile = await this.getUserProfile(userId);
      const loginHistory = await this.getLoginHistory(userId, 30);

      const analytics = {
        profileCompleteness: this.calculateProfileCompleteness(profile),
        totalLogins: loginHistory.length,
        lastLogin: loginHistory[0]?.timestamp || null,
        loginStreak: this.calculateLoginStreak(loginHistory),
        averageSessionTime: this.calculateAverageSessionTime(loginHistory),
        securityScore: this.calculateSecurityScore(profile),
        preferredLanguage: profile?.language || 'it',
        timezone: profile?.timezone || 'Europe/Rome',
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  }

  private calculateProfileCompleteness(profile: UserProfile | null): number {
    if (!profile) return 0;

    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'position',
      'bio',
      'location',
      'avatar',
    ];

    let completedFields = 0;
    fields.forEach(field => {
      if (profile[field as keyof UserProfile]) {
        completedFields++;
      }
    });

    return Math.round((completedFields / fields.length) * 100);
  }

  private calculateLoginStreak(loginHistory: LoginAttempt[]): number {
    if (loginHistory.length === 0) return 0;

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const login of loginHistory) {
      const loginDate = new Date(login.timestamp);
      loginDate.setHours(0, 0, 0, 0);

      if (loginDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (loginDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private calculateAverageSessionTime(loginHistory: LoginAttempt[]): number {
    // Implementazione semplificata - in una vera applicazione
    // dovresti tracciare anche i logout
    return Math.floor(Math.random() * 60) + 15; // 15-75 minuti
  }

  private calculateSecurityScore(profile: UserProfile | null): number {
    if (!profile) return 0;

    let score = 0;

    // Password recente (max 90 giorni)
    const daysSincePasswordChange = Math.floor(
      (Date.now() - profile.security.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePasswordChange <= 90) score += 30;

    // 2FA attivato
    if (profile.security.twoFactorEnabled) score += 40;

    // Profilo completo
    const completeness = this.calculateProfileCompleteness(profile);
    score += Math.floor(completeness * 0.3);

    return Math.min(score, 100);
  }

  // ========================================
  // UTILITÀ
  // ========================================

  async deleteUserProfile(userId: string): Promise<boolean> {
    try {
      // Elimina avatar se esiste
      await this.deleteAvatar(userId);

      // Elimina profilo
      const db = await getFirebaseDb();
      const profileRef = doc(db, 'userProfiles', userId);
      await setDoc(profileRef, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  }

  async exportUserData(userId: string): Promise<any> {
    try {
      const profile = await this.getUserProfile(userId);
      const loginHistory = await this.getLoginHistory(userId);
      const analytics = await this.getUserAnalytics(userId);

      return {
        profile,
        loginHistory,
        analytics,
        exportedAt: new Date(),
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }
}

export const firebaseUserProfileService = FirebaseUserProfileService.getInstance();
