// Core Capabilities Types - Urbanova OS
import { z } from 'zod';

// ===========================================
// PROJECT GET SUMMARY CAPABILITY
// ===========================================

export const zProjectSummaryArgs = z.object({
  projectId: z.string().min(1),
});

export interface ProjectSummary {
  roi?: number;
  marginPct?: number;
  paybackYears?: number;
  docs: {
    complete: number;
    total: number;
    missing: string[];
  };
  milestones: Array<{
    title: string;
    due: string;
    status: 'due' | 'overdue' | 'ok';
  }>;
}

export const zProjectSummary = z.object({
  roi: z.number().optional(),
  marginPct: z.number().optional(),
  paybackYears: z.number().optional(),
  docs: z.object({
    complete: z.number(),
    total: z.number(),
    missing: z.array(z.string()),
  }),
  milestones: z.array(
    z.object({
      title: z.string(),
      due: z.string(),
      status: z.enum(['due', 'overdue', 'ok']),
    })
  ),
});

// ===========================================
// FEASIBILITY SENSITIVITY CAPABILITY
// ===========================================

export const zSensitivityArgs = z.object({
  projectId: z.string().min(1),
  deltas: z.array(z.number().min(-0.2).max(0.2)).min(1).max(10),
});

export interface SensitivityResult {
  baseRoi: number;
  range: {
    min: number;
    max: number;
  };
  pdfUrl: string;
}

export const zSensitivityResult = z.object({
  baseRoi: z.number(),
  range: z.object({
    min: z.number(),
    max: z.number(),
  }),
  pdfUrl: z.string().url(),
});

// ===========================================
// CAPABILITY EXECUTION RESULTS
// ===========================================

export interface ProjectSummaryResult {
  success: boolean;
  data?: ProjectSummary;
  error?: string;
  executionTime: number;
  projectId: string;
}

export interface SensitivityExecutionResult {
  success: boolean;
  data?: SensitivityResult;
  error?: string;
  executionTime: number;
  projectId: string;
  deltas: number[];
}

// ===========================================
// CHAT INTENT PATTERNS
// ===========================================

export interface ChatIntentPattern {
  summary: string[];
  sensitivity: string[];
}

export const CHAT_INTENT_PATTERNS: ChatIntentPattern = {
  summary: [
    'riepilogo',
    'summary',
    "com'è messo",
    'stato documenti',
    'kpi',
    'stato progetto',
    'progresso',
    'documenti mancanti',
    'milestone',
  ],
  sensitivity: [
    'sensitivity',
    '±',
    'scenario',
    'variazione costi',
    'variazione prezzi',
    'analisi sensibilità',
    'scenari',
    'variazioni',
    'simulazione',
  ],
};

// ===========================================
// PROJECT ALIAS RESOLUTION
// ===========================================

export interface ProjectAliasResolution {
  projectId: string;
  projectName?: string;
  confidence: number;
}

export const zProjectAliasResolution = z.object({
  projectId: z.string().min(1),
  projectName: z.string().optional(),
  confidence: z.number().min(0).max(1),
});
