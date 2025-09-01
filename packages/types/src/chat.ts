import { z } from 'zod';

// Chat Intent types
export const ChatIntent = z.enum([
  'DEAL_NEW',
  'PROJECT_STATUS',
  'LAND_SEARCH',
  'FEASIBILITY_ANALYSIS',
  'DEAL_STATUS',
  'HELP',
  'UNKNOWN',
]);

export type ChatIntent = z.infer<typeof ChatIntent>;

// Deal Input schemas
export const zDealInputByLink = z.object({
  type: z.literal('LINK'),
  link: z.string().url('Link must be a valid URL'),
  sensitivity: z
    .object({
      optimistic: z.number().min(0).max(50).default(5), // +5%
      pessimistic: z.number().min(0).max(50).default(10), // -10%
    })
    .optional()
    .default({ optimistic: 5, pessimistic: 10 }),
});

export const zDealInputBySearch = z.object({
  type: z.literal('SEARCH'),
  city: z.string().min(1, 'City is required'),
  budgetMax: z.string().regex(/^\d+(\.\d+)?[KMB]?$/, 'Budget must be in format: 1.2M, 500K, etc.'),
  sensitivity: z
    .object({
      optimistic: z.number().min(0).max(50).default(5),
      pessimistic: z.number().min(0).max(50).default(10),
    })
    .optional()
    .default({ optimistic: 5, pessimistic: 10 }),
});

export type DealInputByLink = z.infer<typeof zDealInputByLink>;
export type DealInputBySearch = z.infer<typeof zDealInputBySearch>;

// Enhanced ChatCommand with deal-specific fields
export const zEnhancedChatCommand = z.object({
  id: z.string(),
  message: z.string().min(1),
  from: z.string(),
  timestamp: z.date(),
  messageSid: z.string(),
  accountSid: z.string(),
  // Deal-specific parsing
  dealInput: z.union([zDealInputByLink, zDealInputBySearch]).optional(),
  intent: ChatIntent.optional(),
});

export type EnhancedChatCommand = z.infer<typeof zEnhancedChatCommand>;

// Deal processing result
export const zDealProcessingResult = z.object({
  projectId: z.string(),
  dealId: z.string(),
  feasibilityId: z.string(),
  title: z.string(),
  roi: z.number(),
  paybackYears: z.number(),
  pdfUrl: z.string().url(),
  projectDeepLink: z.string(),
});

export type DealProcessingResult = z.infer<typeof zDealProcessingResult>;

// Enhanced ChatResponse for deal creation
export const zEnhancedChatResponse = z.object({
  id: z.string(),
  commandId: z.string(),
  message: z.string(),
  type: z.enum(['TEXT', 'MEDIA', 'ACTION']),
  actions: z
    .array(
      z.object({
        type: z.string(),
        label: z.string(),
        url: z.string().optional(),
        data: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
  metadata: z.object({
    processingTime: z.number(),
    confidence: z.number(),
    nextSteps: z.array(z.string()),
    dealResult: zDealProcessingResult.optional(),
  }),
});

export type EnhancedChatResponse = z.infer<typeof zEnhancedChatResponse>;
