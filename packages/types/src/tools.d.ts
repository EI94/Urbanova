import { z } from 'zod';
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
export declare const zToolManifest: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<
      ['feasibility', 'scraping', 'analysis', 'integration', 'automation', 'reporting', 'other']
    >;
    description: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    intents: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    category:
      | 'other'
      | 'feasibility'
      | 'scraping'
      | 'analysis'
      | 'integration'
      | 'automation'
      | 'reporting';
    name: string;
    version: string;
    tags?: string[] | undefined;
    icon?: string | undefined;
    author?: string | undefined;
    website?: string | undefined;
    intents?: string[] | undefined;
    dependencies?: string[] | undefined;
  },
  {
    id: string;
    description: string;
    category:
      | 'other'
      | 'feasibility'
      | 'scraping'
      | 'analysis'
      | 'integration'
      | 'automation'
      | 'reporting';
    name: string;
    version: string;
    tags?: string[] | undefined;
    icon?: string | undefined;
    author?: string | undefined;
    website?: string | undefined;
    intents?: string[] | undefined;
    dependencies?: string[] | undefined;
  }
>;
export interface ToolActionSpec {
  name: string;
  description: string;
  zArgs: z.ZodSchema<any>;
  requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
  confirm?: boolean;
  longRunning?: boolean;
  timeout?: number;
  retryPolicy?: RetryPolicy;
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
export declare const zToolActionSpec: z.ZodObject<
  {
    name: z.ZodString;
    description: z.ZodString;
    zArgs: z.ZodAny;
    requiredRole: z.ZodEnum<['owner', 'pm', 'sales', 'vendor', 'admin']>;
    confirm: z.ZodOptional<z.ZodBoolean>;
    longRunning: z.ZodOptional<z.ZodBoolean>;
    timeout: z.ZodOptional<z.ZodNumber>;
    retryPolicy: z.ZodOptional<
      z.ZodObject<
        {
          maxRetries: z.ZodNumber;
          backoffMs: z.ZodNumber;
          maxBackoffMs: z.ZodNumber;
        },
        'strip',
        z.ZodTypeAny,
        {
          maxRetries: number;
          backoffMs: number;
          maxBackoffMs: number;
        },
        {
          maxRetries: number;
          backoffMs: number;
          maxBackoffMs: number;
        }
      >
    >;
    onFailure: z.ZodOptional<z.ZodEnum<['stop', 'continue']>>;
    rollback: z.ZodOptional<
      z.ZodObject<
        {
          toolId: z.ZodString;
          action: z.ZodString;
          args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        },
        'strip',
        z.ZodTypeAny,
        {
          toolId: string;
          action: string;
          args: Record<string, unknown>;
        },
        {
          toolId: string;
          action: string;
          args: Record<string, unknown>;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    description: string;
    name: string;
    requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
    zArgs?: any;
    confirm?: boolean | undefined;
    longRunning?: boolean | undefined;
    timeout?: number | undefined;
    retryPolicy?:
      | {
          maxRetries: number;
          backoffMs: number;
          maxBackoffMs: number;
        }
      | undefined;
    onFailure?: 'stop' | 'continue' | undefined;
    rollback?:
      | {
          toolId: string;
          action: string;
          args: Record<string, unknown>;
        }
      | undefined;
  },
  {
    description: string;
    name: string;
    requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
    zArgs?: any;
    confirm?: boolean | undefined;
    longRunning?: boolean | undefined;
    timeout?: number | undefined;
    retryPolicy?:
      | {
          maxRetries: number;
          backoffMs: number;
          maxBackoffMs: number;
        }
      | undefined;
    onFailure?: 'stop' | 'continue' | undefined;
    rollback?:
      | {
          toolId: string;
          action: string;
          args: Record<string, unknown>;
        }
      | undefined;
  }
>;
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
export declare const zToolInstall: z.ZodObject<
  {
    workspaceId: z.ZodString;
    toolId: z.ZodString;
    enabled: z.ZodBoolean;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    secrets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    installedAt: z.ZodDate;
    updatedAt: z.ZodDate;
    installedBy: z.ZodString;
    version: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    version: string;
    updatedAt: Date;
    workspaceId: string;
    toolId: string;
    enabled: boolean;
    installedAt: Date;
    installedBy: string;
    config?: Record<string, unknown> | undefined;
    secrets?: Record<string, string> | undefined;
  },
  {
    version: string;
    updatedAt: Date;
    workspaceId: string;
    toolId: string;
    enabled: boolean;
    installedAt: Date;
    installedBy: string;
    config?: Record<string, unknown> | undefined;
    secrets?: Record<string, string> | undefined;
  }
>;
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
  progress?: number;
  metadata?: Record<string, unknown>;
  cancelledAt?: Date;
  cancelledBy?: string;
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
export declare const zToolRunSubStep: z.ZodObject<
  {
    stepId: z.ZodString;
    status: z.ZodEnum<['pending', 'running', 'succeeded', 'failed', 'cancelled']>;
    startedAt: z.ZodDate;
    finishedAt: z.ZodOptional<z.ZodDate>;
    outputRef: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    retryCount: z.ZodNumber;
    maxRetries: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    status: 'pending' | 'succeeded' | 'failed' | 'running' | 'cancelled';
    retryCount: number;
    maxRetries: number;
    stepId: string;
    startedAt: Date;
    finishedAt?: Date | undefined;
    outputRef?: string | undefined;
    error?: string | undefined;
  },
  {
    status: 'pending' | 'succeeded' | 'failed' | 'running' | 'cancelled';
    retryCount: number;
    maxRetries: number;
    stepId: string;
    startedAt: Date;
    finishedAt?: Date | undefined;
    outputRef?: string | undefined;
    error?: string | undefined;
  }
>;
export declare const zToolRun: z.ZodObject<
  {
    id: z.ZodString;
    toolId: z.ZodString;
    action: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    userId: z.ZodString;
    status: z.ZodEnum<
      ['pending', 'running', 'completed', 'succeeded', 'failed', 'cancelled', 'timeout']
    >;
    startedAt: z.ZodDate;
    finishedAt: z.ZodOptional<z.ZodDate>;
    args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    output: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    logs: z.ZodArray<z.ZodString, 'many'>;
    progress: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    cancelledAt: z.ZodOptional<z.ZodDate>;
    cancelledBy: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    planId: z.ZodOptional<z.ZodString>;
    subRuns: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            stepId: z.ZodString;
            status: z.ZodEnum<['pending', 'running', 'succeeded', 'failed', 'cancelled']>;
            startedAt: z.ZodDate;
            finishedAt: z.ZodOptional<z.ZodDate>;
            outputRef: z.ZodOptional<z.ZodString>;
            error: z.ZodOptional<z.ZodString>;
            retryCount: z.ZodNumber;
            maxRetries: z.ZodNumber;
          },
          'strip',
          z.ZodTypeAny,
          {
            status: 'pending' | 'succeeded' | 'failed' | 'running' | 'cancelled';
            retryCount: number;
            maxRetries: number;
            stepId: string;
            startedAt: Date;
            finishedAt?: Date | undefined;
            outputRef?: string | undefined;
            error?: string | undefined;
          },
          {
            status: 'pending' | 'succeeded' | 'failed' | 'running' | 'cancelled';
            retryCount: number;
            maxRetries: number;
            stepId: string;
            startedAt: Date;
            finishedAt?: Date | undefined;
            outputRef?: string | undefined;
            error?: string | undefined;
          }
        >,
        'many'
      >
    >;
    outputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    status: 'pending' | 'succeeded' | 'failed' | 'completed' | 'timeout' | 'running' | 'cancelled';
    userId: string;
    workspaceId: string;
    toolId: string;
    action: string;
    args: Record<string, unknown>;
    startedAt: Date;
    logs: string[];
    metadata?: Record<string, unknown> | undefined;
    projectId?: string | undefined;
    finishedAt?: Date | undefined;
    error?: string | undefined;
    output?: unknown;
    progress?: number | undefined;
    cancelledAt?: Date | undefined;
    cancelledBy?: string | undefined;
    sessionId?: string | undefined;
    planId?: string | undefined;
    subRuns?:
      | {
          status: 'pending' | 'succeeded' | 'failed' | 'running' | 'cancelled';
          retryCount: number;
          maxRetries: number;
          stepId: string;
          startedAt: Date;
          finishedAt?: Date | undefined;
          outputRef?: string | undefined;
          error?: string | undefined;
        }[]
      | undefined;
    outputs?: Record<string, unknown> | undefined;
  },
  {
    id: string;
    status: 'pending' | 'succeeded' | 'failed' | 'completed' | 'timeout' | 'running' | 'cancelled';
    userId: string;
    workspaceId: string;
    toolId: string;
    action: string;
    args: Record<string, unknown>;
    startedAt: Date;
    logs: string[];
    metadata?: Record<string, unknown> | undefined;
    projectId?: string | undefined;
    finishedAt?: Date | undefined;
    error?: string | undefined;
    output?: unknown;
    progress?: number | undefined;
    cancelledAt?: Date | undefined;
    cancelledBy?: string | undefined;
    sessionId?: string | undefined;
    planId?: string | undefined;
    subRuns?:
      | {
          status: 'pending' | 'succeeded' | 'failed' | 'running' | 'cancelled';
          retryCount: number;
          maxRetries: number;
          stepId: string;
          startedAt: Date;
          finishedAt?: Date | undefined;
          outputRef?: string | undefined;
          error?: string | undefined;
        }[]
      | undefined;
    outputs?: Record<string, unknown> | undefined;
  }
>;
export interface ToolContext {
  userId: string;
  workspaceId: string;
  projectId?: string;
  userRole: string;
  now: Date;
  logger: ToolLogger;
  db: any;
  onProgress?: (message: string) => void;
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
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
export declare const zTool: z.ZodObject<
  {
    manifest: z.ZodObject<
      {
        id: z.ZodString;
        name: z.ZodString;
        version: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<
          ['feasibility', 'scraping', 'analysis', 'integration', 'automation', 'reporting', 'other']
        >;
        description: z.ZodString;
        author: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        intents: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        description: string;
        category:
          | 'other'
          | 'feasibility'
          | 'scraping'
          | 'analysis'
          | 'integration'
          | 'automation'
          | 'reporting';
        name: string;
        version: string;
        tags?: string[] | undefined;
        icon?: string | undefined;
        author?: string | undefined;
        website?: string | undefined;
        intents?: string[] | undefined;
        dependencies?: string[] | undefined;
      },
      {
        id: string;
        description: string;
        category:
          | 'other'
          | 'feasibility'
          | 'scraping'
          | 'analysis'
          | 'integration'
          | 'automation'
          | 'reporting';
        name: string;
        version: string;
        tags?: string[] | undefined;
        icon?: string | undefined;
        author?: string | undefined;
        website?: string | undefined;
        intents?: string[] | undefined;
        dependencies?: string[] | undefined;
      }
    >;
    actions: z.ZodArray<
      z.ZodObject<
        {
          name: z.ZodString;
          description: z.ZodString;
          zArgs: z.ZodAny;
          requiredRole: z.ZodEnum<['owner', 'pm', 'sales', 'vendor', 'admin']>;
          confirm: z.ZodOptional<z.ZodBoolean>;
          longRunning: z.ZodOptional<z.ZodBoolean>;
          timeout: z.ZodOptional<z.ZodNumber>;
          retryPolicy: z.ZodOptional<
            z.ZodObject<
              {
                maxRetries: z.ZodNumber;
                backoffMs: z.ZodNumber;
                maxBackoffMs: z.ZodNumber;
              },
              'strip',
              z.ZodTypeAny,
              {
                maxRetries: number;
                backoffMs: number;
                maxBackoffMs: number;
              },
              {
                maxRetries: number;
                backoffMs: number;
                maxBackoffMs: number;
              }
            >
          >;
          onFailure: z.ZodOptional<z.ZodEnum<['stop', 'continue']>>;
          rollback: z.ZodOptional<
            z.ZodObject<
              {
                toolId: z.ZodString;
                action: z.ZodString;
                args: z.ZodRecord<z.ZodString, z.ZodUnknown>;
              },
              'strip',
              z.ZodTypeAny,
              {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              },
              {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            >
          >;
        },
        'strip',
        z.ZodTypeAny,
        {
          description: string;
          name: string;
          requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
          zArgs?: any;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
          timeout?: number | undefined;
          retryPolicy?:
            | {
                maxRetries: number;
                backoffMs: number;
                maxBackoffMs: number;
              }
            | undefined;
          onFailure?: 'stop' | 'continue' | undefined;
          rollback?:
            | {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            | undefined;
        },
        {
          description: string;
          name: string;
          requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
          zArgs?: any;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
          timeout?: number | undefined;
          retryPolicy?:
            | {
                maxRetries: number;
                backoffMs: number;
                maxBackoffMs: number;
              }
            | undefined;
          onFailure?: 'stop' | 'continue' | undefined;
          rollback?:
            | {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            | undefined;
        }
      >,
      'many'
    >;
    uiExtensions: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodEnum<['button', 'form', 'widget']>;
            location: z.ZodEnum<['project-header', 'project-sidebar', 'dashboard', 'chat']>;
            component: z.ZodString;
            props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            type: 'button' | 'form' | 'widget';
            location: 'chat' | 'project-header' | 'project-sidebar' | 'dashboard';
            component: string;
            props?: Record<string, unknown> | undefined;
          },
          {
            type: 'button' | 'form' | 'widget';
            location: 'chat' | 'project-header' | 'project-sidebar' | 'dashboard';
            component: string;
            props?: Record<string, unknown> | undefined;
          }
        >,
        'many'
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    manifest: {
      id: string;
      description: string;
      category:
        | 'other'
        | 'feasibility'
        | 'scraping'
        | 'analysis'
        | 'integration'
        | 'automation'
        | 'reporting';
      name: string;
      version: string;
      tags?: string[] | undefined;
      icon?: string | undefined;
      author?: string | undefined;
      website?: string | undefined;
      intents?: string[] | undefined;
      dependencies?: string[] | undefined;
    };
    actions: {
      description: string;
      name: string;
      requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
      zArgs?: any;
      confirm?: boolean | undefined;
      longRunning?: boolean | undefined;
      timeout?: number | undefined;
      retryPolicy?:
        | {
            maxRetries: number;
            backoffMs: number;
            maxBackoffMs: number;
          }
        | undefined;
      onFailure?: 'stop' | 'continue' | undefined;
      rollback?:
        | {
            toolId: string;
            action: string;
            args: Record<string, unknown>;
          }
        | undefined;
    }[];
    uiExtensions?:
      | {
          type: 'button' | 'form' | 'widget';
          location: 'chat' | 'project-header' | 'project-sidebar' | 'dashboard';
          component: string;
          props?: Record<string, unknown> | undefined;
        }[]
      | undefined;
  },
  {
    manifest: {
      id: string;
      description: string;
      category:
        | 'other'
        | 'feasibility'
        | 'scraping'
        | 'analysis'
        | 'integration'
        | 'automation'
        | 'reporting';
      name: string;
      version: string;
      tags?: string[] | undefined;
      icon?: string | undefined;
      author?: string | undefined;
      website?: string | undefined;
      intents?: string[] | undefined;
      dependencies?: string[] | undefined;
    };
    actions: {
      description: string;
      name: string;
      requiredRole: 'owner' | 'pm' | 'sales' | 'vendor' | 'admin';
      zArgs?: any;
      confirm?: boolean | undefined;
      longRunning?: boolean | undefined;
      timeout?: number | undefined;
      retryPolicy?:
        | {
            maxRetries: number;
            backoffMs: number;
            maxBackoffMs: number;
          }
        | undefined;
      onFailure?: 'stop' | 'continue' | undefined;
      rollback?:
        | {
            toolId: string;
            action: string;
            args: Record<string, unknown>;
          }
        | undefined;
    }[];
    uiExtensions?:
      | {
          type: 'button' | 'form' | 'widget';
          location: 'chat' | 'project-header' | 'project-sidebar' | 'dashboard';
          component: string;
          props?: Record<string, unknown> | undefined;
        }[]
      | undefined;
  }
>;
export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  toolId: string;
  action: string;
  runId: string;
  logs: string[];
  outputRef?: string;
}
export declare const zToolExecutionResult: z.ZodObject<
  {
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodUnknown>;
    error: z.ZodOptional<z.ZodString>;
    executionTime: z.ZodNumber;
    toolId: z.ZodString;
    action: z.ZodString;
    runId: z.ZodString;
    logs: z.ZodArray<z.ZodString, 'many'>;
    outputRef: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    toolId: string;
    action: string;
    runId: string;
    logs: string[];
    success: boolean;
    executionTime: number;
    data?: unknown;
    outputRef?: string | undefined;
    error?: string | undefined;
  },
  {
    toolId: string;
    action: string;
    runId: string;
    logs: string[];
    success: boolean;
    executionTime: number;
    data?: unknown;
    outputRef?: string | undefined;
    error?: string | undefined;
  }
>;
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
//# sourceMappingURL=tools.d.ts.map
