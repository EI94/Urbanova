import {
  zTwilioInbound,
  zChatReply,
  zRateLimitResult,
  zRateLimitConfig,
  zRateLimitKey,
  zRateLimitState,
} from '../messaging';

describe('Messaging Types Validation', () => {
  describe('zTwilioInbound', () => {
    it('should validate valid Twilio inbound payload', () => {
      const validPayload = {
        Body: 'Scansiona questo annuncio: https://example.com',
        From: 'whatsapp:+393331234567',
        MessageSid: 'msg-123',
        AccountSid: 'acc-123',
        To: 'whatsapp:+1234567890',
        WaId: '393331234567',
        ProfileName: 'Mario Rossi',
      };

      const result = zTwilioInbound.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidPayload = {
        Body: 'Test message',
        // Missing From, MessageSid, AccountSid
      };

      const result = zTwilioInbound.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(3);
      }
    });

    it('should accept optional fields', () => {
      const minimalPayload = {
        Body: 'Test message',
        From: 'whatsapp:+393331234567',
        MessageSid: 'msg-123',
        AccountSid: 'acc-123',
      };

      const result = zTwilioInbound.safeParse(minimalPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('zChatReply', () => {
    it('should validate valid chat reply', () => {
      const validReply = {
        to: 'whatsapp:+393331234567',
        body: 'Deal Memo pronto! ROI 15%, Payback 5 anni.',
        mediaUrl: 'https://storage.googleapis.com/bucket/memo.pdf',
        from: 'whatsapp:+1234567890',
        statusCallback: 'https://api.example.com/webhooks/twilio/status',
      };

      const result = zChatReply.safeParse(validReply);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidReply = {
        body: 'Test message',
        // Missing 'to'
      };

      const result = zChatReply.safeParse(invalidReply);
      expect(result.success).toBe(false);
    });

    it('should accept minimal reply', () => {
      const minimalReply = {
        to: 'whatsapp:+393331234567',
        body: 'Test message',
      };

      const result = zChatReply.safeParse(minimalReply);
      expect(result.success).toBe(true);
    });
  });

  describe('zRateLimitResult', () => {
    it('should validate valid rate limit result', () => {
      const validResult = {
        allowed: true,
        remaining: 5,
        resetTime: new Date(),
        limit: 10,
        window: 20,
      };

      const result = zRateLimitResult.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should validate rate limited result', () => {
      const limitedResult = {
        allowed: false,
        remaining: 0,
        resetTime: new Date(Date.now() + 30000), // 30 seconds from now
        retryAfter: 30,
        limit: 10,
        window: 20,
      };

      const result = zRateLimitResult.safeParse(limitedResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid values', () => {
      const invalidResult = {
        allowed: true,
        remaining: -1, // Cannot be negative
        resetTime: new Date(),
        limit: 10,
        window: 20,
      };

      const result = zRateLimitResult.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });
  });

  describe('zRateLimitConfig', () => {
    it('should validate valid config', () => {
      const validConfig = {
        capacity: 15,
        refillRate: 2,
        windowSeconds: 30,
        burstSize: 20,
      };

      const result = zRateLimitConfig.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const minimalConfig = {};

      const result = zRateLimitConfig.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.capacity).toBe(10);
        expect(result.data.refillRate).toBe(1);
        expect(result.data.windowSeconds).toBe(20);
        expect(result.data.burstSize).toBe(15);
      }
    });

    it('should reject invalid refill rate', () => {
      const invalidConfig = {
        refillRate: 0, // Must be > 0
      };

      const result = zRateLimitConfig.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('zRateLimitKey', () => {
    it('should validate valid rate limit key', () => {
      const validKey = {
        waSenderId: 'whatsapp:+393331234567',
        bucketId: 'default',
        windowStart: new Date(),
      };

      const result = zRateLimitKey.safeParse(validKey);
      expect(result.success).toBe(true);
    });

    it('should reject empty strings', () => {
      const invalidKey = {
        waSenderId: '',
        bucketId: 'default',
        windowStart: new Date(),
      };

      const result = zRateLimitKey.safeParse(invalidKey);
      expect(result.success).toBe(false);
    });
  });

  describe('zRateLimitState', () => {
    it('should validate valid rate limit state', () => {
      const validState = {
        key: {
          waSenderId: 'whatsapp:+393331234567',
          bucketId: 'default',
          windowStart: new Date(),
        },
        tokens: 8,
        lastRefill: new Date(),
        version: 1,
      };

      const result = zRateLimitState.safeParse(validState);
      expect(result.success).toBe(true);
    });

    it('should reject negative tokens', () => {
      const invalidState = {
        key: {
          waSenderId: 'whatsapp:+393331234567',
          bucketId: 'default',
          windowStart: new Date(),
        },
        tokens: -1, // Cannot be negative
        lastRefill: new Date(),
        version: 1,
      };

      const result = zRateLimitState.safeParse(invalidState);
      expect(result.success).toBe(false);
    });
  });
});
