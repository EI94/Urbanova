import { z } from 'zod';
export declare const SessionStatus: {
  readonly COLLECTING: 'collecting';
  readonly AWAITING_CONFIRM: 'awaiting_confirm';
  readonly RUNNING: 'running';
  readonly SUCCEEDED: 'succeeded';
  readonly FAILED: 'failed';
  readonly CANCELLED: 'cancelled';
};
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];
export declare const zPlanStep: z.ZodObject<
  {
    id: z.ZodString;
    toolId: z.ZodString;
    action: z.ZodString;
    description: z.ZodString;
    zArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    requiredRole: z.ZodString;
    confirm: z.ZodOptional<z.ZodBoolean>;
    longRunning: z.ZodOptional<z.ZodBoolean>;
    order: z.ZodNumber;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
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
    id: string;
    description: string;
    toolId: string;
    action: string;
    requiredRole: string;
    order: number;
    dependencies?: string[] | undefined;
    zArgs?: Record<string, unknown> | undefined;
    confirm?: boolean | undefined;
    longRunning?: boolean | undefined;
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
    id: string;
    description: string;
    toolId: string;
    action: string;
    requiredRole: string;
    order: number;
    dependencies?: string[] | undefined;
    zArgs?: Record<string, unknown> | undefined;
    confirm?: boolean | undefined;
    longRunning?: boolean | undefined;
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
export declare const zRequirement: z.ZodObject<
  {
    id: z.ZodString;
    field: z.ZodString;
    description: z.ZodString;
    type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
    required: z.ZodBoolean;
    currentValue: z.ZodOptional<z.ZodUnknown>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    type: 'number' | 'boolean' | 'date' | 'text' | 'select';
    required: boolean;
    field: string;
    options?: string[] | undefined;
    currentValue?: unknown;
  },
  {
    id: string;
    description: string;
    type: 'number' | 'boolean' | 'date' | 'text' | 'select';
    required: boolean;
    field: string;
    options?: string[] | undefined;
    currentValue?: unknown;
  }
>;
export declare const zAssumption: z.ZodObject<
  {
    id: z.ZodString;
    description: z.ZodString;
    confidence: z.ZodEnum<['low', 'medium', 'high']>;
    source: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    confidence: 'low' | 'medium' | 'high';
    source?: string | undefined;
  },
  {
    id: string;
    description: string;
    confidence: 'low' | 'medium' | 'high';
    source?: string | undefined;
  }
>;
export declare const zRisk: z.ZodObject<
  {
    id: z.ZodString;
    description: z.ZodString;
    severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
    mitigation: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation?: string | undefined;
  },
  {
    id: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    mitigation?: string | undefined;
  }
>;
export declare const zInteractivePlan: z.ZodObject<
  {
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    steps: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          toolId: z.ZodString;
          action: z.ZodString;
          description: z.ZodString;
          zArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          requiredRole: z.ZodString;
          confirm: z.ZodOptional<z.ZodBoolean>;
          longRunning: z.ZodOptional<z.ZodBoolean>;
          order: z.ZodNumber;
          dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
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
          id: string;
          description: string;
          toolId: string;
          action: string;
          requiredRole: string;
          order: number;
          dependencies?: string[] | undefined;
          zArgs?: Record<string, unknown> | undefined;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
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
          id: string;
          description: string;
          toolId: string;
          action: string;
          requiredRole: string;
          order: number;
          dependencies?: string[] | undefined;
          zArgs?: Record<string, unknown> | undefined;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
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
    requirements: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          field: z.ZodString;
          description: z.ZodString;
          type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
          required: z.ZodBoolean;
          currentValue: z.ZodOptional<z.ZodUnknown>;
          options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        },
        {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }
      >,
      'many'
    >;
    assumptions: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          description: z.ZodString;
          confidence: z.ZodEnum<['low', 'medium', 'high']>;
          source: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        },
        {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        }
      >,
      'many'
    >;
    risks: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          description: z.ZodString;
          severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
          mitigation: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        },
        {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        }
      >,
      'many'
    >;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    totalCost: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    description: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    risks: {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigation?: string | undefined;
    }[];
    requirements: {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }[];
    steps: {
      id: string;
      description: string;
      toolId: string;
      action: string;
      requiredRole: string;
      order: number;
      dependencies?: string[] | undefined;
      zArgs?: Record<string, unknown> | undefined;
      confirm?: boolean | undefined;
      longRunning?: boolean | undefined;
      onFailure?: 'stop' | 'continue' | undefined;
      rollback?:
        | {
            toolId: string;
            action: string;
            args: Record<string, unknown>;
          }
        | undefined;
    }[];
    assumptions: {
      id: string;
      description: string;
      confidence: 'low' | 'medium' | 'high';
      source?: string | undefined;
    }[];
    totalCost?: number | undefined;
    estimatedDuration?: number | undefined;
  },
  {
    id: string;
    description: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    risks: {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigation?: string | undefined;
    }[];
    requirements: {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }[];
    steps: {
      id: string;
      description: string;
      toolId: string;
      action: string;
      requiredRole: string;
      order: number;
      dependencies?: string[] | undefined;
      zArgs?: Record<string, unknown> | undefined;
      confirm?: boolean | undefined;
      longRunning?: boolean | undefined;
      onFailure?: 'stop' | 'continue' | undefined;
      rollback?:
        | {
            toolId: string;
            action: string;
            args: Record<string, unknown>;
          }
        | undefined;
    }[];
    assumptions: {
      id: string;
      description: string;
      confidence: 'low' | 'medium' | 'high';
      source?: string | undefined;
    }[];
    totalCost?: number | undefined;
    estimatedDuration?: number | undefined;
  }
