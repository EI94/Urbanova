'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zEnhancedChatResponse =
  exports.zDealProcessingResult =
  exports.zEnhancedChatCommand =
  exports.zDealInputBySearch =
  exports.zDealInputByLink =
  exports.ChatIntent =
    void 0;
const zod_1 = require('zod');
// Chat Intent types
exports.ChatIntent = zod_1.z.enum([
  'DEAL_NEW',
  'PROJECT_STATUS',
  'LAND_SEARCH',
  'FEASIBILITY_ANALYSIS',
  'DEAL_STATUS',
  'HELP',
  'UNKNOWN',
]);
// Deal Input schemas
exports.zDealInputByLink = zod_1.z.object({
  type: zod_1.z.literal('LINK'),
  link: zod_1.z.string().url('Link must be a valid URL'),
  sensitivity: zod_1.z
    .object({
      optimistic: zod_1.z.number().min(0).max(50).default(5), // +5%
      pessimistic: zod_1.z.number().min(0).max(50).default(10), // -10%
    })
    .optional()
    .default({ optimistic: 5, pessimistic: 10 }),
});
exports.zDealInputBySearch = zod_1.z.object({
  type: zod_1.z.literal('SEARCH'),
  city: zod_1.z.string().min(1, 'City is required'),
  budgetMax: zod_1.z
    .string()
    .regex(/^\d+(\.\d+)?[KMB]?$/, 'Budget must be in format: 1.2M, 500K, etc.'),
  sensitivity: zod_1.z
    .object({
      optimistic: zod_1.z.number().min(0).max(50).default(5),
      pessimistic: zod_1.z.number().min(0).max(50).default(10),
    })
    .optional()
    .default({ optimistic: 5, pessimistic: 10 }),
});
// Enhanced ChatCommand with deal-specific fields
exports.zEnhancedChatCommand = zod_1.z.object({
  id: zod_1.z.string(),
  message: zod_1.z.string().min(1),
  from: zod_1.z.string(),
  timestamp: zod_1.z.date(),
  messageSid: zod_1.z.string(),
  accountSid: zod_1.z.string(),
  // Deal-specific parsing
  dealInput: zod_1.z.union([exports.zDealInputByLink, exports.zDealInputBySearch]).optional(),
  intent: exports.ChatIntent.optional(),
});
// Deal processing result
exports.zDealProcessingResult = zod_1.z.object({
  projectId: zod_1.z.string(),
  dealId: zod_1.z.string(),
  feasibilityId: zod_1.z.string(),
  title: zod_1.z.string(),
  roi: zod_1.z.number(),
  paybackYears: zod_1.z.number(),
  pdfUrl: zod_1.z.string().url(),
  projectDeepLink: zod_1.z.string(),
});
// Enhanced ChatResponse for deal creation
exports.zEnhancedChatResponse = zod_1.z.object({
  id: zod_1.z.string(),
  commandId: zod_1.z.string(),
  message: zod_1.z.string(),
  type: zod_1.z.enum(['TEXT', 'MEDIA', 'ACTION']),
  actions: zod_1.z
    .array(
      zod_1.z.object({
        type: zod_1.z.string(),
        label: zod_1.z.string(),
        url: zod_1.z.string().optional(),
        data: zod_1.z.record(zod_1.z.unknown()).optional(),
      })
    )
    .optional(),
  metadata: zod_1.z.object({
    processingTime: zod_1.z.number(),
    confidence: zod_1.z.number(),
    nextSteps: zod_1.z.array(zod_1.z.string()),
    dealResult: exports.zDealProcessingResult.optional(),
  }),
});
//# sourceMappingURL=chat.js.map
