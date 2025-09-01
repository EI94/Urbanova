import { z } from 'zod';
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
  db: any;
}
export interface Capability {
  spec: CapabilitySpec;
  handler: (ctx: CapabilityContext, args: any) => Promise<any>;
}
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
export declare const zCapabilitySpec: z.ZodObject<
  {
    name: z.ZodString;
    description: z.ZodString;
    zArgs: z.ZodAny;
    requiredRole: z.ZodEnum<['owner', 'pm', 'sales', 'vendor']>;
    confirm: z.ZodOptional<z.ZodBoolean>;
    dryRun: z.ZodOptional<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    description: string;
    name: string;
    requiredRole: 'owner' | 'pm' | 'sales' | 'vendor';
    zArgs?: any;
    confirm?: boolean | undefined;
    dryRun?: boolean | undefined;
  },
  {
    description: string;
    name: string;
    requiredRole: 'owner' | 'pm' | 'sales' | 'vendor';
    zArgs?: any;
    confirm?: boolean | undefined;
    dryRun?: boolean | undefined;
  }
>;
export declare const zCapabilityContext: z.ZodObject<
  {
    userId: z.ZodString;
    sender: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    now: z.ZodDate;
    logger: z.ZodAny;
    db: z.ZodAny;
  },
  'strip',
  z.ZodTypeAny,
  {
    userId: string;
    sender: string;
    now: Date;
    projectId?: string | undefined;
    logger?: any;
    db?: any;
  },
  {
    userId: string;
    sender: string;
    now: Date;
    projectId?: string | undefined;
    logger?: any;
    db?: any;
  }
>;
export declare const zPlan: z.ZodObject<
  {
    mode: z.ZodEnum<['QNA', 'ACTION']>;
    intent: z.ZodOptional<z.ZodString>;
    args: z.ZodOptional<z.ZodAny>;
    confidence: z.ZodNumber;
    projectId: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    confidence: number;
    mode: 'QNA' | 'ACTION';
    projectId?: string | undefined;
    args?: any;
    intent?: string | undefined;
  },
  {
    confidence: number;
    mode: 'QNA' | 'ACTION';
    projectId?: string | undefined;
    args?: any;
    intent?: string | undefined;
  }
>;
export declare const zQnaAnswer: z.ZodObject<
  {
    answer: z.ZodString;
    citations: z.ZodArray<
      z.ZodObject<
        {
          title: z.ZodOptional<z.ZodString>;
          docId: z.ZodString;
          page: z.ZodOptional<z.ZodNumber>;
          url: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          docId: string;
          title?: string | undefined;
          url?: string | undefined;
          page?: number | undefined;
        },
        {
          docId: string;
          title?: string | undefined;
          url?: string | undefined;
          page?: number | undefined;
        }
      >,
      'many'
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    citations: {
      docId: string;
      title?: string | undefined;
      url?: string | undefined;
      page?: number | undefined;
    }[];
    answer: string;
  },
  {
    citations: {
      docId: string;
      title?: string | undefined;
      url?: string | undefined;
      page?: number | undefined;
    }[];
    answer: string;
  }
>;
export declare const zProjectSemanticKPI: z.ZodObject<
  {
    projectId: z.ZodString;
    timestamp: z.ZodDate;
    metrics: z.ZodObject<
      {
        totalBudget: z.ZodNumber;
        currentSpend: z.ZodNumber;
        progress: z.ZodNumber;
        roi: z.ZodNumber;
        riskLevel: z.ZodEnum<['LOW', 'MEDIUM', 'HIGH']>;
        status: z.ZodString;
      },
      'strip',
      z.ZodTypeAny,
      {
        status: string;
        roi: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        progress: number;
        totalBudget: number;
        currentSpend: number;
      },
      {
        status: string;
        roi: number;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        progress: number;
        totalBudget: number;
        currentSpend: number;
      }
    >;
    lastUpdated: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    timestamp: Date;
    lastUpdated: Date;
    metrics: {
      status: string;
      roi: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      progress: number;
      totalBudget: number;
      currentSpend: number;
    };
  },
  {
    projectId: string;
    timestamp: Date;
    lastUpdated: Date;
    metrics: {
      status: string;
      roi: number;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      progress: number;
      totalBudget: number;
      currentSpend: number;
    };
  }
>;
export declare const zProjectSemanticIndex: z.ZodObject<
  {
    projectId: z.ZodString;
    documents: z.ZodArray<
      z.ZodObject<
        {
          docId: z.ZodString;
          title: z.ZodString;
          textSnippet: z.ZodString;
          url: z.ZodOptional<z.ZodString>;
          type: z.ZodString;
          lastModified: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          type: string;
          title: string;
          docId: string;
          textSnippet: string;
          lastModified: Date;
          url?: string | undefined;
        },
        {
          type: string;
          title: string;
          docId: string;
          textSnippet: string;
          lastModified: Date;
          url?: string | undefined;
        }
      >,
      'many'
    >;
    lastIndexed: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    documents: {
      type: string;
      title: string;
      docId: string;
      textSnippet: string;
      lastModified: Date;
      url?: string | undefined;
    }[];
    lastIndexed: Date;
  },
  {
    projectId: string;
    documents: {
      type: string;
      title: string;
      docId: string;
      textSnippet: string;
      lastModified: Date;
      url?: string | undefined;
    }[];
    lastIndexed: Date;
  }
>;
export interface Logger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}
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
//# sourceMappingURL=os.d.ts.map
