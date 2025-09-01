import { z } from 'zod';
export declare const ChatIntent: z.ZodEnum<
  [
    'DEAL_NEW',
    'PROJECT_STATUS',
    'LAND_SEARCH',
    'FEASIBILITY_ANALYSIS',
    'DEAL_STATUS',
    'HELP',
    'UNKNOWN',
  ]
>;
export type ChatIntent = z.infer<typeof ChatIntent>;
export declare const zDealInputByLink: z.ZodObject<
  {
    type: z.ZodLiteral<'LINK'>;
    link: z.ZodString;
    sensitivity: z.ZodDefault<
      z.ZodOptional<
        z.ZodObject<
          {
            optimistic: z.ZodDefault<z.ZodNumber>;
            pessimistic: z.ZodDefault<z.ZodNumber>;
          },
          'strip',
          z.ZodTypeAny,
          {
            optimistic: number;
            pessimistic: number;
          },
          {
            optimistic?: number | undefined;
            pessimistic?: number | undefined;
          }
        >
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: 'LINK';
    link: string;
    sensitivity: {
      optimistic: number;
      pessimistic: number;
    };
  },
  {
    type: 'LINK';
    link: string;
    sensitivity?:
      | {
          optimistic?: number | undefined;
          pessimistic?: number | undefined;
        }
      | undefined;
  }
>;
export declare const zDealInputBySearch: z.ZodObject<
  {
    type: z.ZodLiteral<'SEARCH'>;
    city: z.ZodString;
    budgetMax: z.ZodString;
    sensitivity: z.ZodDefault<
      z.ZodOptional<
        z.ZodObject<
          {
            optimistic: z.ZodDefault<z.ZodNumber>;
            pessimistic: z.ZodDefault<z.ZodNumber>;
          },
          'strip',
          z.ZodTypeAny,
          {
            optimistic: number;
            pessimistic: number;
          },
          {
            optimistic?: number | undefined;
            pessimistic?: number | undefined;
          }
        >
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: 'SEARCH';
    city: string;
    budgetMax: string;
    sensitivity: {
      optimistic: number;
      pessimistic: number;
    };
  },
  {
    type: 'SEARCH';
    city: string;
    budgetMax: string;
    sensitivity?:
      | {
          optimistic?: number | undefined;
          pessimistic?: number | undefined;
        }
      | undefined;
  }
