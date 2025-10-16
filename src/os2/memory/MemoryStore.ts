// 💾 MEMORY STORE - Sistema di memoria multilivello per OS 2.0
// Interfaccia astratta + implementazione Firestore

import {
  ProjectMemory,
  SessionMemory,
  UserMemory,
  ProjectMemoryUpdate,
  SessionMemoryUpdate,
  UserMemoryUpdate,
  ProjectMemorySchema,
  SessionMemorySchema,
  UserMemorySchema,
} from './types';
import { db } from '../../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Interfaccia astratta per Memory Store
 */
export interface IMemoryStore {
  // Project Memory
  getProjectMemory(projectId: string): Promise<ProjectMemory | null>;
  setProjectMemory(memory: ProjectMemory): Promise<void>;
  updateProjectMemory(update: ProjectMemoryUpdate): Promise<void>;
  deleteProjectMemory(projectId: string): Promise<void>;
  
  // Session Memory
  getSessionMemory(sessionId: string): Promise<SessionMemory | null>;
  setSessionMemory(memory: SessionMemory): Promise<void>;
  updateSessionMemory(update: SessionMemoryUpdate): Promise<void>;
  deleteSessionMemory(sessionId: string): Promise<void>;
  
  // User Memory
  getUserMemory(userId: string): Promise<UserMemory | null>;
  setUserMemory(memory: UserMemory): Promise<void>;
  updateUserMemory(update: UserMemoryUpdate): Promise<void>;
  deleteUserMemory(userId: string): Promise<void>;
}

/**
 * Implementazione Firestore per Memory Store
 */
export class FirestoreMemoryStore implements IMemoryStore {
  private projectCollection = 'os2_project_memory';
  private sessionCollection = 'os2_session_memory';
  private userCollection = 'os2_user_memory';
  
  constructor() {
    console.log('💾 [MemoryStore] Inizializzato con Firestore');
  }
  
  // ==================== PROJECT MEMORY ====================
  
