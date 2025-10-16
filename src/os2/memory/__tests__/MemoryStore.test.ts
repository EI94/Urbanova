// 🧪 UNIT TEST - Memory Store
// Test read/write per ProjectMemory, SessionMemory, UserMemory

import { IMemoryStore } from '../MemoryStore';
import {
  ProjectMemory,
  SessionMemory,
  UserMemory,
  ProjectMemoryUpdate,
  SessionMemoryUpdate,
  UserMemoryUpdate,
} from '../types';

/**
 * Mock Memory Store per testing
 */
class MockMemoryStore implements IMemoryStore {
  private projects = new Map<string, ProjectMemory>();
  private sessions = new Map<string, SessionMemory>();
  private users = new Map<string, UserMemory>();
  
  // Project Memory
  async getProjectMemory(projectId: string): Promise<ProjectMemory | null> {
    return this.projects.get(projectId) || null;
  }
  
  async setProjectMemory(memory: ProjectMemory): Promise<void> {
    this.projects.set(memory.projectId, memory);
  }
  
  async updateProjectMemory(update: ProjectMemoryUpdate): Promise<void> {
    const existing = this.projects.get(update.projectId);
    if (!existing) throw new Error('Project memory not found');
    
    const updated: ProjectMemory = {
      ...existing,
      defaults: {
        ...existing.defaults,
        ...(update.defaults || {}),
      },
      history: update.addHistoryItem 
        ? [...existing.history, update.addHistoryItem]
        : existing.history,
      updatedAt: new Date(),
    };
    
    this.projects.set(update.projectId, updated);
  }
  
  async deleteProjectMemory(projectId: string): Promise<void> {
    this.projects.delete(projectId);
  }
  
  // Session Memory
  async getSessionMemory(sessionId: string): Promise<SessionMemory | null> {
    return this.sessions.get(sessionId) || null;
  }
  
  async setSessionMemory(memory: SessionMemory): Promise<void> {
    this.sessions.set(memory.sessionId, memory);
  }
  
  async updateSessionMemory(update: SessionMemoryUpdate): Promise<void> {
    const existing = this.sessions.get(update.sessionId);
    if (!existing) throw new Error('Session memory not found');
    
    const updated: SessionMemory = {
      ...existing,
      recentParams: {
        ...existing.recentParams,
        ...(update.recentParams || {}),
      },
      lastSkills: update.addSkill
        ? [...existing.lastSkills, update.addSkill].slice(-20)
        : existing.lastSkills,
      messageCount: update.incrementMessageCount
        ? existing.messageCount + 1
        : existing.messageCount,
      lastActivityAt: new Date(),
    };
    
    this.sessions.set(update.sessionId, updated);
  }
  
  async deleteSessionMemory(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
  
  // User Memory
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    return this.users.get(userId) || null;
  }
  
  async setUserMemory(memory: UserMemory): Promise<void> {
    this.users.set(memory.userId, memory);
  }
  
  async updateUserMemory(update: UserMemoryUpdate): Promise<void> {
    const existing = this.users.get(update.userId);
    if (!existing) throw new Error('User memory not found');
    
    const updated: UserMemory = {
      ...existing,
      preferences: {
        ...existing.preferences,
        ...(update.preferences || {}),
      },
      updatedAt: new Date(),
    };
    
    if (update.incrementStats) {
      const currentStats = existing.stats || {
        totalSessions: 0,
        totalActions: 0,
        favoriteSkills: [],
      };
      
      updated.stats = {
        totalSessions: update.incrementStats.sessions
          ? currentStats.totalSessions + 1
          : currentStats.totalSessions,
        totalActions: update.incrementStats.actions
          ? currentStats.totalActions + 1
          : currentStats.totalActions,
        favoriteSkills: update.incrementStats.addFavoriteSkill
          ? [...currentStats.favoriteSkills, update.incrementStats.addFavoriteSkill]
          : currentStats.favoriteSkills,
        lastLogin: update.incrementStats.sessions ? new Date() : currentStats.lastLogin,
      };
    }
    
    this.users.set(update.userId, updated);
  }
  