>;
export declare const zUserReply: z.ZodObject<
  {
    id: z.ZodString;
    type: z.ZodEnum<['confirm', 'edit', 'dryrun', 'cancel', 'provide_value']>;
    timestamp: z.ZodDate;
    userId: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
    timestamp: Date;
    userId: string;
    data?: Record<string, unknown> | undefined;
  },
  {
    id: string;
    type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
    timestamp: Date;
    userId: string;
    data?: Record<string, unknown> | undefined;
  }
>;
export declare const zTaskSession: z.ZodObject<
  {
    id: z.ZodString;
    projectId: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    status: z.ZodNativeEnum<{
      readonly COLLECTING: 'collecting';
      readonly AWAITING_CONFIRM: 'awaiting_confirm';
      readonly RUNNING: 'running';
      readonly SUCCEEDED: 'succeeded';
      readonly FAILED: 'failed';
      readonly CANCELLED: 'cancelled';
    }>;
    plan: z.ZodObject<
      {
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        steps: z.ZodArray<
          z.ZodObject<
            {
              id: z.ZodString;
              toolId: z.ZodString;
              action: z.ZodString;
              description: z.ZodString;
              zArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
              requiredRole: z.ZodString;
              confirm: z.ZodOptional<z.ZodBoolean>;
              longRunning: z.ZodOptional<z.ZodBoolean>;
              order: z.ZodNumber;
              dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
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
              id: string;
              description: string;
              toolId: string;
              action: string;
              requiredRole: string;
              order: number;
              dependencies?: string[] | undefined;
              zArgs?: Record<string, unknown> | undefined;
              confirm?: boolean | undefined;
              longRunning?: boolean | undefined;
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
              id: string;
              description: string;
              toolId: string;
              action: string;
              requiredRole: string;
              order: number;
              dependencies?: string[] | undefined;
              zArgs?: Record<string, unknown> | undefined;
              confirm?: boolean | undefined;
              longRunning?: boolean | undefined;
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
        requirements: z.ZodArray<
          z.ZodObject<
            {
              id: z.ZodString;
              field: z.ZodString;
              description: z.ZodString;
              type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
              required: z.ZodBoolean;
              currentValue: z.ZodOptional<z.ZodUnknown>;
              options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
            },
            'strip',
            z.ZodTypeAny,
            {
              id: string;
              description: string;
              type: 'number' | 'boolean' | 'date' | 'text' | 'select';
              required: boolean;
              field: string;
              options?: string[] | undefined;
              currentValue?: unknown;
            },
            {
              id: string;
              description: string;
              type: 'number' | 'boolean' | 'date' | 'text' | 'select';
              required: boolean;
              field: string;
              options?: string[] | undefined;
              currentValue?: unknown;
            }
          >,
          'many'
        >;
        assumptions: z.ZodArray<
          z.ZodObject<
            {
              id: z.ZodString;
              description: z.ZodString;
              confidence: z.ZodEnum<['low', 'medium', 'high']>;
              source: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              id: string;
              description: string;
              confidence: 'low' | 'medium' | 'high';
              source?: string | undefined;
            },
            {
              id: string;
              description: string;
              confidence: 'low' | 'medium' | 'high';
              source?: string | undefined;
            }
          >,
          'many'
        >;
        risks: z.ZodArray<
          z.ZodObject<
            {
              id: z.ZodString;
              description: z.ZodString;
              severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
              mitigation: z.ZodOptional<z.ZodString>;
            },
            'strip',
            z.ZodTypeAny,
            {
              id: string;
              description: string;
              severity: 'low' | 'medium' | 'high' | 'critical';
              mitigation?: string | undefined;
            },
            {
              id: string;
              description: string;
              severity: 'low' | 'medium' | 'high' | 'critical';
              mitigation?: string | undefined;
            }
          >,
          'many'
        >;
        estimatedDuration: z.ZodOptional<z.ZodNumber>;
        totalCost: z.ZodOptional<z.ZodNumber>;
        createdAt: z.ZodDate;
        updatedAt: z.ZodDate;
      },
      'strip',
      z.ZodTypeAny,
      {
        id: string;
        description: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        risks: {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        }[];
        requirements: {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }[];
        steps: {
          id: string;
          description: string;
          toolId: string;
          action: string;
          requiredRole: string;
          order: number;
          dependencies?: string[] | undefined;
          zArgs?: Record<string, unknown> | undefined;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
          onFailure?: 'stop' | 'continue' | undefined;
          rollback?:
            | {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            | undefined;
        }[];
        assumptions: {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        }[];
        totalCost?: number | undefined;
        estimatedDuration?: number | undefined;
      },
      {
        id: string;
        description: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        risks: {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        }[];
        requirements: {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }[];
        steps: {
          id: string;
          description: string;
          toolId: string;
          action: string;
          requiredRole: string;
          order: number;
          dependencies?: string[] | undefined;
          zArgs?: Record<string, unknown> | undefined;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
          onFailure?: 'stop' | 'continue' | undefined;
          rollback?:
            | {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            | undefined;
        }[];
        assumptions: {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        }[];
        totalCost?: number | undefined;
        estimatedDuration?: number | undefined;
      }
    >;
    replies: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          type: z.ZodEnum<['confirm', 'edit', 'dryrun', 'cancel', 'provide_value']>;
          timestamp: z.ZodDate;
          userId: z.ZodString;
          data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
          timestamp: Date;
          userId: string;
          data?: Record<string, unknown> | undefined;
        },
        {
          id: string;
          type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
          timestamp: Date;
          userId: string;
          data?: Record<string, unknown> | undefined;
        }
      >,
      'many'
    >;
    currentStep: z.ZodOptional<z.ZodNumber>;
    startedAt: z.ZodOptional<z.ZodDate>;
    completedAt: z.ZodOptional<z.ZodDate>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    status: 'succeeded' | 'failed' | 'running' | 'cancelled' | 'collecting' | 'awaiting_confirm';
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    plan: {
      id: string;
      description: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      risks: {
        id: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        mitigation?: string | undefined;
      }[];
      requirements: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      steps: {
        id: string;
        description: string;
        toolId: string;
        action: string;
        requiredRole: string;
        order: number;
        dependencies?: string[] | undefined;
        zArgs?: Record<string, unknown> | undefined;
        confirm?: boolean | undefined;
        longRunning?: boolean | undefined;
        onFailure?: 'stop' | 'continue' | undefined;
        rollback?:
          | {
              toolId: string;
              action: string;
              args: Record<string, unknown>;
            }
          | undefined;
      }[];
      assumptions: {
        id: string;
        description: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string | undefined;
      }[];
      totalCost?: number | undefined;
      estimatedDuration?: number | undefined;
    };
    replies: {
      id: string;
      type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
      timestamp: Date;
      userId: string;
      data?: Record<string, unknown> | undefined;
    }[];
    projectId?: string | undefined;
    currentStep?: number | undefined;
    completedAt?: Date | undefined;
    startedAt?: Date | undefined;
    error?: string | undefined;
  },
  {
    id: string;
    status: 'succeeded' | 'failed' | 'running' | 'cancelled' | 'collecting' | 'awaiting_confirm';
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    plan: {
      id: string;
      description: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      risks: {
        id: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        mitigation?: string | undefined;
      }[];
      requirements: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      steps: {
        id: string;
        description: string;
        toolId: string;
        action: string;
        requiredRole: string;
        order: number;
        dependencies?: string[] | undefined;
        zArgs?: Record<string, unknown> | undefined;
        confirm?: boolean | undefined;
        longRunning?: boolean | undefined;
        onFailure?: 'stop' | 'continue' | undefined;
        rollback?:
          | {
              toolId: string;
              action: string;
              args: Record<string, unknown>;
            }
          | undefined;
      }[];
      assumptions: {
        id: string;
        description: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string | undefined;
      }[];
      totalCost?: number | undefined;
      estimatedDuration?: number | undefined;
    };
    replies: {
      id: string;
      type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
      timestamp: Date;
      userId: string;
      data?: Record<string, unknown> | undefined;
    }[];
    projectId?: string | undefined;
    currentStep?: number | undefined;
    completedAt?: Date | undefined;
    startedAt?: Date | undefined;
    error?: string | undefined;
  }
>;
export declare const zPlanValidation: z.ZodObject<
  {
    missing: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          field: z.ZodString;
          description: z.ZodString;
          type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
          required: z.ZodBoolean;
          currentValue: z.ZodOptional<z.ZodUnknown>;
          options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        },
        {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }
      >,
      'many'
    >;
    ready: z.ZodBoolean;
    warnings: z.ZodArray<z.ZodString, 'many'>;
    errors: z.ZodArray<z.ZodString, 'many'>;
  },
  'strip',
  z.ZodTypeAny,
  {
    warnings: string[];
    missing: {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }[];
    errors: string[];
    ready: boolean;
  },
  {
    warnings: string[];
    missing: {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }[];
    errors: string[];
    ready: boolean;
  }
>;
export declare const zPlanPreview: z.ZodObject<
  {
    title: z.ZodString;
    description: z.ZodString;
    steps: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          description: z.ZodString;
          toolId: z.ZodString;
          action: z.ZodString;
          status: z.ZodOptional<z.ZodEnum<['pending', 'ready', 'running', 'completed', 'failed']>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          toolId: string;
          action: string;
          status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
        },
        {
          id: string;
          description: string;
          toolId: string;
          action: string;
          status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
        }
      >,
      'many'
    >;
    missing: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          field: z.ZodString;
          description: z.ZodString;
          type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
          required: z.ZodBoolean;
          currentValue: z.ZodOptional<z.ZodUnknown>;
          options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        },
        {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }
      >,
      'many'
    >;
    assumptions: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          description: z.ZodString;
          confidence: z.ZodEnum<['low', 'medium', 'high']>;
          source: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        },
        {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        }
      >,
      'many'
    >;
    risks: z.ZodArray<
      z.ZodObject<
        {
          id: z.ZodString;
          description: z.ZodString;
          severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
          mitigation: z.ZodOptional<z.ZodString>;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        },
        {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        }
      >,
      'many'
    >;
    estimatedDuration: z.ZodOptional<z.ZodNumber>;
    totalCost: z.ZodOptional<z.ZodNumber>;
    ctas: z.ZodArray<z.ZodEnum<['confirm', 'edit', 'dryrun', 'cancel']>, 'many'>;
  },
  'strip',
  z.ZodTypeAny,
  {
    description: string;
    title: string;
    risks: {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigation?: string | undefined;
    }[];
    missing: {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }[];
    steps: {
      id: string;
      description: string;
      toolId: string;
      action: string;
      status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
    }[];
    assumptions: {
      id: string;
      description: string;
      confidence: 'low' | 'medium' | 'high';
      source?: string | undefined;
    }[];
    ctas: ('confirm' | 'edit' | 'dryrun' | 'cancel')[];
    totalCost?: number | undefined;
    estimatedDuration?: number | undefined;
  },
  {
    description: string;
    title: string;
    risks: {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigation?: string | undefined;
    }[];
    missing: {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }[];
    steps: {
      id: string;
      description: string;
      toolId: string;
      action: string;
      status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
    }[];
    assumptions: {
      id: string;
      description: string;
      confidence: 'low' | 'medium' | 'high';
      source?: string | undefined;
    }[];
    ctas: ('confirm' | 'edit' | 'dryrun' | 'cancel')[];
    totalCost?: number | undefined;
    estimatedDuration?: number | undefined;
  }
