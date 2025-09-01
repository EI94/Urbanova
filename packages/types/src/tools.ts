// Urbanova Tool OS Types
import { z } from 'zod';

// ===========================================
// TOOL MANIFEST
// ===========================================

export interface ToolManifest {
  id: string;
  name: string;
  version: string;
  icon?: string;
  category: ToolCategory;
  description: string;
  author?: string;
  website?: string;
  intents?: string[];
  tags?: string[];
  dependencies?: string[];
}

export type ToolCategory =
  | 'feasibility'
  | 'scraping'
  | 'analysis'
  | 'integration'
  | 'automation'
  | 'reporting'
  | 'other';

export const zToolManifest = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  icon: z.string().url().optional(),
  category: z.enum([
    'feasibility',
    'scraping',
    'analysis',
    'integration',
    'automation',
    'reporting',
    'other',
  ]),
  description: z.string().min(10),
  author: z.string().optional(),
  website: z.string().url().optional(),
  intents: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
});

// ===========================================
// TOOL ACTION SPECIFICATION
// ===========================================

export interface ToolActionSpec {
  name: string;
  description: string;
  zArgs: z.ZodSchema<any>;
  requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
  confirm?: boolean;
  longRunning?: boolean;
  timeout?: number; // in seconds
  retryPolicy?: RetryPolicy;

  // Extended fields for PlanExecutionEngine
  onFailure?: 'stop' | 'continue';
  rollback?: {
    toolId: string;
    action: string;
    args: Record<string, unknown>;
  };
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  maxBackoffMs: number;
}

export const zToolActionSpec = z.object({
  name: z.string().min(1),
  description: z.string().min(10),
  zArgs: z.any(), // Zod schema
  requiredRole: z.enum(['owner', 'pm', 'sales', 'vendor', 'admin']),
  confirm: z.boolean().optional(),
  longRunning: z.boolean().optional(),
  timeout: z.number().positive().optional(),
  retryPolicy: z
    .object({
      maxRetries: z.number().min(0),
      backoffMs: z.number().positive(),
      maxBackoffMs: z.number().positive(),
    })
    .optional(),

  // Extended fields for PlanExecutionEngine
  onFailure: z.enum(['stop', 'continue']).optional(),
  rollback: z
    .object({
      toolId: z.string(),
      action: z.string(),
      args: z.record(z.unknown()),
    })
    .optional(),
});

// ===========================================
// TOOL INSTALLATION
// ===========================================

export interface ToolInstall {
  workspaceId: string;
  toolId: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  secrets?: Record<string, string>;
  installedAt: Date;
  updatedAt: Date;
  installedBy: string;
  version: string;
}

export const zToolInstall = z.object({
  workspaceId: z.string().min(1),
  toolId: z.string().min(1),
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
  secrets: z.record(z.string()).optional(),
  installedAt: z.date(),
  updatedAt: z.date(),
  installedBy: z.string().min(1),
  version: z.string().min(1),
});

// ===========================================
// TOOL RUN EXECUTION
// ==========================================

export interface ToolRunSubStep {
  stepId: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  startedAt: Date;
  finishedAt?: Date;
  outputRef?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface ToolRun {
  id: string;
  toolId: string;
  action: string;
  projectId?: string;
  workspaceId: string;
  userId: string;
  status: ToolRunStatus;
  startedAt: Date;
  finishedAt?: Date;
  args: Record<string, unknown>;
  output?: any;
  error?: string;
  logs: string[];
  progress?: number; // 0-100
  metadata?: Record<string, unknown>;
  cancelledAt?: Date;
  cancelledBy?: string;

  // Extended fields for PlanExecutionEngine
  sessionId?: string;
  planId?: string;
  subRuns?: ToolRunSubStep[];
  outputs?: Record<string, unknown>;
}

export type ToolRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export const zToolRunSubStep = z.object({
  stepId: z.string().min(1),
  status: z.enum(['pending', 'running', 'succeeded', 'failed', 'cancelled']),
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  outputRef: z.string().optional(),
  error: z.string().optional(),
  retryCount: z.number().min(0),
  maxRetries: z.number().min(1),
});

export const zToolRun = z.object({
  id: z.string().min(1),
  toolId: z.string().min(1),
  action: z.string().min(1),
  projectId: z.string().min(1).optional(),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  status: z.enum([
    'pending',
    'running',
    'completed',
    'succeeded',
    'failed',
    'cancelled',
    'timeout',
  ]),
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  args: z.record(z.unknown()),
  output: z.unknown().optional(),
  error: z.string().optional(),
  logs: z.array(z.string()),
  progress: z.number().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
  cancelledAt: z.date().optional(),
  cancelledBy: z.string().optional(),

  // Extended fields for PlanExecutionEngine
  sessionId: z.string().optional(),
  planId: z.string().optional(),
  subRuns: z.array(zToolRunSubStep).optional(),
  outputs: z.record(z.unknown()).optional(),
});

// ===========================================
// TOOL CONTEXT
// ===========================================

export interface ToolContext {
  userId: string;
  workspaceId: string;
  projectId?: string;
  userRole: string;
  now: Date;
  logger: ToolLogger;
  db: any; // Firestore instance
  onProgress?: (message: string) => void;
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;

  // Extended fields for PlanExecutionEngine
  stepId?: string;
  stepOrder?: number;
  isRollback?: boolean;
  isRetry?: boolean;
  retryCount?: number;
}

export interface ToolLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

// ===========================================
// TOOL DEFINITION
// ===========================================

export interface Tool {
  manifest: ToolManifest;
  actions: ToolActionSpec[];
  uiExtensions?: ToolUIExtension[];
}

export interface ToolUIExtension {
  type: 'button' | 'form' | 'widget';
  location: 'project-header' | 'project-sidebar' | 'dashboard' | 'chat';
  component: string;
  props?: Record<string, unknown>;
}

export const zTool = z.object({
  manifest: zToolManifest,
  actions: z.array(zToolActionSpec),
  uiExtensions: z
    .array(
      z.object({
        type: z.enum(['button', 'form', 'widget']),
        location: z.enum(['project-header', 'project-sidebar', 'dashboard', 'chat']),
        component: z.string(),
        props: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
});

// ===========================================
// TOOL EXECUTION RESULT
// ===========================================

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  toolId: string;
  action: string;
  runId: string;
  logs: string[];
  // Support for PlanExecutionEngine
  outputRef?: string;
}

export const zToolExecutionResult = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  executionTime: z.number().positive(),
  toolId: z.string().min(1),
  action: z.string().min(1),
  runId: z.string().min(1),
  logs: z.array(z.string()),
  // Support for PlanExecutionEngine
  outputRef: z.string().optional(),
});

// ===========================================
// TOOL REGISTRY
// ===========================================

export interface ToolRegistryStats {
  total: number;
  byCategory: Record<ToolCategory, number>;
  enabled: number;
  disabled: number;
}

export interface ToolSearchCriteria {
  category?: ToolCategory;
  tags?: string[];
  enabled?: boolean;
  search?: string;
}
