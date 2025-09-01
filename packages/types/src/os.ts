// Urbanova OS Types - Capability-based Operating System
import { z } from 'zod';

// ===========================================
// CAPABILITY SYSTEM
// ===========================================

export interface CapabilitySpec {
  name: string;
  description: string;
  zArgs: z.ZodSchema<any>;
  requiredRole: 'owner' | 'pm' | 'sales' | 'vendor';
  confirm?: boolean;
  dryRun?: boolean;
}

export interface CapabilityContext {
  userId: string;
  sender: string;
  projectId?: string;
  now: Date;
  logger: Logger;
  db: any; // Firestore instance
}

export interface Capability {
  spec: CapabilitySpec;
  handler: (ctx: CapabilityContext, args: any) => Promise<any>;
}

// ===========================================
// PLANNER & ROUTER
// ===========================================

export type PlanMode = 'QNA' | 'ACTION';

export interface Plan {
  mode: PlanMode;
  intent?: string;
  args?: any;
  confidence: number;
  projectId?: string;
}

export interface QnaAnswer {
  answer: string;
  citations: Array<{
    title?: string;
    docId: string;
    page?: number;
    url?: string;
  }>;
}

// ===========================================
// SEMANTIC STORE
// ===========================================

export interface ProjectSemanticKPI {
  projectId: string;
  timestamp: Date;
  metrics: {
    totalBudget: number;
    currentSpend: number;
    progress: number;
    roi: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    status: string;
  };
  lastUpdated: Date;
}

export interface ProjectSemanticIndex {
  projectId: string;
  documents: Array<{
    docId: string;
    title: string;
    textSnippet: string;
    url?: string;
    type: string;
    lastModified: Date;
  }>;
  lastIndexed: Date;
}

// ===========================================
// ZOD SCHEMAS
// ===========================================

export const zCapabilitySpec = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  zArgs: z.any(), // Zod schema
  requiredRole: z.enum(['owner', 'pm', 'sales', 'vendor']),
  confirm: z.boolean().optional(),
  dryRun: z.boolean().optional(),
});

export const zCapabilityContext = z.object({
  userId: z.string().min(1),
  sender: z.string().min(1),
  projectId: z.string().optional(),
  now: z.date(),
  logger: z.any(), // Logger instance
  db: z.any(), // Firestore instance
});

export const zPlan = z.object({
  mode: z.enum(['QNA', 'ACTION']),
  intent: z.string().optional(),
  args: z.any().optional(),
  confidence: z.number().min(0).max(1),
  projectId: z.string().optional(),
});

export const zQnaAnswer = z.object({
  answer: z.string().min(1),
  citations: z.array(
    z.object({
      title: z.string().optional(),
      docId: z.string().min(1),
      page: z.number().optional(),
      url: z.string().optional(),
    })
  ),
});

export const zProjectSemanticKPI = z.object({
  projectId: z.string().min(1),
  timestamp: z.date(),
  metrics: z.object({
    totalBudget: z.number(),
    currentSpend: z.number(),
    progress: z.number().min(0).max(100),
    roi: z.number(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    status: z.string(),
  }),
  lastUpdated: z.date(),
});

export const zProjectSemanticIndex = z.object({
  projectId: z.string().min(1),
  documents: z.array(
    z.object({
      docId: z.string().min(1),
      title: z.string(),
      textSnippet: z.string(),
      url: z.string().optional(),
      type: z.string(),
      lastModified: z.date(),
    })
  ),
  lastIndexed: z.date(),
});

// ===========================================
// LOGGER INTERFACE
// ===========================================

export interface Logger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}

// ===========================================
// EXECUTION RESULT
// ===========================================

export interface CapabilityExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  capability: string;
  args: any;
}

export interface QnaExecutionResult {
  success: boolean;
  answer?: QnaAnswer;
  error?: string;
  executionTime: number;
  query: string;
  projectId?: string;
}