>;
export declare const schemas: {
  zPlanStep: z.ZodObject<
    {
      id: z.ZodString;
      toolId: z.ZodString;
      action: z.ZodString;
      description: z.ZodString;
      zArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
      requiredRole: z.ZodString;
      confirm: z.ZodOptional<z.ZodBoolean>;
      longRunning: z.ZodOptional<z.ZodBoolean>;
      order: z.ZodNumber;
      dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
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
      id: string;
      description: string;
      toolId: string;
      action: string;
      requiredRole: string;
      order: number;
      dependencies?: string[] | undefined;
      zArgs?: Record<string, unknown> | undefined;
      confirm?: boolean | undefined;
      longRunning?: boolean | undefined;
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
      id: string;
      description: string;
      toolId: string;
      action: string;
      requiredRole: string;
      order: number;
      dependencies?: string[] | undefined;
      zArgs?: Record<string, unknown> | undefined;
      confirm?: boolean | undefined;
      longRunning?: boolean | undefined;
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
  zRequirement: z.ZodObject<
    {
      id: z.ZodString;
      field: z.ZodString;
      description: z.ZodString;
      type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
      required: z.ZodBoolean;
      currentValue: z.ZodOptional<z.ZodUnknown>;
      options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
    },
    'strip',
    z.ZodTypeAny,
    {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    },
    {
      id: string;
      description: string;
      type: 'number' | 'boolean' | 'date' | 'text' | 'select';
      required: boolean;
      field: string;
      options?: string[] | undefined;
      currentValue?: unknown;
    }
  >;
  zAssumption: z.ZodObject<
    {
      id: z.ZodString;
      description: z.ZodString;
      confidence: z.ZodEnum<['low', 'medium', 'high']>;
      source: z.ZodOptional<z.ZodString>;
    },
    'strip',
    z.ZodTypeAny,
    {
      id: string;
      description: string;
      confidence: 'low' | 'medium' | 'high';
      source?: string | undefined;
    },
    {
      id: string;
      description: string;
      confidence: 'low' | 'medium' | 'high';
      source?: string | undefined;
    }
  >;
  zRisk: z.ZodObject<
    {
      id: z.ZodString;
      description: z.ZodString;
      severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
      mitigation: z.ZodOptional<z.ZodString>;
    },
    'strip',
    z.ZodTypeAny,
    {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigation?: string | undefined;
    },
    {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      mitigation?: string | undefined;
    }
  >;
  zInteractivePlan: z.ZodObject<
    {
      id: z.ZodString;
      title: z.ZodString;
      description: z.ZodString;
      steps: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            toolId: z.ZodString;
            action: z.ZodString;
            description: z.ZodString;
            zArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            requiredRole: z.ZodString;
            confirm: z.ZodOptional<z.ZodBoolean>;
            longRunning: z.ZodOptional<z.ZodBoolean>;
            order: z.ZodNumber;
            dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
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
            id: string;
            description: string;
            toolId: string;
            action: string;
            requiredRole: string;
            order: number;
            dependencies?: string[] | undefined;
            zArgs?: Record<string, unknown> | undefined;
            confirm?: boolean | undefined;
            longRunning?: boolean | undefined;
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
            id: string;
            description: string;
            toolId: string;
            action: string;
            requiredRole: string;
            order: number;
            dependencies?: string[] | undefined;
            zArgs?: Record<string, unknown> | undefined;
            confirm?: boolean | undefined;
            longRunning?: boolean | undefined;
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
      requirements: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            field: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
            required: z.ZodBoolean;
            currentValue: z.ZodOptional<z.ZodUnknown>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          },
          {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          }
        >,
        'many'
      >;
      assumptions: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            description: z.ZodString;
            confidence: z.ZodEnum<['low', 'medium', 'high']>;
            source: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            confidence: 'low' | 'medium' | 'high';
            source?: string | undefined;
          },
          {
            id: string;
            description: string;
            confidence: 'low' | 'medium' | 'high';
            source?: string | undefined;
          }
        >,
        'many'
      >;
      risks: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            description: z.ZodString;
            severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
            mitigation: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            mitigation?: string | undefined;
          },
          {
            id: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            mitigation?: string | undefined;
          }
        >,
        'many'
      >;
      estimatedDuration: z.ZodOptional<z.ZodNumber>;
      totalCost: z.ZodOptional<z.ZodNumber>;
      createdAt: z.ZodDate;
      updatedAt: z.ZodDate;
    },
    'strip',
    z.ZodTypeAny,
    {
      id: string;
      description: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      risks: {
        id: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        mitigation?: string | undefined;
      }[];
      requirements: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      steps: {
        id: string;
        description: string;
        toolId: string;
        action: string;
        requiredRole: string;
        order: number;
        dependencies?: string[] | undefined;
        zArgs?: Record<string, unknown> | undefined;
        confirm?: boolean | undefined;
        longRunning?: boolean | undefined;
        onFailure?: 'stop' | 'continue' | undefined;
        rollback?:
          | {
              toolId: string;
              action: string;
              args: Record<string, unknown>;
            }
          | undefined;
      }[];
      assumptions: {
        id: string;
        description: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string | undefined;
      }[];
      totalCost?: number | undefined;
      estimatedDuration?: number | undefined;
    },
    {
      id: string;
      description: string;
      title: string;
      createdAt: Date;
      updatedAt: Date;
      risks: {
        id: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        mitigation?: string | undefined;
      }[];
      requirements: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      steps: {
        id: string;
        description: string;
        toolId: string;
        action: string;
        requiredRole: string;
        order: number;
        dependencies?: string[] | undefined;
        zArgs?: Record<string, unknown> | undefined;
        confirm?: boolean | undefined;
        longRunning?: boolean | undefined;
        onFailure?: 'stop' | 'continue' | undefined;
        rollback?:
          | {
              toolId: string;
              action: string;
              args: Record<string, unknown>;
            }
          | undefined;
      }[];
      assumptions: {
        id: string;
        description: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string | undefined;
      }[];
      totalCost?: number | undefined;
      estimatedDuration?: number | undefined;
    }
  >;
  zUserReply: z.ZodObject<
    {
      id: z.ZodString;
      type: z.ZodEnum<['confirm', 'edit', 'dryrun', 'cancel', 'provide_value']>;
      timestamp: z.ZodDate;
      userId: z.ZodString;
      data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    },
    'strip',
    z.ZodTypeAny,
    {
      id: string;
      type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
      timestamp: Date;
      userId: string;
      data?: Record<string, unknown> | undefined;
    },
    {
      id: string;
      type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
      timestamp: Date;
      userId: string;
      data?: Record<string, unknown> | undefined;
    }
  >;
  zTaskSession: z.ZodObject<
    {
      id: z.ZodString;
      projectId: z.ZodOptional<z.ZodString>;
      userId: z.ZodString;
      status: z.ZodNativeEnum<{
        readonly COLLECTING: 'collecting';
        readonly AWAITING_CONFIRM: 'awaiting_confirm';
        readonly RUNNING: 'running';
        readonly SUCCEEDED: 'succeeded';
        readonly FAILED: 'failed';
        readonly CANCELLED: 'cancelled';
      }>;
      plan: z.ZodObject<
        {
          id: z.ZodString;
          title: z.ZodString;
          description: z.ZodString;
          steps: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                toolId: z.ZodString;
                action: z.ZodString;
                description: z.ZodString;
                zArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                requiredRole: z.ZodString;
                confirm: z.ZodOptional<z.ZodBoolean>;
                longRunning: z.ZodOptional<z.ZodBoolean>;
                order: z.ZodNumber;
                dependencies: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
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
                id: string;
                description: string;
                toolId: string;
                action: string;
                requiredRole: string;
                order: number;
                dependencies?: string[] | undefined;
                zArgs?: Record<string, unknown> | undefined;
                confirm?: boolean | undefined;
                longRunning?: boolean | undefined;
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
                id: string;
                description: string;
                toolId: string;
                action: string;
                requiredRole: string;
                order: number;
                dependencies?: string[] | undefined;
                zArgs?: Record<string, unknown> | undefined;
                confirm?: boolean | undefined;
                longRunning?: boolean | undefined;
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
          requirements: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                field: z.ZodString;
                description: z.ZodString;
                type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
                required: z.ZodBoolean;
                currentValue: z.ZodOptional<z.ZodUnknown>;
                options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                description: string;
                type: 'number' | 'boolean' | 'date' | 'text' | 'select';
                required: boolean;
                field: string;
                options?: string[] | undefined;
                currentValue?: unknown;
              },
              {
                id: string;
                description: string;
                type: 'number' | 'boolean' | 'date' | 'text' | 'select';
                required: boolean;
                field: string;
                options?: string[] | undefined;
                currentValue?: unknown;
              }
            >,
            'many'
          >;
          assumptions: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                description: z.ZodString;
                confidence: z.ZodEnum<['low', 'medium', 'high']>;
                source: z.ZodOptional<z.ZodString>;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                description: string;
                confidence: 'low' | 'medium' | 'high';
                source?: string | undefined;
              },
              {
                id: string;
                description: string;
                confidence: 'low' | 'medium' | 'high';
                source?: string | undefined;
              }
            >,
            'many'
          >;
          risks: z.ZodArray<
            z.ZodObject<
              {
                id: z.ZodString;
                description: z.ZodString;
                severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
                mitigation: z.ZodOptional<z.ZodString>;
              },
              'strip',
              z.ZodTypeAny,
              {
                id: string;
                description: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                mitigation?: string | undefined;
              },
              {
                id: string;
                description: string;
                severity: 'low' | 'medium' | 'high' | 'critical';
                mitigation?: string | undefined;
              }
            >,
            'many'
          >;
          estimatedDuration: z.ZodOptional<z.ZodNumber>;
          totalCost: z.ZodOptional<z.ZodNumber>;
          createdAt: z.ZodDate;
          updatedAt: z.ZodDate;
        },
        'strip',
        z.ZodTypeAny,
        {
          id: string;
          description: string;
          title: string;
          createdAt: Date;
          updatedAt: Date;
          risks: {
            id: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            mitigation?: string | undefined;
          }[];
          requirements: {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          }[];
          steps: {
            id: string;
            description: string;
            toolId: string;
            action: string;
            requiredRole: string;
            order: number;
            dependencies?: string[] | undefined;
            zArgs?: Record<string, unknown> | undefined;
            confirm?: boolean | undefined;
            longRunning?: boolean | undefined;
            onFailure?: 'stop' | 'continue' | undefined;
            rollback?:
              | {
                  toolId: string;
                  action: string;
                  args: Record<string, unknown>;
                }
              | undefined;
          }[];
          assumptions: {
            id: string;
            description: string;
            confidence: 'low' | 'medium' | 'high';
            source?: string | undefined;
          }[];
          totalCost?: number | undefined;
          estimatedDuration?: number | undefined;
        },
        {
          id: string;
          description: string;
          title: string;
          createdAt: Date;
          updatedAt: Date;
          risks: {
            id: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            mitigation?: string | undefined;
          }[];
          requirements: {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          }[];
          steps: {
            id: string;
            description: string;
            toolId: string;
            action: string;
            requiredRole: string;
            order: number;
            dependencies?: string[] | undefined;
            zArgs?: Record<string, unknown> | undefined;
            confirm?: boolean | undefined;
            longRunning?: boolean | undefined;
            onFailure?: 'stop' | 'continue' | undefined;
            rollback?:
              | {
                  toolId: string;
                  action: string;
                  args: Record<string, unknown>;
                }
              | undefined;
          }[];
          assumptions: {
            id: string;
            description: string;
            confidence: 'low' | 'medium' | 'high';
            source?: string | undefined;
          }[];
          totalCost?: number | undefined;
          estimatedDuration?: number | undefined;
        }
      >;
      replies: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            type: z.ZodEnum<['confirm', 'edit', 'dryrun', 'cancel', 'provide_value']>;
            timestamp: z.ZodDate;
            userId: z.ZodString;
            data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
            timestamp: Date;
            userId: string;
            data?: Record<string, unknown> | undefined;
          },
          {
            id: string;
            type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
            timestamp: Date;
            userId: string;
            data?: Record<string, unknown> | undefined;
          }
        >,
        'many'
      >;
      currentStep: z.ZodOptional<z.ZodNumber>;
      startedAt: z.ZodOptional<z.ZodDate>;
      completedAt: z.ZodOptional<z.ZodDate>;
      error: z.ZodOptional<z.ZodString>;
      createdAt: z.ZodDate;
      updatedAt: z.ZodDate;
    },
    'strip',
    z.ZodTypeAny,
    {
      id: string;
      status: 'succeeded' | 'failed' | 'running' | 'cancelled' | 'collecting' | 'awaiting_confirm';
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      plan: {
        id: string;
        description: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        risks: {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        }[];
        requirements: {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }[];
        steps: {
          id: string;
          description: string;
          toolId: string;
          action: string;
          requiredRole: string;
          order: number;
          dependencies?: string[] | undefined;
          zArgs?: Record<string, unknown> | undefined;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
          onFailure?: 'stop' | 'continue' | undefined;
          rollback?:
            | {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            | undefined;
        }[];
        assumptions: {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        }[];
        totalCost?: number | undefined;
        estimatedDuration?: number | undefined;
      };
      replies: {
        id: string;
        type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
        timestamp: Date;
        userId: string;
        data?: Record<string, unknown> | undefined;
      }[];
      projectId?: string | undefined;
      currentStep?: number | undefined;
      completedAt?: Date | undefined;
      startedAt?: Date | undefined;
      error?: string | undefined;
    },
    {
      id: string;
      status: 'succeeded' | 'failed' | 'running' | 'cancelled' | 'collecting' | 'awaiting_confirm';
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      plan: {
        id: string;
        description: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        risks: {
          id: string;
          description: string;
          severity: 'low' | 'medium' | 'high' | 'critical';
          mitigation?: string | undefined;
        }[];
        requirements: {
          id: string;
          description: string;
          type: 'number' | 'boolean' | 'date' | 'text' | 'select';
          required: boolean;
          field: string;
          options?: string[] | undefined;
          currentValue?: unknown;
        }[];
        steps: {
          id: string;
          description: string;
          toolId: string;
          action: string;
          requiredRole: string;
          order: number;
          dependencies?: string[] | undefined;
          zArgs?: Record<string, unknown> | undefined;
          confirm?: boolean | undefined;
          longRunning?: boolean | undefined;
          onFailure?: 'stop' | 'continue' | undefined;
          rollback?:
            | {
                toolId: string;
                action: string;
                args: Record<string, unknown>;
              }
            | undefined;
        }[];
        assumptions: {
          id: string;
          description: string;
          confidence: 'low' | 'medium' | 'high';
          source?: string | undefined;
        }[];
        totalCost?: number | undefined;
        estimatedDuration?: number | undefined;
      };
      replies: {
        id: string;
        type: 'confirm' | 'edit' | 'dryrun' | 'cancel' | 'provide_value';
        timestamp: Date;
        userId: string;
        data?: Record<string, unknown> | undefined;
      }[];
      projectId?: string | undefined;
      currentStep?: number | undefined;
      completedAt?: Date | undefined;
      startedAt?: Date | undefined;
      error?: string | undefined;
    }
  >;
  zPlanValidation: z.ZodObject<
    {
      missing: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            field: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
            required: z.ZodBoolean;
            currentValue: z.ZodOptional<z.ZodUnknown>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          },
          {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          }
        >,
        'many'
      >;
      ready: z.ZodBoolean;
      warnings: z.ZodArray<z.ZodString, 'many'>;
      errors: z.ZodArray<z.ZodString, 'many'>;
    },
    'strip',
    z.ZodTypeAny,
    {
      warnings: string[];
      missing: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      errors: string[];
      ready: boolean;
    },
    {
      warnings: string[];
      missing: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      errors: string[];
      ready: boolean;
    }
  >;
  zPlanPreview: z.ZodObject<
    {
      title: z.ZodString;
      description: z.ZodString;
      steps: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            description: z.ZodString;
            toolId: z.ZodString;
            action: z.ZodString;
            status: z.ZodOptional<
              z.ZodEnum<['pending', 'ready', 'running', 'completed', 'failed']>
            >;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            toolId: string;
            action: string;
            status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
          },
          {
            id: string;
            description: string;
            toolId: string;
            action: string;
            status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
          }
        >,
        'many'
      >;
      missing: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            field: z.ZodString;
            description: z.ZodString;
            type: z.ZodEnum<['text', 'number', 'select', 'date', 'boolean']>;
            required: z.ZodBoolean;
            currentValue: z.ZodOptional<z.ZodUnknown>;
            options: z.ZodOptional<z.ZodArray<z.ZodString, 'many'>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          },
          {
            id: string;
            description: string;
            type: 'number' | 'boolean' | 'date' | 'text' | 'select';
            required: boolean;
            field: string;
            options?: string[] | undefined;
            currentValue?: unknown;
          }
        >,
        'many'
      >;
      assumptions: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            description: z.ZodString;
            confidence: z.ZodEnum<['low', 'medium', 'high']>;
            source: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            confidence: 'low' | 'medium' | 'high';
            source?: string | undefined;
          },
          {
            id: string;
            description: string;
            confidence: 'low' | 'medium' | 'high';
            source?: string | undefined;
          }
        >,
        'many'
      >;
      risks: z.ZodArray<
        z.ZodObject<
          {
            id: z.ZodString;
            description: z.ZodString;
            severity: z.ZodEnum<['low', 'medium', 'high', 'critical']>;
            mitigation: z.ZodOptional<z.ZodString>;
          },
          'strip',
          z.ZodTypeAny,
          {
            id: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            mitigation?: string | undefined;
          },
          {
            id: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            mitigation?: string | undefined;
          }
        >,
        'many'
      >;
      estimatedDuration: z.ZodOptional<z.ZodNumber>;
      totalCost: z.ZodOptional<z.ZodNumber>;
      ctas: z.ZodArray<z.ZodEnum<['confirm', 'edit', 'dryrun', 'cancel']>, 'many'>;
    },
    'strip',
    z.ZodTypeAny,
    {
      description: string;
      title: string;
      risks: {
        id: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        mitigation?: string | undefined;
      }[];
      missing: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      steps: {
        id: string;
        description: string;
        toolId: string;
        action: string;
        status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
      }[];
      assumptions: {
        id: string;
        description: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string | undefined;
      }[];
      ctas: ('confirm' | 'edit' | 'dryrun' | 'cancel')[];
      totalCost?: number | undefined;
      estimatedDuration?: number | undefined;
    },
    {
      description: string;
      title: string;
      risks: {
        id: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        mitigation?: string | undefined;
      }[];
      missing: {
        id: string;
        description: string;
        type: 'number' | 'boolean' | 'date' | 'text' | 'select';
        required: boolean;
        field: string;
        options?: string[] | undefined;
        currentValue?: unknown;
      }[];
      steps: {
        id: string;
        description: string;
        toolId: string;
        action: string;
        status?: 'pending' | 'failed' | 'completed' | 'running' | 'ready' | undefined;
      }[];
      assumptions: {
        id: string;
        description: string;
        confidence: 'low' | 'medium' | 'high';
        source?: string | undefined;
      }[];
      ctas: ('confirm' | 'edit' | 'dryrun' | 'cancel')[];
      totalCost?: number | undefined;
      estimatedDuration?: number | undefined;
    }
  >;
};
export type InteractivePlanStep = z.infer<typeof zPlanStep>;
export type InteractiveRequirement = z.infer<typeof zRequirement>;
export type InteractiveAssumption = z.infer<typeof zAssumption>;
export type InteractiveRisk = z.infer<typeof zRisk>;
export type InteractivePlan = z.infer<typeof zInteractivePlan>;
export type InteractiveUserReply = z.infer<typeof zUserReply>;
export type InteractiveTaskSession = z.infer<typeof zTaskSession>;
export type InteractivePlanValidation = z.infer<typeof zPlanValidation>;
export type InteractivePlanPreview = z.infer<typeof zPlanPreview>;
export type { ToolRunSubStep, ToolRun } from './tools';
//# sourceMappingURL=interactive.d.ts.map
