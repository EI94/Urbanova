import { z } from 'zod';

// Twilio inbound webhook types
export const zTwilioInbound = z.object({
  Body: z.string().min(1, 'Message body is required'),
  From: z.string().min(1, 'From number is required'),
  MessageSid: z.string().min(1, 'Message SID is required'),
  AccountSid: z.string().min(1, 'Account SID is required'),
  To: z.string().optional(),
  MediaUrl0: z.string().url().optional(),
  NumMedia: z.string().optional(),
  // Additional Twilio fields
  WaId: z.string().optional(), // WhatsApp ID
  ProfileName: z.string().optional(), // Contact name
  SmsStatus: z.string().optional(),
  SmsSid: z.string().optional(),
});

export type TwilioInbound = z.infer<typeof zTwilioInbound>;

// Chat reply types
export const zChatReply = z.object({
  to: z.string().min(1, 'Recipient number required'),
  body: z.string().min(1, 'Message body required'),
  mediaUrl: z.string().url().optional(),
  // Twilio specific fields
  from: z.string().optional(), // Will use default if not specified
  statusCallback: z.string().url().optional(),
  maxPrice: z.string().optional(),
  provideFeedback: z.boolean().optional(),
});

export type ChatReply = z.infer<typeof zChatReply>;

// Rate limiting types
export const zRateLimitResult = z.object({
  allowed: z.boolean(),
  remaining: z.number().min(0),
  resetTime: z.date(),
  retryAfter: z.number().optional(), // seconds to wait
  limit: z.number().min(1),
  window: z.number().min(1), // window in seconds
});

export type RateLimitResult = z.infer<typeof zRateLimitResult>;

// Rate limit configuration
export const zRateLimitConfig = z.object({
  capacity: z.number().min(1).default(10),
  refillRate: z.number().min(0.1).default(1), // tokens per window
  windowSeconds: z.number().min(1).default(20), // refill window
  burstSize: z.number().min(1).default(15), // max burst tokens
});

export type RateLimitConfig = z.infer<typeof zRateLimitConfig>;

// Rate limit key (for Firestore)
export const zRateLimitKey = z.object({
  waSenderId: z.string().min(1),
  bucketId: z.string().min(1), // e.g., "default", "premium"
  windowStart: z.date(), // start of current window
});

export type RateLimitKey = z.infer<typeof zRateLimitKey>;

// Rate limit state in Firestore
export const zRateLimitState = z.object({
  key: zRateLimitKey,
  tokens: z.number().min(0),
  lastRefill: z.date(),
  version: z.number().min(1),
});

export type RateLimitState = z.infer<typeof zRateLimitState>;