>;
export type DealInputByLink = z.infer<typeof zDealInputByLink>;
export type DealInputBySearch = z.infer<typeof zDealInputBySearch>;
export declare const zEnhancedChatCommand: z.ZodObject<
  {
    id: z.ZodString;
    message: z.ZodString;
    from: z.ZodString;
    timestamp: z.ZodDate;
    messageSid: z.ZodString;
    accountSid: z.ZodString;
    dealInput: z.ZodOptional<
      z.ZodUnion<
        [
          z.ZodObject<
            {
              type: z.ZodLiteral<'LINK'>;
              link: z.ZodString;
              sensitivity: z.ZodDefault<
                z.ZodOptional<
                  z.ZodObject<
                    {
                      optimistic: z.ZodDefault<z.ZodNumber>;
                      pessimistic: z.ZodDefault<z.ZodNumber>;
                    },
                    'strip',
                    z.ZodTypeAny,
                    {
                      optimistic: number;
                      pessimistic: number;
                    },
                    {
                      optimistic?: number | undefined;
                      pessimistic?: number | undefined;
                    }
                  >
                >
              >;
            },
            'strip',
            z.ZodTypeAny,
            {
              type: 'LINK';
              link: string;
              sensitivity: {
                optimistic: number;
                pessimistic: number;
              };
            },
            {
              type: 'LINK';
              link: string;
              sensitivity?:
                | {
                    optimistic?: number | undefined;
                    pessimistic?: number | undefined;
                  }
                | undefined;
            }
          >,
          z.ZodObject<
            {
              type: z.ZodLiteral<'SEARCH'>;
              city: z.ZodString;
              budgetMax: z.ZodString;
              sensitivity: z.ZodDefault<
                z.ZodOptional<
                  z.ZodObject<
                    {
                      optimistic: z.ZodDefault<z.ZodNumber>;
                      pessimistic: z.ZodDefault<z.ZodNumber>;
                    },
                    'strip',
                    z.ZodTypeAny,
                    {
                      optimistic: number;
                      pessimistic: number;
                    },
                    {
                      optimistic?: number | undefined;
                      pessimistic?: number | undefined;
                    }
                  >
                >
              >;
            },
            'strip',
            z.ZodTypeAny,
            {
              type: 'SEARCH';
              city: string;
              budgetMax: string;
              sensitivity: {
                optimistic: number;
                pessimistic: number;
              };
            },
            {
              type: 'SEARCH';
              city: string;
              budgetMax: string;
              sensitivity?:
                | {
                    optimistic?: number | undefined;
                    pessimistic?: number | undefined;
                  }
                | undefined;
            }
          >,
        ]
      >
    >;
    intent: z.ZodOptional<
      z.ZodEnum<
        [
          'DEAL_NEW',
          'PROJECT_STATUS',
          'LAND_SEARCH',
          'FEASIBILITY_ANALYSIS',
          'DEAL_STATUS',
          'HELP',
          'UNKNOWN',
        ]
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    message: string;
    timestamp: Date;
    from: string;
    messageSid: string;
    accountSid: string;
    intent?:
      | 'DEAL_NEW'
      | 'PROJECT_STATUS'
      | 'LAND_SEARCH'
      | 'FEASIBILITY_ANALYSIS'
      | 'DEAL_STATUS'
      | 'HELP'
      | 'UNKNOWN'
      | undefined;
    dealInput?:
      | {
          type: 'LINK';
          link: string;
          sensitivity: {
            optimistic: number;
            pessimistic: number;
          };
        }
      | {
          type: 'SEARCH';
          city: string;
          budgetMax: string;
          sensitivity: {
            optimistic: number;
            pessimistic: number;
          };
        }
      | undefined;
  },
  {
    id: string;
    message: string;
    timestamp: Date;
    from: string;
    messageSid: string;
    accountSid: string;
    intent?:
      | 'DEAL_NEW'
      | 'PROJECT_STATUS'
      | 'LAND_SEARCH'
      | 'FEASIBILITY_ANALYSIS'
      | 'DEAL_STATUS'
      | 'HELP'
      | 'UNKNOWN'
      | undefined;
    dealInput?:
      | {
          type: 'LINK';
          link: string;
          sensitivity?:
            | {
                optimistic?: number | undefined;
                pessimistic?: number | undefined;
              }
            | undefined;
        }
      | {
          type: 'SEARCH';
          city: string;
          budgetMax: string;
          sensitivity?:
            | {
                optimistic?: number | undefined;
                pessimistic?: number | undefined;
              }
            | undefined;
        }
      | undefined;
  }
>;
export type EnhancedChatCommand = z.infer<typeof zEnhancedChatCommand>;
export declare const zDealProcessingResult: z.ZodObject<
  {
    projectId: z.ZodString;
    dealId: z.ZodString;
    feasibilityId: z.ZodString;
    title: z.ZodString;
    roi: z.ZodNumber;
    paybackYears: z.ZodNumber;
    pdfUrl: z.ZodString;
    projectDeepLink: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    projectId: string;
    title: string;
    dealId: string;
    roi: number;
    paybackYears: number;
    pdfUrl: string;
    feasibilityId: string;
    projectDeepLink: string;
  },
  {
    projectId: string;
    title: string;
    dealId: string;
    roi: number;
    paybackYears: number;
    pdfUrl: string;
    feasibilityId: string;
    projectDeepLink: string;
  }
