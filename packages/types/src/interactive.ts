import { z } from 'zod';

// Session status enum
export const SessionStatus = {
  COLLECTING: 'collecting',
  AWAITING_CONFIRM: 'awaiting_confirm',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

// Plan step with tool action
export const zPlanStep = z.object({
  id: z.string(),
  toolId: z.string(),
  action: z.string(),
  description: z.string(),
  zArgs: z.record(z.unknown()).optional(), // Will be validated against ToolActionSpec.zArgs later
  requiredRole: z.string(),
  confirm: z.boolean().optional(),
  longRunning: z.boolean().optional(),
  order: z.number(),
  dependencies: z.array(z.string()).optional(), // IDs of steps this depends on
  onFailure: z.enum(['stop', 'continue']).optional(),
  rollback: z
    .object({
      toolId: z.string(),
      action: z.string(),
      args: z.record(z.unknown()),
    })
    .optional(),
});

// Requirements and assumptions
export const zRequirement = z.object({
  id: z.string(),
  field: z.string(),
  description: z.string(),
  type: z.enum(['text', 'number', 'select', 'date', 'boolean']),
  required: z.boolean(),
  currentValue: z.unknown().optional(),
  options: z.array(z.string()).optional(), // For select fields
});

export const zAssumption = z.object({
  id: z.string(),
  description: z.string(),
  confidence: z.enum(['low', 'medium', 'high']),
  source: z.string().optional(),
});

export const zRisk = z.object({
  id: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  mitigation: z.string().optional(),
});

// Plan structure
export const zInteractivePlan = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  steps: z.array(zPlanStep),
  requirements: z.array(zRequirement),
  assumptions: z.array(zAssumption),
  risks: z.array(zRisk),
  estimatedDuration: z.number().optional(), // in minutes
  totalCost: z.number().optional(), // if applicable
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User replies to plan
export const zUserReply = z.object({
  id: z.string(),
  type: z.enum(['confirm', 'edit', 'dryrun', 'cancel', 'provide_value']),
  timestamp: z.date(),
  userId: z.string(),
  data: z.record(z.unknown()).optional(), // For edit/provide_value replies
});

// Task session
export const zTaskSession = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  userId: z.string(),
  status: z.nativeEnum(SessionStatus),
  plan: zInteractivePlan,
  replies: z.array(zUserReply),
  currentStep: z.number().optional(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Plan validation result
export const zPlanValidation = z.object({
  missing: z.array(zRequirement),
  ready: z.boolean(),
  warnings: z.array(z.string()),
  errors: z.array(z.string()),
});

// Plan preview for chat rendering
export const zPlanPreview = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      toolId: z.string(),
      action: z.string(),
      status: z.enum(['pending', 'ready', 'running', 'completed', 'failed']).optional(),
    })
  ),
  missing: z.array(zRequirement),
  assumptions: z.array(zAssumption),
  risks: z.array(zRisk),
  estimatedDuration: z.number().optional(),
  totalCost: z.number().optional(),
  ctas: z.array(z.enum(['confirm', 'edit', 'dryrun', 'cancel'])),
});

// ToolRun types are now defined in tools.ts to avoid conflicts

// Export all schemas
export const schemas = {
  zPlanStep,
  zRequirement,
  zAssumption,
  zRisk,
  zInteractivePlan,
  zUserReply,
  zTaskSession,
  zPlanValidation,
  zPlanPreview,
};

// Export all types
export type InteractivePlanStep = z.infer<typeof zPlanStep>;
export type InteractiveRequirement = z.infer<typeof zRequirement>;
export type InteractiveAssumption = z.infer<typeof zAssumption>;
export type InteractiveRisk = z.infer<typeof zRisk>;
export type InteractivePlan = z.infer<typeof zInteractivePlan>;
export type InteractiveUserReply = z.infer<typeof zUserReply>;
export type InteractiveTaskSession = z.infer<typeof zTaskSession>;
export type InteractivePlanValidation = z.infer<typeof zPlanValidation>;
export type InteractivePlanPreview = z.infer<typeof zPlanPreview>;
// Export types from tools.ts
export type { ToolRunSubStep, ToolRun } from './tools';
