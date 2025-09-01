'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zRateLimitState =
  exports.zRateLimitKey =
  exports.zRateLimitConfig =
  exports.zRateLimitResult =
  exports.zChatReply =
  exports.zTwilioInbound =
    void 0;
const zod_1 = require('zod');
// Twilio inbound webhook types
exports.zTwilioInbound = zod_1.z.object({
  Body: zod_1.z.string().min(1, 'Message body is required'),
  From: zod_1.z.string().min(1, 'From number is required'),
  MessageSid: zod_1.z.string().min(1, 'Message SID is required'),
  AccountSid: zod_1.z.string().min(1, 'Account SID is required'),
  To: zod_1.z.string().optional(),
  MediaUrl0: zod_1.z.string().url().optional(),
  NumMedia: zod_1.z.string().optional(),
  // Additional Twilio fields
  WaId: zod_1.z.string().optional(), // WhatsApp ID
  ProfileName: zod_1.z.string().optional(), // Contact name
  SmsStatus: zod_1.z.string().optional(),
  SmsSid: zod_1.z.string().optional(),
});
// Chat reply types
exports.zChatReply = zod_1.z.object({
  to: zod_1.z.string().min(1, 'Recipient number required'),
  body: zod_1.z.string().min(1, 'Message body required'),
  mediaUrl: zod_1.z.string().url().optional(),
  // Twilio specific fields
  from: zod_1.z.string().optional(), // Will use default if not specified
  statusCallback: zod_1.z.string().url().optional(),
  maxPrice: zod_1.z.string().optional(),
  provideFeedback: zod_1.z.boolean().optional(),
});
// Rate limiting types
exports.zRateLimitResult = zod_1.z.object({
  allowed: zod_1.z.boolean(),
  remaining: zod_1.z.number().min(0),
  resetTime: zod_1.z.date(),
  retryAfter: zod_1.z.number().optional(), // seconds to wait
  limit: zod_1.z.number().min(1),
  window: zod_1.z.number().min(1), // window in seconds
});
// Rate limit configuration
exports.zRateLimitConfig = zod_1.z.object({
  capacity: zod_1.z.number().min(1).default(10),
  refillRate: zod_1.z.number().min(0.1).default(1), // tokens per window
  windowSeconds: zod_1.z.number().min(1).default(20), // refill window
  burstSize: zod_1.z.number().min(1).default(15), // max burst tokens
});
// Rate limit key (for Firestore)
exports.zRateLimitKey = zod_1.z.object({
  waSenderId: zod_1.z.string().min(1),
  bucketId: zod_1.z.string().min(1), // e.g., "default", "premium"
  windowStart: zod_1.z.date(), // start of current window
});
// Rate limit state in Firestore
exports.zRateLimitState = zod_1.z.object({
  key: exports.zRateLimitKey,
  tokens: zod_1.z.number().min(0),
  lastRefill: zod_1.z.date(),
  version: zod_1.z.number().min(1),
});
//# sourceMappingURL=messaging.js.map
