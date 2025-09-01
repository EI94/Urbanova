import { z } from 'zod';
export declare const zProjectSummaryArgs: z.ZodObject<
  {
    projectId: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
  },
  {
    projectId: string;
  }
>;
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
export declare const zProjectSummary: z.ZodObject<
  {
    roi: z.ZodOptional<z.ZodNumber>;
    marginPct: z.ZodOptional<z.ZodNumber>;
    paybackYears: z.ZodOptional<z.ZodNumber>;
    docs: z.ZodObject<
      {
        complete: z.ZodNumber;
        total: z.ZodNumber;
        missing: z.ZodArray<z.ZodString, 'many'>;
      },
      'strip',
      z.ZodTypeAny,
      {
        total: number;
        missing: string[];
        complete: number;
      },
      {
        total: number;
        missing: string[];
        complete: number;
      }
    >;
    milestones: z.ZodArray<
      z.ZodObject<
        {
          title: z.ZodString;
          due: z.ZodString;
          status: z.ZodEnum<['due', 'overdue', 'ok']>;
        },
        'strip',
        z.ZodTypeAny,
        {
          status: 'due' | 'overdue' | 'ok';
          title: string;
          due: string;
        },
        {
          status: 'due' | 'overdue' | 'ok';
          title: string;
          due: string;
        }
      >,
      'many'
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    docs: {
      total: number;
      missing: string[];
      complete: number;
    };
    milestones: {
      status: 'due' | 'overdue' | 'ok';
      title: string;
      due: string;
    }[];
    roi?: number | undefined;
    marginPct?: number | undefined;
    paybackYears?: number | undefined;
  },
  {
    docs: {
      total: number;
      missing: string[];
      complete: number;
    };
    milestones: {
      status: 'due' | 'overdue' | 'ok';
      title: string;
      due: string;
    }[];
    roi?: number | undefined;
    marginPct?: number | undefined;
    paybackYears?: number | undefined;
  }
>;
export declare const zSensitivityArgs: z.ZodObject<
  {
    projectId: z.ZodString;
    deltas: z.ZodArray<z.ZodNumber, 'many'>;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    deltas: number[];
  },
  {
    projectId: string;
    deltas: number[];
  }
>;
export interface SensitivityResult {
  baseRoi: number;
  range: {
    min: number;
    max: number;
  };
  pdfUrl: string;
}
export declare const zSensitivityResult: z.ZodObject<
  {
    baseRoi: z.ZodNumber;
    range: z.ZodObject<
      {
        min: z.ZodNumber;
        max: z.ZodNumber;
      },
      'strip',
      z.ZodTypeAny,
      {
        min: number;
        max: number;
      },
      {
        min: number;
        max: number;
      }
    >;
    pdfUrl: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    range: {
      min: number;
      max: number;
    };
    pdfUrl: string;
    baseRoi: number;
  },
  {
    range: {
      min: number;
      max: number;
    };
    pdfUrl: string;
    baseRoi: number;
  }
>;
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
export interface ChatIntentPattern {
  summary: string[];
  sensitivity: string[];
}
export declare const CHAT_INTENT_PATTERNS: ChatIntentPattern;
export interface ProjectAliasResolution {
  projectId: string;
  projectName?: string;
  confidence: number;
}
export declare const zProjectAliasResolution: z.ZodObject<
  {
    projectId: z.ZodString;
    projectName: z.ZodOptional<z.ZodString>;
    confidence: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    confidence: number;
    projectName?: string | undefined;
  },
  {
    projectId: string;
    confidence: number;
    projectName?: string | undefined;
  }
>;
//# sourceMappingURL=capabilities.d.ts.map
