// 🧠 MEMORY TYPES - Memorie multilivello per OS 2.0
// ProjectMemory, SessionMemory, UserMemory

import { z } from 'zod';

/**
 * PROJECT MEMORY - Defaults e storico per progetto
 */
export const ProjectMemoryDefaultsSchema = z.object({
  discountRate: z.number().min(0).max(1).default(0.12), // 12% default
  marginTarget: z.number().min(0).max(1).default(0.20), // 20% target margin
  currency: z.string().default('EUR'),
  timing: z.object({
    constructionMonths: z.number().int().positive().default(18),
    salesMonths: z.number().int().positive().default(24),
  }).optional(),
  contingency: z.number().min(0).max(1).default(0.10), // 10% contingency
  salesCommission: z.number().min(0).max(1).default(0.03), // 3% commission
});

export type ProjectMemoryDefaults = z.infer<typeof ProjectMemoryDefaultsSchema>;

export const ProjectMemoryHistoryItemSchema = z.object({
  actionType: z.enum(['business_plan', 'sensitivity', 'rdo', 'export', 'feasibility']),
  timestamp: z.date(),
  inputs: z.record(z.unknown()),
  outcome: z.enum(['success', 'failed', 'cancelled']),
  artifacts: z.array(z.string()).optional(), // URLs or IDs
});

export type ProjectMemoryHistoryItem = z.infer<typeof ProjectMemoryHistoryItemSchema>;

export const ProjectMemorySchema = z.object({
  projectId: z.string(),
  projectName: z.string().optional(),
  defaults: ProjectMemoryDefaultsSchema,
  history: z.array(ProjectMemoryHistoryItemSchema).default([]),
  lastAccessed: z.date().default(() => new Date()),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type ProjectMemory = z.infer<typeof ProjectMemorySchema>;

/**
 * SESSION MEMORY - Parametri recenti e skills usate nella sessione
 */
export const SessionMemorySchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  projectId: z.string().optional(),
  
  // Parametri usati recentemente (per autocomplete intelligente)
  recentParams: z.record(z.unknown()).default({}),
  
  // Ultime skill eseguite
  lastSkills: z.array(z.object({
    skillId: z.string(),
    timestamp: z.date(),
    success: z.boolean(),
    inputs: z.record(z.unknown()).optional(),
  })).default([]),
  
  // Conversazione context
  messageCount: z.number().int().default(0),
  
  startedAt: z.date().default(() => new Date()),
  lastActivityAt: z.date().default(() => new Date()),
});

export type SessionMemory = z.infer<typeof SessionMemorySchema>;

/**
 * USER MEMORY - Preferenze utente globali
 */
export const UserMemoryPreferencesSchema = z.object({
  tone: z.enum(['brief', 'detailed', 'technical']).default('detailed'),
  exportFormat: z.enum(['pdf', 'excel', 'both']).default('pdf'),
  language: z.string().default('it'),
  notifications: z.boolean().default(true),
  
  // Display preferences
  showAdvancedOptions: z.boolean().default(false),
  autoSaveDrafts: z.boolean().default(true),
  
  // Business preferences
  defaultCurrency: z.string().default('EUR'),
  defaultDiscountRate: z.number().min(0).max(1).default(0.12),
  defaultMarginTarget: z.number().min(0).max(1).default(0.20),
});

export type UserMemoryPreferences = z.infer<typeof UserMemoryPreferencesSchema>;

export const UserMemorySchema = z.object({
  userId: z.string(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  
  preferences: UserMemoryPreferencesSchema,
  
  // Statistiche utilizzo
  stats: z.object({
    totalSessions: z.number().int().default(0),
    totalActions: z.number().int().default(0),
    favoriteSkills: z.array(z.string()).default([]),
    lastLogin: z.date().optional(),
  }).optional(),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserMemory = z.infer<typeof UserMemorySchema>;

/**
 * MEMORY UPDATE - Partial update per modifiche incrementali
 */
export interface ProjectMemoryUpdate {
  projectId: string;
  defaults?: Partial<ProjectMemoryDefaults>;
  addHistoryItem?: ProjectMemoryHistoryItem;
}

export interface SessionMemoryUpdate {
  sessionId: string;
  recentParams?: Record<string, unknown>;
  addSkill?: SessionMemory['lastSkills'][0];
  incrementMessageCount?: boolean;
}

export interface UserMemoryUpdate {
  userId: string;
  preferences?: Partial<UserMemoryPreferences>;
  incrementStats?: {
    sessions?: boolean;
    actions?: boolean;
    addFavoriteSkill?: string;
  };
}

