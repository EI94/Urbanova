export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  avatar?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    sidebarCollapsed: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: Date;
    loginHistory: LoginAttempt[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginAttempt {
  id: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  location?: string;
}

export interface AvatarUpload {
  file: File;
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
  role?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  currency?: string;
}
