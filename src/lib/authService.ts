import { prisma } from './database';
import { userProfileService } from './userProfileService';
import { notificationService } from './notificationService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// Interfacce per l'autenticazione
interface User {
  id: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: string;
  avatar: string | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

interface SignupData {
  email: string;
  password: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
}

class AuthService {
  private static instance: AuthService;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;

  private constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here-change-in-production';
    this.JWT_EXPIRES_IN = '15m';
    this.REFRESH_TOKEN_EXPIRES_IN = '7d';
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ========================================
  // REGISTRAZIONE UTENTE
  // ========================================

  async signup(data: SignupData): Promise<AuthResult> {
    try {
      // Verifica se l'utente esiste già
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash della password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Crea l'utente
      const user = await prisma.user.create({
        data: {
          email: data.email,
          displayName: data.displayName || data.email.split('@')[0],
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'USER',
          status: 'ACTIVE',
          timezone: 'Europe/Rome',
          language: 'it',
          dateFormat: 'DD/MM/YYYY',
          currency: 'EUR'
        }
      });

      // Crea profilo di default
      await userProfileService.createDefaultProfile(user.id, {
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName
      });

      // Genera token
      const token = this.generateJWT(user);
      const refreshToken = this.generateRefreshToken(user.id);

      // Salva refresh token
      await this.saveRefreshToken(user.id, refreshToken);

      // Registra il login
      await userProfileService.recordLoginAttempt(user.id, {
        timestamp: new Date(),
        ipAddress: '127.0.0.1', // In produzione, ottieni l'IP reale
        userAgent: 'Urbanova Signup',
        location: 'Unknown',
        success: true,
        metadata: { action: 'signup' }
      });

      // Crea notifica di benvenuto
      await notificationService.createNotification({
        userId: user.id,
        type: 'SYSTEM',
        priority: 'MEDIUM',
        title: 'Benvenuto in Urbanova AI!',
        message: 'Il tuo account è stato creato con successo. Inizia a esplorare le funzionalità!',
        data: { action: 'welcome' }
      });

      // Traccia l'attività
      await userProfileService.trackUserActivity(user.id, {
        event: 'USER_SIGNUP',
        category: 'authentication',
        action: 'signup',
        label: 'success',
        metadata: { method: 'email' }
      });

      return {
        user: this.mapToUserType(user),
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  // ========================================
  // LOGIN UTENTE
  // ========================================

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Trova l'utente
      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verifica lo stato dell'utente
      if (user.status !== 'ACTIVE') {
        throw new Error('Account is not active');
      }

      // Verifica la password (in produzione, dovresti avere un campo password)
      // Per ora, simuliamo la verifica
      const isValidPassword = true; // In produzione: await bcrypt.compare(credentials.password, user.password)

      if (!isValidPassword) {
        // Registra tentativo fallito
        await userProfileService.recordLoginAttempt(user.id, {
          timestamp: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'Urbanova Login',
          location: 'Unknown',
          success: false,
          metadata: { reason: 'invalid_password' }
        });

        throw new Error('Invalid credentials');
      }

      // Verifica 2FA se abilitato
      if (user.twoFactorEnabled && !credentials.twoFactorCode) {
        throw new Error('2FA code required');
      }

      // Genera token
      const token = this.generateJWT(user);
      const refreshToken = this.generateRefreshToken(user.id);

      // Salva refresh token
      await this.saveRefreshToken(user.id, refreshToken);

      // Aggiorna ultimo login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Registra il login
      await userProfileService.recordLoginAttempt(user.id, {
        timestamp: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Urbanova Login',
        location: 'Unknown',
        success: true,
        metadata: { action: 'login', rememberMe: credentials.rememberMe }
      });

      // Traccia l'attività
      await userProfileService.trackUserActivity(user.id, {
        event: 'USER_LOGIN',
        category: 'authentication',
        action: 'login',
        label: 'success',
        metadata: { method: 'email', rememberMe: credentials.rememberMe }
      });

      return {
        user: this.mapToUserType(user),
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  // ========================================
  // LOGOUT UTENTE
  // ========================================

  async logout(userId: string, token: string): Promise<void> {
    try {
      // Invalida il refresh token
      await this.invalidateRefreshToken(userId, token);

      // Traccia l'attività
      await userProfileService.trackUserActivity(userId, {
        event: 'USER_LOGOUT',
        category: 'authentication',
        action: 'logout',
        label: 'success'
      });

      // Registra nel log di audit
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'USER_LOGOUT',
          resource: 'user',
          resourceId: userId,
          details: { timestamp: new Date() }
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verifica il refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
      
      if (!decoded.userId || decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Verifica se il token è ancora valido nel database
      const storedToken = await prisma.apiKey.findFirst({
        where: {
          userId: decoded.userId,
          key: refreshToken,
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });

      if (!storedToken) {
        throw new Error('Refresh token expired or invalid');
      }

      // Ottieni l'utente
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new Error('User not found or inactive');
      }

      // Genera nuovi token
      const newToken = this.generateJWT(user);
      const newRefreshToken = this.generateRefreshToken(user.id);

      // Invalida il vecchio refresh token e salva il nuovo
      await this.invalidateRefreshToken(decoded.userId, refreshToken);
      await this.saveRefreshToken(decoded.userId, newRefreshToken);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // ========================================
  // VERIFICA TOKEN
  // ========================================

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      if (!decoded.userId) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.status !== 'ACTIVE') {
        return null;
      }

      return this.mapToUserType(user);
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  // ========================================
  // RESET PASSWORD
  // ========================================

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Per sicurezza, non rivelare se l'email esiste
        return;
      }

      // Genera token di reset
      const resetToken = this.generatePasswordResetToken(user.id);
      const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 ora

      // Salva il token di reset
      await prisma.apiKey.create({
        data: {
          userId: user.id,
          name: 'Password Reset',
          key: resetToken,
          permissions: ['PASSWORD_RESET'],
          expiresAt: resetTokenExpiry,
          isActive: true
        }
      });

      // Invia email di reset (in produzione, usa un servizio email reale)
      console.log(`Password reset token for ${email}: ${resetToken}`);

      // Traccia l'attività
      await userProfileService.trackUserActivity(user.id, {
        event: 'PASSWORD_RESET_REQUESTED',
        category: 'security',
        action: 'password_reset_request',
        label: 'success'
      });
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Trova il token di reset
      const resetToken = await prisma.apiKey.findFirst({
        where: {
          key: token,
          name: 'Password Reset',
          permissions: { has: 'PASSWORD_RESET' },
          isActive: true,
          expiresAt: { gt: new Date() }
        }
      });

      if (!resetToken) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash della nuova password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Aggiorna la password (in produzione, dovresti avere un campo password)
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { updatedAt: new Date() }
      });

      // Invalida il token di reset
      await prisma.apiKey.update({
        where: { id: resetToken.id },
        data: { isActive: false }
      });

      // Registra nel log di audit
      await prisma.auditLog.create({
        data: {
          userId: resetToken.userId,
          action: 'PASSWORD_RESET',
          resource: 'user',
          resourceId: resetToken.userId,
          details: { timestamp: new Date() }
        }
      });

      // Traccia l'attività
      await userProfileService.trackUserActivity(resetToken.userId, {
        event: 'PASSWORD_RESET_COMPLETED',
        category: 'security',
        action: 'password_reset_complete',
        label: 'success'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // ========================================
  // GESTIONE SESSIONI
  // ========================================

  async getUserSessions(userId: string): Promise<Array<{
    id: string;
    name: string;
    lastUsedAt: Date;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
  }>> {
    try {
      const sessions = await prisma.apiKey.findMany({
        where: {
          userId,
          permissions: { has: 'AUTH' },
          isActive: true
        },
        orderBy: { lastUsedAt: 'desc' }
      });

      return sessions.map(session => ({
        id: session.id,
        name: session.name,
        lastUsedAt: session.lastUsedAt || session.createdAt,
        ipAddress: 'Unknown', // In produzione, salva l'IP
        userAgent: 'Unknown', // In produzione, salva l'user agent
        isActive: session.isActive
      }));
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    try {
      await prisma.apiKey.update({
        where: {
          id: sessionId,
          userId // Sicurezza: solo il proprietario può revocare
        },
        data: { isActive: false }
      });

      // Traccia l'attività
      await userProfileService.trackUserActivity(userId, {
        event: 'SESSION_REVOKED',
        category: 'security',
        action: 'session_revoke',
        label: 'success',
        metadata: { sessionId }
      });
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }

  // ========================================
  // UTILITY E HELPERS
  // ========================================

  private generateJWT(user: any): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minuti
      type: 'access'
    };

    return jwt.sign(payload, this.JWT_SECRET);
  }

  private generateRefreshToken(userId: string): string {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 giorni
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_SECRET);
  }

  private generatePasswordResetToken(userId: string): string {
    return randomBytes(32).toString('hex');
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 giorni

    await prisma.apiKey.create({
      data: {
        userId,
        name: 'Authentication',
        key: refreshToken,
        permissions: ['AUTH'],
        expiresAt,
        isActive: true
      }
    });
  }

  private async invalidateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await prisma.apiKey.updateMany({
      where: {
        userId,
        key: refreshToken,
        permissions: { has: 'AUTH' }
      },
      data: { isActive: false }
    });
  }

  private mapToUserType(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
      status: dbUser.status,
      avatar: dbUser.avatar,
      twoFactorEnabled: dbUser.twoFactorEnabled,
      createdAt: dbUser.createdAt,
      lastLoginAt: dbUser.lastLoginAt
    };
  }

  // ========================================
  // VALIDAZIONE E SICUREZZA
  // ========================================

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ========================================
  // MIGRAZIONE E COMPATIBILITÀ
  // ========================================

  async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      // Migra profilo utente
      await userProfileService.migrateFromLocalStorage(userId);

      // Migra notifiche
      await notificationService.migrateFromLocalStorage(userId);

      console.log(`✅ Completed migration for user ${userId}`);
    } catch (error) {
      console.error('Error during migration:', error);
    }
  }
}

export const authService = AuthService.getInstance();