  async getProjectMemory(projectId: string): Promise<ProjectMemory | null> {
    try {
      const docRef = doc(db, this.projectCollection, projectId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log(`📭 [MemoryStore] Nessuna memoria per progetto ${projectId}`);
        return null;
      }
      
      const data = docSnap.data();
      
      // Parse dates
      const memory = {
        ...data,
        lastAccessed: data.lastAccessed?.toDate?.() || new Date(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        history: data.history?.map((item: any) => ({
          ...item,
          timestamp: item.timestamp?.toDate?.() || new Date(),
        })) || [],
      };
      
      // Validate with Zod
      const validated = ProjectMemorySchema.parse(memory);
      
      console.log(`✅ [MemoryStore] Project memory caricata: ${projectId}`);
      return validated;
      
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore get project memory:`, error);
      return null;
    }
  }
  
  async setProjectMemory(memory: ProjectMemory): Promise<void> {
    try {
      const validated = ProjectMemorySchema.parse(memory);
      const docRef = doc(db, this.projectCollection, validated.projectId);
      
      await setDoc(docRef, {
        ...validated,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      console.log(`✅ [MemoryStore] Project memory salvata: ${validated.projectId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore set project memory:`, error);
      throw error;
    }
  }
  
  async updateProjectMemory(update: ProjectMemoryUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.projectCollection, update.projectId);
      const updateData: any = { updatedAt: serverTimestamp() };
      
      // Update defaults
      if (update.defaults) {
        const existing = await this.getProjectMemory(update.projectId);
        updateData.defaults = {
          ...(existing?.defaults || {}),
          ...update.defaults,
        };
      }
      
      // Add history item
      if (update.addHistoryItem) {
        const existing = await this.getProjectMemory(update.projectId);
        const currentHistory = existing?.history || [];
        updateData.history = [...currentHistory, update.addHistoryItem];
      }
      
      await updateDoc(docRef, updateData);
      
      console.log(`✅ [MemoryStore] Project memory aggiornata: ${update.projectId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore update project memory:`, error);
      throw error;
    }
  }
  
  async deleteProjectMemory(projectId: string): Promise<void> {
    try {
      const docRef = doc(db, this.projectCollection, projectId);
      await deleteDoc(docRef);
      console.log(`✅ [MemoryStore] Project memory eliminata: ${projectId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore delete project memory:`, error);
      throw error;
    }
  }
  
  // ==================== SESSION MEMORY ====================
  
  async getSessionMemory(sessionId: string): Promise<SessionMemory | null> {
    try {
      const docRef = doc(db, this.sessionCollection, sessionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      const memory = {
        ...data,
        startedAt: data.startedAt?.toDate?.() || new Date(),
        lastActivityAt: data.lastActivityAt?.toDate?.() || new Date(),
        lastSkills: data.lastSkills?.map((skill: any) => ({
          ...skill,
          timestamp: skill.timestamp?.toDate?.() || new Date(),
        })) || [],
      };
      
      return SessionMemorySchema.parse(memory);
      
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore get session memory:`, error);
      return null;
    }
  }
  
  async setSessionMemory(memory: SessionMemory): Promise<void> {
    try {
      const validated = SessionMemorySchema.parse(memory);
      const docRef = doc(db, this.sessionCollection, validated.sessionId);
      
      await setDoc(docRef, {
        ...validated,
        lastActivityAt: serverTimestamp(),
      }, { merge: true });
      
      console.log(`✅ [MemoryStore] Session memory salvata: ${validated.sessionId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore set session memory:`, error);
      throw error;
    }
  }
  
  async updateSessionMemory(update: SessionMemoryUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.sessionCollection, update.sessionId);
      const updateData: any = { lastActivityAt: serverTimestamp() };
      
      if (update.recentParams) {
        const existing = await this.getSessionMemory(update.sessionId);
        updateData.recentParams = {
          ...(existing?.recentParams || {}),
          ...update.recentParams,
        };
      }
      
      if (update.addSkill) {
        const existing = await this.getSessionMemory(update.sessionId);
        const currentSkills = existing?.lastSkills || [];
        // Keep only last 20 skills
        updateData.lastSkills = [...currentSkills, update.addSkill].slice(-20);
      }
      
      if (update.incrementMessageCount) {
        const existing = await this.getSessionMemory(update.sessionId);
        updateData.messageCount = (existing?.messageCount || 0) + 1;
      }
      
      await updateDoc(docRef, updateData);
      
      console.log(`✅ [MemoryStore] Session memory aggiornata: ${update.sessionId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore update session memory:`, error);
      throw error;
    }
  }
  
  async deleteSessionMemory(sessionId: string): Promise<void> {
    try {
      const docRef = doc(db, this.sessionCollection, sessionId);
      await deleteDoc(docRef);
      console.log(`✅ [MemoryStore] Session memory eliminata: ${sessionId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore delete session memory:`, error);
      throw error;
    }
  }
  
  // ==================== USER MEMORY ====================
  
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    try {
      const docRef = doc(db, this.userCollection, userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Crea default user memory se non esiste
        console.log(`📝 [MemoryStore] Creando default user memory per ${userId}`);
        const defaultMemory: UserMemory = {
          userId,
          preferences: {
            tone: 'detailed',
            exportFormat: 'pdf',
            language: 'it',
            notifications: true,
            showAdvancedOptions: false,
            autoSaveDrafts: true,
            defaultCurrency: 'EUR',
            defaultDiscountRate: 0.12,
            defaultMarginTarget: 0.20,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await this.setUserMemory(defaultMemory);
        return defaultMemory;
      }
      
      const data = docSnap.data();
      
      const memory = {
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        stats: data.stats ? {
          ...data.stats,
          lastLogin: data.stats.lastLogin?.toDate?.(),
        } : undefined,
      };
      
      return UserMemorySchema.parse(memory);
      
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore get user memory:`, error);
      return null;
    }
  }
  
  async setUserMemory(memory: UserMemory): Promise<void> {
    try {
      const validated = UserMemorySchema.parse(memory);
      const docRef = doc(db, this.userCollection, validated.userId);
      
      await setDoc(docRef, {
        ...validated,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      console.log(`✅ [MemoryStore] User memory salvata: ${validated.userId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore set user memory:`, error);
      throw error;
    }
  }
  
  async updateUserMemory(update: UserMemoryUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.userCollection, update.userId);
      const updateData: any = { updatedAt: serverTimestamp() };
      
      if (update.preferences) {
        const existing = await this.getUserMemory(update.userId);
        updateData.preferences = {
          ...(existing?.preferences || {}),
          ...update.preferences,
        };
      }
      
      if (update.incrementStats) {
        const existing = await this.getUserMemory(update.userId);
        const currentStats = existing?.stats || {
          totalSessions: 0,
          totalActions: 0,
          favoriteSkills: [],
        };
        
        updateData.stats = { ...currentStats };
        
        if (update.incrementStats.sessions) {
          updateData.stats.totalSessions = currentStats.totalSessions + 1;
          updateData.stats.lastLogin = serverTimestamp();
        }
        
        if (update.incrementStats.actions) {
          updateData.stats.totalActions = currentStats.totalActions + 1;
        }
        
        if (update.incrementStats.addFavoriteSkill) {
          const favorites = currentStats.favoriteSkills || [];
          if (!favorites.includes(update.incrementStats.addFavoriteSkill)) {
            updateData.stats.favoriteSkills = [...favorites, update.incrementStats.addFavoriteSkill];
          }
        }
      }
      
      await updateDoc(docRef, updateData);
      
      console.log(`✅ [MemoryStore] User memory aggiornata: ${update.userId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore update user memory:`, error);
      throw error;
    }
  }
  
  async deleteUserMemory(userId: string): Promise<void> {
    try {
      const docRef = doc(db, this.userCollection, userId);
      await deleteDoc(docRef);
      console.log(`✅ [MemoryStore] User memory eliminata: ${userId}`);
    } catch (error) {
      console.error(`❌ [MemoryStore] Errore delete user memory:`, error);
      throw error;
    }
  }
}

/**
 * Singleton Memory Store
 */
let memoryStoreInstance: IMemoryStore;

export function getMemoryStore(): IMemoryStore {
  if (!memoryStoreInstance) {
    memoryStoreInstance = new FirestoreMemoryStore();
  }
  return memoryStoreInstance;
}

/**
 * Per testing: permette di iniettare mock store
 */
export function setMemoryStore(store: IMemoryStore): void {
  memoryStoreInstance = store;
}

