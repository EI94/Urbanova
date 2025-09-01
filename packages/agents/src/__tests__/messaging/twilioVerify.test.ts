import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  verifyTwilioSignature,
  verifyTwilioWebhook,
  shouldBypassVerification,
  getTwilioAuthToken,
} from '../../messaging/twilioVerify';

describe('Twilio Verification', () => {
  const mockAuthToken = 'test_auth_token_123';
  const mockUrl = 'https://api.example.com/webhook';
  const mockSignature = 'valid_signature_base64';

  beforeEach(() => {
    // Reset environment variables
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.ALLOW_UNVERIFIED_WEBHOOKS;
  });

  describe('verifyTwilioSignature', () => {
    it('should verify valid signature', () => {
      // Create a real signature for testing
      const crypto = require('crypto');
      const params = { Body: 'Test message', From: '+1234567890' };
      const sortedParams = Object.keys(params)
        .sort()
        .reduce((acc: Record<string, string>, key) => {
          acc[key] = params[key as keyof typeof params];
          return acc;
        }, {});

      const paramString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}${value}`)
        .join('');

      const stringToSign = mockUrl + paramString;
      const validSignature = crypto
        .createHmac('sha1', mockAuthToken)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest('base64');

      const result = verifyTwilioSignature(mockAuthToken, validSignature, mockUrl, params);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid signature', () => {
      const params = { Body: 'Test message', From: '+1234567890' };
      const result = verifyTwilioSignature(mockAuthToken, 'invalid_signature', mockUrl, params);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing auth token', () => {
      const params = { Body: 'Test message', From: '+1234567890' };
      const result = verifyTwilioSignature('', mockSignature, mockUrl, params);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing Twilio auth token');
    });

    it('should handle missing signature', () => {
      const params = { Body: 'Test message', From: '+1234567890' };
      const result = verifyTwilioSignature(mockAuthToken, '', mockUrl, params);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing Twilio signature header');
    });

    it('should handle empty parameters', () => {
      const result = verifyTwilioSignature(mockAuthToken, mockSignature, mockUrl, {});

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('verifyTwilioWebhook', () => {
    it('should verify webhook with valid body', () => {
      const body =
        'Body=Test+message&From=whatsapp%3A%2B393331234567&MessageSid=msg-123&AccountSid=acc-123';

      // Create a real signature for testing
      const crypto = require('crypto');
      const params = new URLSearchParams(body);
      const paramsObj: Record<string, string> = {};

      for (const [key, value] of Array.from(params.entries())) {
        paramsObj[key] = value || '';
      }

      const sortedParams = Object.keys(paramsObj)
        .sort()
        .reduce((acc: Record<string, string>, key) => {
          acc[key] = paramsObj[key] || '';
          return acc;
        }, {});

      const paramString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}${value}`)
        .join('');

      const stringToSign = mockUrl + paramString;
      const validSignature = crypto
        .createHmac('sha1', mockAuthToken)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest('base64');

      const result = verifyTwilioWebhook(mockAuthToken, validSignature, mockUrl, body);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle malformed body', () => {
      const malformedBody = 'invalid=body=format';

      const result = verifyTwilioWebhook(mockAuthToken, mockSignature, mockUrl, malformedBody);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Verification error');
    });

    it('should handle empty body', () => {
      const result = verifyTwilioWebhook(mockAuthToken, mockSignature, mockUrl, '');

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('shouldBypassVerification', () => {
    it('should return false by default', () => {
      delete process.env.ALLOW_UNVERIFIED_WEBHOOKS;

      const result = shouldBypassVerification();

      expect(result).toBe(false);
    });

    it('should return true when ALLOW_UNVERIFIED_WEBHOOKS is true', () => {
      process.env.ALLOW_UNVERIFIED_WEBHOOKS = 'true';

      const result = shouldBypassVerification();

      expect(result).toBe(true);
    });

    it('should return false when ALLOW_UNVERIFIED_WEBHOOKS is false', () => {
      process.env.ALLOW_UNVERIFIED_WEBHOOKS = 'false';

      const result = shouldBypassVerification();

      expect(result).toBe(false);
    });

    it('should return false when ALLOW_UNVERIFIED_WEBHOOKS is invalid', () => {
      process.env.ALLOW_UNVERIFIED_WEBHOOKS = 'invalid';

      const result = shouldBypassVerification();

      expect(result).toBe(false);
    });
  });

  describe('getTwilioAuthToken', () => {
    it('should return undefined when TWILIO_AUTH_TOKEN is not set', () => {
      delete process.env.TWILIO_AUTH_TOKEN;

      const result = getTwilioAuthToken();

      expect(result).toBeUndefined();
    });

    it('should return TWILIO_AUTH_TOKEN when set', () => {
      process.env.TWILIO_AUTH_TOKEN = 'test_token_123';

      const result = getTwilioAuthToken();

      expect(result).toBe('test_token_123');
    });

    it('should return empty string when TWILIO_AUTH_TOKEN is empty', () => {
      process.env.TWILIO_AUTH_TOKEN = '';

      const result = getTwilioAuthToken();

      expect(result).toBe('');
    });
  });

  describe('Error handling', () => {
    it('should handle crypto errors gracefully', () => {
      const params = { Body: 'Test message', From: '+1234567890' };

      // Mock crypto to throw an error
      const originalCrypto = global.crypto;
      global.crypto = undefined as any;

      const result = verifyTwilioSignature(mockAuthToken, mockSignature, mockUrl, params);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Verification error');

      // Restore crypto
      global.crypto = originalCrypto;
    });

    it('should handle URLSearchParams errors gracefully', () => {
      const invalidBody = 'invalid%20body%20with%20invalid%20encoding';

      const result = verifyTwilioWebhook(mockAuthToken, mockSignature, mockUrl, invalidBody);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
