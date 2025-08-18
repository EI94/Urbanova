import { prisma } from './database';
import { 
  UserProfile, 
  ProfileUpdate, 
  PasswordChange, 
  AvatarUpload,
  LoginAttempt 
} from '@/types/userProfile';

class UserProfileService {
  private static instance: UserProfileService;

  private constructor() {}

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  // ========================================
  // GESTIONE PROFILO UTENTE
  // ========================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          notificationPreferences: true
        }
      });

      if (!user) return null;

      return this.mapToUserProfileType(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  async createDefaultProfile(userId: string, userData: {
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: userData.displayName || userData.email.split('@')[0],
          firstName: userData.firstName,
          lastName: userData.lastName,
          profile: {
            create: {
              company: '',
              position: '',
              bio: '',
              location: '',
              skills: [],
              interests: []
            }
          },
          notificationPreferences: {
            create: {
              emailEnabled: true,
              pushEnabled: true,
              smsEnabled: false,
              inAppEnabled: true,
              quietHoursEnabled: false,
              quietHoursStart: '22:00',
              quietHoursEnd: '08:00',
              timezone: 'Europe/Rome'
            }
          }
        },
        include: {
          profile: true,
          notificationPreferences: true
        }
      });

      this.emitEvent('profile_created', { profile: user });
      return this.mapToUserProfileType(user);
    } catch (error) {
      console.error('Error creating default profile:', error);
      throw new Error('Failed to create default profile');
    }
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<UserProfile> {
    try {
      const updateData: any = {};
      const profileUpdates: any = {};

      // Aggiorna campi principali dell'utente
      if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
      if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
      if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
      if (updates.timezone !== undefined) updateData.timezone = updates.timezone;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.dateFormat !== undefined) updateData.dateFormat = updates.dateFormat;
      if (updates.currency !== undefined) updateData.currency = updates.currency;

      // Aggiorna campi del profilo
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.company !== undefined) profileUpdates.company = updates.company;
      if (updates.position !== undefined) profileUpdates.position = updates.position;
      if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
      if (updates.website !== undefined) profileUpdates.website = updates.website;
      if (updates.linkedin !== undefined) profileUpdates.linkedin = updates.linkedin;
      if (updates.github !== undefined) profileUpdates.github = updates.github;
      if (updates.location !== undefined) profileUpdates.location = updates.location;
      if (updates.skills !== undefined) profileUpdates.skills = updates.skills;
      if (updates.interests !== undefined) profileUpdates.interests = updates.interests;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          profile: profileUpdates.phone || profileUpdates.company ? {
            upsert: {
              create: profileUpdates,
              update: profileUpdates
            }
          } : undefined
        },
        include: {
          profile: true,
          notificationPreferences: true
        }
      });

      this.emitEvent('profile_updated', { profile: user });
      return this.mapToUserProfileType(user);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        include: {
          profile: true,
          notificationPreferences: true
        }
      });

      this.emitEvent('avatar_updated', { profile: user });
      return this.mapToUserProfileType(user);
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw new Error('Failed to update avatar');
    }
  }

  async removeAvatar(userId: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
        include: {
          profile: true,
          notificationPreferences: true
        }
      });

      this.emitEvent('avatar_updated', { profile: user });
      return this.mapToUserProfileType(user);
    } catch (error) {
      console.error('Error removing avatar:', error);
      throw new Error('Failed to remove avatar');
    }
  }

  // ========================================
  // SICUREZZA E AUTENTICAZIONE
  // ========================================

  async changePassword(userId: string, passwordData: PasswordChange): Promise<void> {
    try {
      // In un'implementazione reale, qui verificheresti la password corrente
      // e hasheresti la nuova password prima di salvarla
      
      // Per ora, aggiorniamo solo il timestamp di modifica
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      });

      // Registra il tentativo di cambio password
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          resource: 'user',
          resourceId: userId,
          details: { timestamp: new Date() },
          ipAddress: passwordData.ipAddress,
          userAgent: passwordData.userAgent
        }
      });

      this.emitEvent('password_changed', { userId });
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Failed to change password');
    }
  }

  async toggleTwoFactor(userId: string, enabled: boolean): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          twoFactorEnabled: enabled,
          twoFactorSecret: enabled ? this.generateTwoFactorSecret() : null
        },
        include: {
          profile: true,
          notificationPreferences: true
        }
      });

      // Registra l'azione
      await prisma.auditLog.create({
        data: {
          userId,
          action: enabled ? '2FA_ENABLED' : '2FA_DISABLED',
          resource: 'user',
          resourceId: userId,
          details: { timestamp: new Date() }
        }
      });

      this.emitEvent('2fa_toggled', { profile: user, enabled });
      return this.mapToUserProfileType(user);
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      throw new Error('Failed to toggle 2FA');
    }
  }

  async recordLoginAttempt(userId: string, attempt: LoginAttempt): Promise<void> {
    try {
      await prisma.loginHistory.create({
        data: {
          userId,
          ipAddress: attempt.ipAddress,
          userAgent: attempt.userAgent,
          location: attempt.location,
          success: attempt.success,
          metadata: attempt.metadata
        }
      });

      if (attempt.success) {
        await prisma.user.update({
          where: { id: userId },
          data: { lastLoginAt: new Date() }
        });
      }
    } catch (error) {
      console.error('Error recording login attempt:', error);
      // Non lanciare errore per questo, non è critico
    }
  }

  async getLoginHistory(userId: string, limit: number = 20): Promise<LoginAttempt[]> {
    try {
      const history = await prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return history.map(record => ({
        timestamp: record.timestamp,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        location: record.location,
        success: record.success,
        metadata: record.metadata
      }));
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw new Error('Failed to fetch login history');
    }
  }

  // ========================================
  // PREFERENZE E IMPOSTAZIONI
  // ========================================

  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<{
      emailEnabled: boolean;
      pushEnabled: boolean;
      smsEnabled: boolean;
      inAppEnabled: boolean;
      quietHoursEnabled: boolean;
      quietHoursStart: string;
      quietHoursEnd: string;
      timezone: string;
    }>
  ): Promise<void> {
    try {
      await prisma.notificationPreferences.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences
        }
      });

      this.emitEvent('notification_preferences_updated', { userId, preferences });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  async getUserSettings(userId: string): Promise<{
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    twoFactorEnabled: boolean;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          timezone: true,
          language: true,
          dateFormat: true,
          currency: true,
          twoFactorEnabled: true
        }
      });

      if (!user) throw new Error('User not found');

      return user;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw new Error('Failed to fetch user settings');
    }
  }

  // ========================================
  // ANALYTICS E TRACKING
  // ========================================

  async trackUserActivity(userId: string, activity: {
    event: string;
    category?: string;
    action?: string;
    label?: string;
    value?: number;
    metadata?: any;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await prisma.userAnalytics.create({
        data: {
          userId,
          event: activity.event,
          category: activity.category,
          action: activity.action,
          label: activity.label,
          value: activity.value,
          metadata: activity.metadata,
          sessionId: activity.sessionId,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent
        }
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
      // Non lanciare errore per questo, non è critico
    }
  }

  async getUserAnalytics(userId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<{
    totalEvents: number;
    uniqueSessions: number;
    topEvents: Array<{ event: string; count: number }>;
    topCategories: Array<{ category: string; count: number }>;
  }> {
    try {
      const startDate = this.getStartDate(period);

      const [totalEvents, uniqueSessions, topEvents, topCategories] = await Promise.all([
        prisma.userAnalytics.count({
          where: {
            userId,
            timestamp: { gte: startDate }
          }
        }),
        prisma.userAnalytics.groupBy({
          by: ['sessionId'],
          where: {
            userId,
            timestamp: { gte: startDate }
          },
          _count: { sessionId: true }
        }),
        prisma.userAnalytics.groupBy({
          by: ['event'],
          where: {
            userId,
            timestamp: { gte: startDate }
          },
          _count: { event: true },
          orderBy: { _count: { event: 'desc' } },
          take: 10
        }),
        prisma.userAnalytics.groupBy({
          by: ['category'],
          where: {
            userId,
            timestamp: { gte: startDate }
          },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } },
          take: 10
        })
      ]);

      return {
        totalEvents,
        uniqueSessions: uniqueSessions.length,
        topEvents: topEvents.map(item => ({
          event: item.event,
          count: item._count.event
        })),
        topCategories: topCategories.map(item => ({
          category: item.category || 'Uncategorized',
          count: item._count.category
        }))
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw new Error('Failed to fetch user analytics');
    }
  }

  // ========================================
  // UTILITY E HELPERS
  // ========================================

  private mapToUserProfileType(dbUser: any): UserProfile {
    return {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      avatar: dbUser.avatar,
      role: dbUser.role,
      status: dbUser.status,
      timezone: dbUser.timezone,
      language: dbUser.language,
      dateFormat: dbUser.dateFormat,
      currency: dbUser.currency,
      twoFactorEnabled: dbUser.twoFactorEnabled,
      lastLoginAt: dbUser.lastLoginAt,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      profile: dbUser.profile ? {
        id: dbUser.profile.id,
        phone: dbUser.profile.phone,
        company: dbUser.profile.company,
        position: dbUser.profile.position,
        bio: dbUser.profile.bio,
        website: dbUser.profile.website,
        linkedin: dbUser.profile.linkedin,
        github: dbUser.profile.github,
        location: dbUser.profile.location,
        skills: dbUser.profile.skills,
        interests: dbUser.profile.interests,
        preferences: dbUser.profile.preferences,
        metadata: dbUser.profile.metadata,
        createdAt: dbUser.profile.createdAt,
        updatedAt: dbUser.profile.updatedAt
      } : null,
      notificationPreferences: dbUser.notificationPreferences ? {
        id: dbUser.notificationPreferences.id,
        emailEnabled: dbUser.notificationPreferences.emailEnabled,
        pushEnabled: dbUser.notificationPreferences.pushEnabled,
        smsEnabled: dbUser.notificationPreferences.smsEnabled,
        inAppEnabled: dbUser.notificationPreferences.inAppEnabled,
        quietHoursEnabled: dbUser.notificationPreferences.quietHoursEnabled,
        quietHoursStart: dbUser.notificationPreferences.quietHoursStart,
        quietHoursEnd: dbUser.notificationPreferences.quietHoursEnd,
        timezone: dbUser.notificationPreferences.timezone,
        preferences: dbUser.notificationPreferences.preferences,
        createdAt: dbUser.notificationPreferences.createdAt,
        updatedAt: dbUser.notificationPreferences.updatedAt
      } : null
    };
  }

  private generateTwoFactorSecret(): string {
    // Genera un segreto TOTP di 32 caratteri
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getStartDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        return new Date(now.getFullYear(), now.getMonth(), diff);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  // ========================================
  // EVENTI REAL-TIME
  // ========================================

  private emitEvent(type: string, data: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('urbanova-user-profile', {
        detail: { type, data }
      }));
    }
  }

  subscribe(callback: (event: CustomEvent) => void): () => void {
    if (typeof window !== 'undefined') {
      window.addEventListener('urbanova-user-profile', callback);
      return () => window.removeEventListener('urbanova-user-profile', callback);
    }
    return () => {};
  }

  // ========================================
  // MIGRAZIONE E COMPATIBILITÀ
  // ========================================

  async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const storageKey = `urbanova-user-profile-${userId}`;
      const storedProfile = localStorage.getItem(storageKey);

      if (storedProfile) {
        const profileData = JSON.parse(storedProfile);
        
        // Migra solo i dati validi
        const validUpdates: ProfileUpdate = {};
        
        if (profileData.displayName) validUpdates.displayName = profileData.displayName;
        if (profileData.firstName) validUpdates.firstName = profileData.firstName;
        if (profileData.lastName) validUpdates.lastName = profileData.lastName;
        if (profileData.phone) validUpdates.phone = profileData.phone;
        if (profileData.company) validUpdates.company = profileData.company;
        if (profileData.position) validUpdates.position = profileData.position;
        if (profileData.bio) validUpdates.bio = profileData.bio;
        if (profileData.website) validUpdates.website = profileData.website;
        if (profileData.linkedin) validUpdates.linkedin = profileData.linkedin;
        if (profileData.github) validUpdates.github = profileData.github;
        if (profileData.location) validUpdates.location = profileData.location;
        if (profileData.skills) validUpdates.skills = profileData.skills;
        if (profileData.interests) validUpdates.interests = profileData.interests;

        if (Object.keys(validUpdates).length > 0) {
          await this.updateProfile(userId, validUpdates);
        }

        // Rimuovi i dati dal localStorage dopo la migrazione
        localStorage.removeItem(storageKey);
        console.log(`✅ Migrated user profile for user ${userId}`);
      }
    } catch (error) {
      console.error('Error migrating user profile from localStorage:', error);
    }
  }
}

export const userProfileService = UserProfileService.getInstance();