  async deleteUserMemory(userId: string): Promise<void> {
    this.users.delete(userId);
  }
}

describe('MemoryStore', () => {
  let store: IMemoryStore;
  
  beforeEach(() => {
    store = new MockMemoryStore();
  });
  
  describe('ProjectMemory', () => {
    it('dovrebbe salvare e leggere ProjectMemory', async () => {
      const memory: ProjectMemory = {
        projectId: 'proj123',
        projectName: 'Test Project',
        defaults: {
          discountRate: 0.12,
          marginTarget: 0.20,
          currency: 'EUR',
          contingency: 0.10,
          salesCommission: 0.03,
        },
        history: [],
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Save
      await store.setProjectMemory(memory);
      
      // Read
      const retrieved = await store.getProjectMemory('proj123');
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.projectId).toBe('proj123');
      expect(retrieved?.projectName).toBe('Test Project');
      expect(retrieved?.defaults.discountRate).toBe(0.12);
      expect(retrieved?.defaults.marginTarget).toBe(0.20);
      
      console.log('✅ ProjectMemory write/read OK');
    });
    
    it('dovrebbe aggiornare defaults di ProjectMemory', async () => {
      // Setup
      const initial: ProjectMemory = {
        projectId: 'proj123',
        defaults: {
          discountRate: 0.12,
          marginTarget: 0.20,
          currency: 'EUR',
          contingency: 0.10,
          salesCommission: 0.03,
        },
        history: [],
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await store.setProjectMemory(initial);
      
      // Update
      await store.updateProjectMemory({
        projectId: 'proj123',
        defaults: {
          discountRate: 0.15, // Changed
          marginTarget: 0.25, // Changed
        },
      });
      
      // Verify
      const updated = await store.getProjectMemory('proj123');
      
      expect(updated?.defaults.discountRate).toBe(0.15);
      expect(updated?.defaults.marginTarget).toBe(0.25);
      expect(updated?.defaults.currency).toBe('EUR'); // Unchanged
      
      console.log('✅ ProjectMemory update OK');
    });
    
    it('dovrebbe aggiungere history item', async () => {
      // Setup
      const initial: ProjectMemory = {
        projectId: 'proj123',
        defaults: {
          discountRate: 0.12,
          marginTarget: 0.20,
          currency: 'EUR',
          contingency: 0.10,
          salesCommission: 0.03,
        },
        history: [],
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await store.setProjectMemory(initial);
      
      // Add history
      await store.updateProjectMemory({
        projectId: 'proj123',
        addHistoryItem: {
          actionType: 'business_plan',
          timestamp: new Date(),
          inputs: { units: 4, price: 390000 },
          outcome: 'success',
          artifacts: ['bp_123.pdf'],
        },
      });
      
      // Verify
      const updated = await store.getProjectMemory('proj123');
      
      expect(updated?.history).toHaveLength(1);
      expect(updated?.history[0].actionType).toBe('business_plan');
      expect(updated?.history[0].outcome).toBe('success');
      
      console.log('✅ ProjectMemory history add OK');
    });
    
    it('dovrebbe eliminare ProjectMemory', async () => {
      const memory: ProjectMemory = {
        projectId: 'proj123',
        defaults: {
          discountRate: 0.12,
          marginTarget: 0.20,
          currency: 'EUR',
          contingency: 0.10,
          salesCommission: 0.03,
        },
        history: [],
        lastAccessed: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await store.setProjectMemory(memory);
      await store.deleteProjectMemory('proj123');
      
      const retrieved = await store.getProjectMemory('proj123');
      expect(retrieved).toBeNull();
      
      console.log('✅ ProjectMemory delete OK');
    });
  });
  
  describe('SessionMemory', () => {
    it('dovrebbe salvare e leggere SessionMemory', async () => {
      const memory: SessionMemory = {
        sessionId: 'sess123',
        userId: 'user456',
        projectId: 'proj789',
        recentParams: { units: 4, price: 390000 },
        lastSkills: [
          {
            skillId: 'business_plan.run',
            timestamp: new Date(),
            success: true,
            inputs: {},
          },
        ],
        messageCount: 5,
        startedAt: new Date(),
        lastActivityAt: new Date(),
      };
      
      await store.setSessionMemory(memory);
      
      const retrieved = await store.getSessionMemory('sess123');
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.sessionId).toBe('sess123');
      expect(retrieved?.userId).toBe('user456');
      expect(retrieved?.messageCount).toBe(5);
      expect(retrieved?.lastSkills).toHaveLength(1);
      
      console.log('✅ SessionMemory write/read OK');
    });
    
    it('dovrebbe aggiornare recentParams', async () => {
      const initial: SessionMemory = {
        sessionId: 'sess123',
        userId: 'user456',
        recentParams: { units: 4 },
        lastSkills: [],
        messageCount: 0,
        startedAt: new Date(),
        lastActivityAt: new Date(),
      };
      
      await store.setSessionMemory(initial);
      
      await store.updateSessionMemory({
        sessionId: 'sess123',
        recentParams: { price: 390000 }, // Add new param
      });
      
      const updated = await store.getSessionMemory('sess123');
      
      expect(updated?.recentParams.units).toBe(4); // Preserved
      expect(updated?.recentParams.price).toBe(390000); // Added
      
      console.log('✅ SessionMemory recentParams update OK');
    });
    
    it('dovrebbe incrementare messageCount', async () => {
      const initial: SessionMemory = {
        sessionId: 'sess123',
        userId: 'user456',
        recentParams: {},
        lastSkills: [],
        messageCount: 5,
        startedAt: new Date(),
        lastActivityAt: new Date(),
      };
      
      await store.setSessionMemory(initial);
      
      await store.updateSessionMemory({
        sessionId: 'sess123',
        incrementMessageCount: true,
      });
      
      const updated = await store.getSessionMemory('sess123');
      
      expect(updated?.messageCount).toBe(6);
      
      console.log('✅ SessionMemory messageCount increment OK');
    });
  });
  
  describe('UserMemory', () => {
    it('dovrebbe salvare e leggere UserMemory', async () => {
      const memory: UserMemory = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
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
      
      await store.setUserMemory(memory);
      
      const retrieved = await store.getUserMemory('user123');
      
      expect(retrieved).not.toBeNull();
      expect(retrieved?.userId).toBe('user123');
      expect(retrieved?.email).toBe('test@example.com');
      expect(retrieved?.preferences.tone).toBe('detailed');
      expect(retrieved?.preferences.exportFormat).toBe('pdf');
      
      console.log('✅ UserMemory write/read OK');
    });
    
    it('dovrebbe aggiornare preferences', async () => {
      const initial: UserMemory = {
        userId: 'user123',
        preferences: {
          tone: 'brief',
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
      
      await store.setUserMemory(initial);
      
      await store.updateUserMemory({
        userId: 'user123',
        preferences: {
          tone: 'detailed', // Changed
          exportFormat: 'excel', // Changed
        },
      });
      
      const updated = await store.getUserMemory('user123');
      
      expect(updated?.preferences.tone).toBe('detailed');
      expect(updated?.preferences.exportFormat).toBe('excel');
      expect(updated?.preferences.language).toBe('it'); // Unchanged
      
      console.log('✅ UserMemory preferences update OK');
    });
    
    it('dovrebbe incrementare stats', async () => {
      const initial: UserMemory = {
        userId: 'user123',
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
        stats: {
          totalSessions: 5,
          totalActions: 20,
          favoriteSkills: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await store.setUserMemory(initial);
      
      await store.updateUserMemory({
        userId: 'user123',
        incrementStats: {
          sessions: true,
          actions: true,
          addFavoriteSkill: 'business_plan.run',
        },
      });
      
      const updated = await store.getUserMemory('user123');
      
      expect(updated?.stats?.totalSessions).toBe(6);
      expect(updated?.stats?.totalActions).toBe(21);
      expect(updated?.stats?.favoriteSkills).toContain('business_plan.run');
      
      console.log('✅ UserMemory stats increment OK');
    });
  });
});