>;
export type DealProcessingResult = z.infer<typeof zDealProcessingResult>;
export declare const zEnhancedChatResponse: z.ZodObject<
  {
    id: z.ZodString;
    commandId: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<['TEXT', 'MEDIA', 'ACTION']>;
    actions: z.ZodOptional<
      z.ZodArray<
        z.ZodObject<
          {
            type: z.ZodString;
            label: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
          },
          'strip',
          z.ZodTypeAny,
          {
            type: string;
            label: string;
            url?: string | undefined;
            data?: Record<string, unknown> | undefined;
          },
          {
            type: string;
            label: string;
            url?: string | undefined;
            data?: Record<string, unknown> | undefined;
          }
        >,
        'many'
      >
    >;
    metadata: z.ZodObject<
      {
        processingTime: z.ZodNumber;
        confidence: z.ZodNumber;
        nextSteps: z.ZodArray<z.ZodString, 'many'>;
        dealResult: z.ZodOptional<
          z.ZodObject<
            {
              projectId: z.ZodString;
              dealId: z.ZodString;
              feasibilityId: z.ZodString;
              title: z.ZodString;
              roi: z.ZodNumber;
              paybackYears: z.ZodNumber;
              pdfUrl: z.ZodString;
              projectDeepLink: z.ZodString;
            },
            'strip',
            z.ZodTypeAny,
            {
              projectId: string;
              title: string;
              dealId: string;
              roi: number;
              paybackYears: number;
              pdfUrl: string;
              feasibilityId: string;
              projectDeepLink: string;
            },
            {
              projectId: string;
              title: string;
              dealId: string;
              roi: number;
              paybackYears: number;
              pdfUrl: string;
              feasibilityId: string;
              projectDeepLink: string;
            }
          >
        >;
      },
      'strip',
      z.ZodTypeAny,
      {
        confidence: number;
        processingTime: number;
        nextSteps: string[];
        dealResult?:
          | {
              projectId: string;
              title: string;
              dealId: string;
              roi: number;
              paybackYears: number;
              pdfUrl: string;
              feasibilityId: string;
              projectDeepLink: string;
            }
          | undefined;
      },
      {
        confidence: number;
        processingTime: number;
        nextSteps: string[];
        dealResult?:
          | {
              projectId: string;
              title: string;
              dealId: string;
              roi: number;
              paybackYears: number;
              pdfUrl: string;
              feasibilityId: string;
              projectDeepLink: string;
            }
          | undefined;
      }
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    id: string;
    message: string;
    type: 'ACTION' | 'TEXT' | 'MEDIA';
    metadata: {
      confidence: number;
      processingTime: number;
      nextSteps: string[];
      dealResult?:
        | {
            projectId: string;
            title: string;
            dealId: string;
            roi: number;
            paybackYears: number;
            pdfUrl: string;
            feasibilityId: string;
            projectDeepLink: string;
          }
        | undefined;
    };
    commandId: string;
    actions?:
      | {
          type: string;
          label: string;
          url?: string | undefined;
          data?: Record<string, unknown> | undefined;
        }[]
      | undefined;
  },
  {
    id: string;
    message: string;
    type: 'ACTION' | 'TEXT' | 'MEDIA';
    metadata: {
      confidence: number;
      processingTime: number;
      nextSteps: string[];
      dealResult?:
        | {
            projectId: string;
            title: string;
            dealId: string;
            roi: number;
            paybackYears: number;
            pdfUrl: string;
            feasibilityId: string;
            projectDeepLink: string;
          }
        | undefined;
    };
    commandId: string;
    actions?:
      | {
          type: string;
          label: string;
          url?: string | undefined;
          data?: Record<string, unknown> | undefined;
        }[]
      | undefined;
  }
>;
export type EnhancedChatResponse = z.infer<typeof zEnhancedChatResponse>;
//# sourceMappingURL=chat.d.ts.map
