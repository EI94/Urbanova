import { z } from 'zod';
export declare const zTwilioInbound: z.ZodObject<
  {
    Body: z.ZodString;
    From: z.ZodString;
    MessageSid: z.ZodString;
    AccountSid: z.ZodString;
    To: z.ZodOptional<z.ZodString>;
    MediaUrl0: z.ZodOptional<z.ZodString>;
    NumMedia: z.ZodOptional<z.ZodString>;
    WaId: z.ZodOptional<z.ZodString>;
    ProfileName: z.ZodOptional<z.ZodString>;
    SmsStatus: z.ZodOptional<z.ZodString>;
    SmsSid: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    Body: string;
    From: string;
    MessageSid: string;
    AccountSid: string;
    To?: string | undefined;
    MediaUrl0?: string | undefined;
    NumMedia?: string | undefined;
    WaId?: string | undefined;
    ProfileName?: string | undefined;
    SmsStatus?: string | undefined;
    SmsSid?: string | undefined;
  },
  {
    Body: string;
    From: string;
    MessageSid: string;
    AccountSid: string;
    To?: string | undefined;
    MediaUrl0?: string | undefined;
    NumMedia?: string | undefined;
    WaId?: string | undefined;
    ProfileName?: string | undefined;
    SmsStatus?: string | undefined;
    SmsSid?: string | undefined;
  }
>;
export type TwilioInbound = z.infer<typeof zTwilioInbound>;
export declare const zChatReply: z.ZodObject<
  {
    to: z.ZodString;
    body: z.ZodString;
    mediaUrl: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    statusCallback: z.ZodOptional<z.ZodString>;
    maxPrice: z.ZodOptional<z.ZodString>;
    provideFeedback: z.ZodOptional<z.ZodBoolean>;
  },
  'strip',
  z.ZodTypeAny,
  {
    body: string;
    to: string;
    from?: string | undefined;
    mediaUrl?: string | undefined;
    statusCallback?: string | undefined;
    maxPrice?: string | undefined;
    provideFeedback?: boolean | undefined;
  },
  {
    body: string;
    to: string;
    from?: string | undefined;
    mediaUrl?: string | undefined;
    statusCallback?: string | undefined;
    maxPrice?: string | undefined;
    provideFeedback?: boolean | undefined;
  }
>;
export type ChatReply = z.infer<typeof zChatReply>;
export declare const zRateLimitResult: z.ZodObject<
  {
    allowed: z.ZodBoolean;
    remaining: z.ZodNumber;
    resetTime: z.ZodDate;
    retryAfter: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodNumber;
    window: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    limit: number;
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    window: number;
    retryAfter?: number | undefined;
  },
  {
    limit: number;
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    window: number;
    retryAfter?: number | undefined;
  }
>;
export type RateLimitResult = z.infer<typeof zRateLimitResult>;
export declare const zRateLimitConfig: z.ZodObject<
  {
    capacity: z.ZodDefault<z.ZodNumber>;
    refillRate: z.ZodDefault<z.ZodNumber>;
    windowSeconds: z.ZodDefault<z.ZodNumber>;
    burstSize: z.ZodDefault<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    capacity: number;
    refillRate: number;
    windowSeconds: number;
    burstSize: number;
  },
  {
    capacity?: number | undefined;
    refillRate?: number | undefined;
    windowSeconds?: number | undefined;
    burstSize?: number | undefined;
  }
>;
export type RateLimitConfig = z.infer<typeof zRateLimitConfig>;
export declare const zRateLimitKey: z.ZodObject<
  {
    waSenderId: z.ZodString;
    bucketId: z.ZodString;
    windowStart: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    waSenderId: string;
    bucketId: string;
    windowStart: Date;
  },
  {
    waSenderId: string;
    bucketId: string;
    windowStart: Date;
  }
>;
export type RateLimitKey = z.infer<typeof zRateLimitKey>;
export declare const zRateLimitState: z.ZodObject<
  {
    key: z.ZodObject<
      {
        waSenderId: z.ZodString;
        bucketId: z.ZodString;
        windowStart: z.ZodDate;
      },
      'strip',
      z.ZodTypeAny,
      {
        waSenderId: string;
        bucketId: string;
        windowStart: Date;
      },
      {
        waSenderId: string;
        bucketId: string;
        windowStart: Date;
      }
    >;
    tokens: z.ZodNumber;
    lastRefill: z.ZodDate;
    version: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    version: number;
    key: {
      waSenderId: string;
      bucketId: string;
      windowStart: Date;
    };
    tokens: number;
    lastRefill: Date;
  },
  {
    version: number;
    key: {
      waSenderId: string;
      bucketId: string;
      windowStart: Date;
    };
    tokens: number;
    lastRefill: Date;
  }
>;
export type RateLimitState = z.infer<typeof zRateLimitState>;
//# sourceMappingURL=messaging.d.ts.map
